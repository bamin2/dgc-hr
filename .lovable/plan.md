
# Dynamic Notification Updates (Consolidation Pattern)

## Problem Statement
When a user submits a leave request, they receive a "Leave Request Submitted" notification. Later, when the request is approved/rejected, they receive a separate "Leave Request Approved/Rejected" notification. This results in redundant notifications for the same entity - the user doesn't need both, only the most recent status.

## Current Behavior
```text
1. User submits leave request
   → Creates notification: "Leave Request Submitted" (entity_id = "lr-001")

2. Leave request gets approved
   → Creates NEW notification: "Leave Request Approved" (entity_id = "lr-001")
   
User sees BOTH notifications:
┌──────────────────────────────────────┐
│ 🔔 Leave Request Approved            │
│ Your vacation request has been...    │
│ 2 minutes ago                        │
├──────────────────────────────────────┤
│ 🔔 Leave Request Submitted           │  ← Redundant!
│ Your vacation request for 3 days...  │
│ 1 hour ago                           │
└──────────────────────────────────────┘
```

## Proposed Behavior (Dynamic Updates)
```text
1. User submits leave request
   → Creates notification: "Leave Request Submitted" (entity_id = "lr-001")

2. Leave request gets approved
   → UPDATES existing notification to: "Leave Request Approved"
   → Updates title, message, severity, event_key, timestamp, marks as unread
   
User sees ONE notification (always the latest state):
┌──────────────────────────────────────┐
│ 🔔 Leave Request Approved            │
│ Your vacation request has been...    │
│ 2 minutes ago                        │
└──────────────────────────────────────┘
```

## Solution: "Upsert Notification" Pattern

Instead of always inserting new notifications, we implement an "upsert" pattern that:
1. Checks if a notification already exists for the same `entity_type` + `entity_id` + `user_id`
2. If found → **Update** the existing notification with new content
3. If not found → **Insert** a new notification

### Key Fields to Update on State Change
- `title` - New status title
- `message` - New status message  
- `priority` - May change (e.g., rejected = high priority)
- `is_read` - Reset to `false` (so user sees the update)
- `created_at` - Reset to `now()` (so it appears at the top)
- `metadata.severity` - Update (info → success/danger)
- `metadata.event_key` - Update (leave.submitted → leave.approved)

### Which Notifications Should Consolidate?
Only notifications for the **same entity** sent to the **same user**:

| Entity Type | Events That Consolidate |
|-------------|------------------------|
| `leave_request` | submitted → approved/rejected |
| `business_trip` | submitted → manager_approved → approved/rejected |
| `loan` | submitted → approved/rejected |
| `attendance_correction` | submitted → approved/rejected |

**Does NOT consolidate:**
- Notifications to different users (approver's "New Leave Request" is separate from requester's "Submitted")
- Different entity IDs

## Implementation

### Step 1: Create Database Function for Upsert

Create a database function `upsert_notification` that handles the consolidation logic:

```sql
CREATE OR REPLACE FUNCTION public.upsert_notification(
  p_user_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_priority TEXT DEFAULT 'medium',
  p_action_url TEXT DEFAULT NULL,
  p_actor_name TEXT DEFAULT NULL,
  p_actor_avatar TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
) RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_entity_type TEXT;
  v_entity_id TEXT;
  v_existing_id UUID;
  v_result_id UUID;
BEGIN
  -- Extract entity info from metadata
  v_entity_type := p_metadata->>'entity_type';
  v_entity_id := p_metadata->>'entity_id';
  
  -- If no entity info, just insert (no consolidation possible)
  IF v_entity_type IS NULL OR v_entity_id IS NULL THEN
    INSERT INTO notifications (user_id, type, title, message, priority, action_url, actor_name, actor_avatar, metadata, is_read, created_at)
    VALUES (p_user_id, p_type, p_title, p_message, p_priority, p_action_url, p_actor_name, p_actor_avatar, p_metadata, false, now())
    RETURNING id INTO v_result_id;
    RETURN v_result_id;
  END IF;
  
  -- Look for existing notification for same entity + user
  SELECT id INTO v_existing_id
  FROM notifications
  WHERE user_id = p_user_id
    AND metadata->>'entity_type' = v_entity_type
    AND metadata->>'entity_id' = v_entity_id
  ORDER BY created_at DESC
  LIMIT 1;
  
  IF v_existing_id IS NOT NULL THEN
    -- Update existing notification
    UPDATE notifications
    SET 
      title = p_title,
      message = p_message,
      priority = p_priority,
      action_url = COALESCE(p_action_url, action_url),
      actor_name = COALESCE(p_actor_name, actor_name),
      actor_avatar = COALESCE(p_actor_avatar, actor_avatar),
      metadata = p_metadata,
      is_read = false,  -- Mark as unread so user sees the update
      created_at = now()  -- Reset timestamp to appear at top
    WHERE id = v_existing_id;
    
    RETURN v_existing_id;
  ELSE
    -- Insert new notification
    INSERT INTO notifications (user_id, type, title, message, priority, action_url, actor_name, actor_avatar, metadata, is_read, created_at)
    VALUES (p_user_id, p_type, p_title, p_message, p_priority, p_action_url, p_actor_name, p_actor_avatar, p_metadata, false, now())
    RETURNING id INTO v_result_id;
    
    RETURN v_result_id;
  END IF;
END;
$$;
```

### Step 2: Create Helper Function for Edge Functions

Update `supabase/functions/_shared/notificationHelpers.ts` to add a new function:

```typescript
/**
 * Create or update a notification for an entity.
 * If a notification already exists for the same entity_type + entity_id + user,
 * it will be updated instead of creating a duplicate.
 */
export async function upsertNotification(
  supabase: SupabaseClient,
  params: CreateNotificationParams
): Promise<{ success: boolean; notificationId?: string; error?: string }> {
  const { userId, type, priority, title, message, actionUrl, actorName, actorAvatar, metadata } = params;
  
  const { data, error } = await supabase.rpc('upsert_notification', {
    p_user_id: userId,
    p_type: type,
    p_title: title,
    p_message: message,
    p_priority: priority || 'medium',
    p_action_url: actionUrl,
    p_actor_name: actorName || null,
    p_actor_avatar: actorAvatar || null,
    p_metadata: metadata,
  });
  
  if (error) {
    console.error('Failed to upsert notification:', error);
    return { success: false, error: error.message };
  }
  
  return { success: true, notificationId: data };
}
```

### Step 3: Update send-email Edge Function

Modify `supabase/functions/send-email/index.ts` to use `upsertNotification` instead of `insert` for **requester notifications** (the person whose request status is changing):

```typescript
// Before (creates duplicate):
await supabase.from("notifications").insert({
  user_id: requesterUserId,
  type: "approval",
  title: "Leave Request Approved",
  ...
});

// After (updates existing):
await supabase.rpc('upsert_notification', {
  p_user_id: requesterUserId,
  p_type: "approval",
  p_title: "Leave Request Approved",
  ...
});
```

**Important**: We only use upsert for the **requester's** notifications. The **approver's** notification ("New Leave Request") should remain separate since it's for a different purpose (action required vs status update).

### Step 4: Update Client-Side Service

Add `upsertNotification` to `src/lib/notificationService.ts` for any client-side notification creation:

```typescript
export async function upsertNotification(params: CreateNotificationParams): Promise<{ success: boolean; error?: string }> {
  const { data, error } = await supabase.rpc('upsert_notification', {
    p_user_id: params.userId,
    p_type: params.type,
    p_title: params.title,
    p_message: params.message,
    p_priority: params.priority || 'medium',
    p_action_url: params.actionUrl,
    p_actor_name: params.actorName || null,
    p_actor_avatar: params.actorAvatar || null,
    p_metadata: params.metadata,
  });
  
  if (error) return { success: false, error: error.message };
  return { success: true };
}
```

## Files to Modify

| File | Action | Description |
|------|--------|-------------|
| Database Migration | Create | Add `upsert_notification` function |
| `supabase/functions/_shared/notificationHelpers.ts` | Update | Add `upsertNotification` helper function |
| `supabase/functions/send-email/index.ts` | Update | Use upsert for requester status notifications |
| `supabase/functions/handle-email-action/index.ts` | Update | Use upsert for approval/rejection notifications |
| `src/lib/notificationService.ts` | Update | Add client-side `upsertNotification` function |

## Visual Comparison

```text
BEFORE (Duplicate notifications):
┌─────────────────────────────────────────────────────────┐
│ Notifications (3)                                       │
├─────────────────────────────────────────────────────────┤
│ 🟢 Leave Request Approved                    2 min ago  │
│    Your vacation request has been approved              │
├─────────────────────────────────────────────────────────┤
│ ⏳ Leave Request Submitted                   1 hour ago │
│    Your vacation request for 3 days has been submitted  │
├─────────────────────────────────────────────────────────┤
│ 📄 Payslip Available                        2 days ago  │
│    Your January 2026 payslip is ready                   │
└─────────────────────────────────────────────────────────┘

AFTER (Dynamic updates - consolidated):
┌─────────────────────────────────────────────────────────┐
│ Notifications (2)                                       │
├─────────────────────────────────────────────────────────┤
│ 🟢 Leave Request Approved                    2 min ago  │  ← Updated!
│    Your vacation request has been approved              │
├─────────────────────────────────────────────────────────┤
│ 📄 Payslip Available                        2 days ago  │
│    Your January 2026 payslip is ready                   │
└─────────────────────────────────────────────────────────┘
```

## Edge Cases Handled

1. **Multiple leave requests**: Each has a unique `entity_id`, so they won't interfere with each other
2. **Different entity types**: A leave request and a loan request are never consolidated (different `entity_type`)
3. **Approver vs requester**: Approver gets their own notification chain (different `user_id`)
4. **Notifications without entity info**: Fall back to regular insert (no consolidation)
5. **Archived notifications**: The upsert finds the most recent one regardless of archived status

## Technical Notes

- The `created_at` reset ensures updated notifications appear at the top of the list
- Setting `is_read = false` on update ensures users see important status changes
- The database function runs with `SECURITY DEFINER` to bypass RLS for the lookup
- Index on `(user_id, metadata->>'entity_type', metadata->>'entity_id')` could improve performance
