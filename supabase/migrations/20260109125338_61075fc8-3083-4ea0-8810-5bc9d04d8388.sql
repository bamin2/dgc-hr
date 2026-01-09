-- Add columns for dashboard display type and icon URL
ALTER TABLE public.company_settings 
ADD COLUMN IF NOT EXISTS dashboard_display_type text DEFAULT 'logo',
ADD COLUMN IF NOT EXISTS dashboard_icon_url text;