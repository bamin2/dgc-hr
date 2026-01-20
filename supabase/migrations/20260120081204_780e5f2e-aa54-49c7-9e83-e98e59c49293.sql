-- Add recipient_config column to email_templates table
ALTER TABLE email_templates 
ADD COLUMN IF NOT EXISTS recipient_config JSONB DEFAULT '{}';

-- Add comment for documentation
COMMENT ON COLUMN email_templates.recipient_config IS 'Configuration for additional email recipients: { send_to_manager: boolean, send_to_hr: boolean, custom_emails: string[] }';

-- Update existing leave templates with default config
UPDATE email_templates 
SET recipient_config = '{
  "send_to_manager": false,
  "send_to_hr": false,
  "custom_emails": []
}'::jsonb
WHERE type LIKE 'leave_%' AND (recipient_config IS NULL OR recipient_config = '{}'::jsonb);