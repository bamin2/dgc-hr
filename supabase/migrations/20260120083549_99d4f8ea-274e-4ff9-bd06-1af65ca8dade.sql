-- Add use_default_template column to email_templates
ALTER TABLE email_templates 
ADD COLUMN use_default_template BOOLEAN DEFAULT false;

-- Set existing leave templates to use default DGC-branded templates
UPDATE email_templates 
SET use_default_template = true
WHERE type LIKE 'leave_%';