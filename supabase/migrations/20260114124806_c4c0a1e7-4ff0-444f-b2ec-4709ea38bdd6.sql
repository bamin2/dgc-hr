-- Update check constraint to include business_trip
ALTER TABLE approval_workflows 
DROP CONSTRAINT approval_workflows_request_type_check;

ALTER TABLE approval_workflows 
ADD CONSTRAINT approval_workflows_request_type_check 
CHECK (request_type = ANY (ARRAY['time_off'::text, 'loan'::text, 'hr_letter'::text, 'business_trip'::text]));

-- Also update request_approval_steps if it has a similar constraint
ALTER TABLE request_approval_steps 
DROP CONSTRAINT IF EXISTS request_approval_steps_request_type_check;

ALTER TABLE request_approval_steps 
ADD CONSTRAINT request_approval_steps_request_type_check 
CHECK (request_type = ANY (ARRAY['time_off'::text, 'loan'::text, 'hr_letter'::text, 'business_trip'::text]));

-- Insert default business_trip workflow
INSERT INTO approval_workflows (request_type, is_active, steps, default_hr_approver_id)
VALUES (
  'business_trip',
  true,
  '[{"step": 1, "approver": "manager", "fallback": "hr"}, {"step": 2, "approver": "hr"}]'::jsonb,
  NULL
)
ON CONFLICT (request_type) DO NOTHING;