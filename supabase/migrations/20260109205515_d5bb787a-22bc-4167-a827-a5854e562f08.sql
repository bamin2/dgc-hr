-- Add document_logo_url column for document generation and email templates
ALTER TABLE public.company_settings 
ADD COLUMN document_logo_url TEXT DEFAULT NULL;

-- Add comment for clarity
COMMENT ON COLUMN public.company_settings.document_logo_url IS 'Logo used in generated documents and email templates. Falls back to logo_url if not set.';