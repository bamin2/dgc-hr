
# Fix: Leave Request Stuck as Pending After Email Approval

## Problem Summary
Bader's leave request (March 25-26) is stuck as "pending" even though Nicy approved it via email. The approval workflow has 2 HR steps, both assigned to the same approver (Nicy). When step 1 was approved, step 2 was activated but **no email notification was sent for step 2**, leaving the request in limbo.

## Root Cause Analysis

### Technical Flow That Occurred:
```text
1. Bader submits leave request
2. System creates 2 approval steps:
   - Step 1: HR (Nicy) - status: "pending"
   - Step 2: HR (Nicy) - status: "queued"
3. Email sent to Nicy for step 1
4. Nicy clicks "Approve" in email
5. Edge function (handle-email-action):
   a. Marks step 1 as "approved" ✓
   b. Finds step 2 with status "queued"
   c. Updates step 2 to "pending" ✓
   d. Does NOT send approval email for step 2 ✗  <-- BUG
6. Step 2 is pending, no one knows, request stuck
```

### The Bug Location
**File**: `supabase/functions/handle-email-action/index.ts` (lines 312-317)

When activating the next step, the edge function only updates the status but doesn't notify the next approver:
```typescript
if (nextStepData) {
  // Activate the next step
  await supabase
    .from("request_approval_steps")
    .update({ status: "pending" })
    .eq("id", (nextStepData as { id: string }).id);
  // ❌ Missing: Send email to next step's approver
} else {
  // ... finalize the request
}
```

### Secondary Issue: Workflow Configuration
The current time_off workflow has a redundant configuration:
```json
{
  "steps": [
    {"approver": "hr", "fallback": "hr", "step": 1},
    {"approver": "hr", "step": 2}
  ]
}
```
Both steps assign to the same HR approver (Nicy), which creates unnecessary friction.

## Proposed Fix

### 1. Update Edge Function to Send Email for Next Step
When activating step 2 (or any subsequent step), send an approval request email to the new approver.

```typescript
if (nextStepData) {
  // Activate the next step
  await supabase
    .from("request_approval_steps")
    .update({ status: "pending" })
    .eq("id", (nextStepData as { id: string }).id);
  
  // NEW: Send approval request email for the next step
  await supabase.functions.invoke("send-email", {
    body: {
      type: "leave_request_submitted",
      leaveRequestId: step.request_id,
    },
  });
}
```

### 2. Immediate Data Fix (One-Time SQL)
To unblock Bader's current request, we can either:

**Option A**: Manually approve the request (recommended for this case since both steps have the same approver):
```sql
-- Update step 2 to approved
UPDATE request_approval_steps 
SET status = 'approved', 
    acted_at = NOW(), 
    acted_by = 'f0265a57-9145-47ae-ab37-9d688e1730ef'  -- Nicy's user_id
WHERE id = 'f541adb0-f891-486a-bc09-d5c7669d9c31';

-- Update the leave request to approved
UPDATE leave_requests 
SET status = 'approved', 
    reviewed_at = NOW(),
    reviewed_by = 'f0265a57-9145-47ae-ab37-9d688e1730ef'
WHERE id = '47433a64-8a7d-4164-b292-84293ce27f42';
```

**Option B**: Let Nicy approve step 2 through the app (it will show in her pending approvals)

### 3. (Optional) Simplify Workflow Configuration
Reduce the time_off workflow to a single step since both steps currently go to the same approver:
```json
{
  "steps": [
    {"approver": "hr", "fallback": "hr", "step": 1}
  ]
}
```

This can be done through the Settings > Approval Workflows page.

## Implementation Details

### File to Modify
| File | Changes |
|------|---------|
| `supabase/functions/handle-email-action/index.ts` | Add email notification when activating next approval step |

### Code Changes

In the approval processing section (around line 312-317), after activating the next step:

```typescript
if (nextStepData) {
  // Activate the next step
  await supabase
    .from("request_approval_steps")
    .update({ status: "pending" })
    .eq("id", (nextStepData as { id: string }).id);
  
  // Send approval request email to the next approver
  // This reuses the existing "leave_request_submitted" email type
  // which looks up the current pending step and sends to its approver
  try {
    await supabase.functions.invoke("send-email", {
      body: {
        type: "leave_request_submitted",
        leaveRequestId: step.request_id,
      },
    });
    console.log("Sent approval email for next step");
  } catch (emailError) {
    console.error("Failed to send email for next step:", emailError);
    // Continue even if email fails - the step is still activated
  }
}
```

### Testing Plan
1. Submit a new leave request when workflow has 2 steps
2. Approve step 1 via email
3. Verify step 2 becomes pending AND approver receives email
4. Approve step 2 via email or app
5. Verify leave request is finalized as "approved"

## Visual Summary

```text
BEFORE (Current Bug):
Step 1 approved → Step 2 activated → No email → Request stuck

AFTER (Fixed):
Step 1 approved → Step 2 activated → Email sent → Approver acts → Request finalized
```

## Immediate Action Required
To unblock Bader's request now, either:
1. Nicy can approve step 2 through the app's "Pending Approvals" section, OR
2. Run the SQL commands above to manually approve
