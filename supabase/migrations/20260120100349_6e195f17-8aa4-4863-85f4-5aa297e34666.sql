-- Add email_logo_url column for separate email branding
ALTER TABLE public.company_settings 
ADD COLUMN email_logo_url TEXT;