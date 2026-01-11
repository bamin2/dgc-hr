-- Add columns to support DOCX templates
ALTER TABLE offer_letter_templates 
ADD COLUMN template_type text NOT NULL DEFAULT 'html' CHECK (template_type IN ('html', 'docx')),
ADD COLUMN docx_template_url text,
ADD COLUMN docx_original_filename text;

-- Make body_template and subject_template nullable for DOCX templates
ALTER TABLE offer_letter_templates ALTER COLUMN body_template DROP NOT NULL;
ALTER TABLE offer_letter_templates ALTER COLUMN subject_template DROP NOT NULL;