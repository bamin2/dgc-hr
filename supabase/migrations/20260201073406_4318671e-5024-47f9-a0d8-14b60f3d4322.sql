-- Create the upsert_notification function that consolidates notifications for the same entity
-- This ensures that when a leave request status changes, the requester sees one updated notification
-- instead of multiple notifications (submitted → approved/rejected)

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
SET search_path = public
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

-- Add index to improve lookup performance for entity-based notification consolidation
CREATE INDEX IF NOT EXISTS idx_notifications_entity_lookup 
ON notifications ((metadata->>'entity_type'), (metadata->>'entity_id'), user_id);