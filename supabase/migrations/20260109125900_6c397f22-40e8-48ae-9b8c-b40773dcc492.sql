-- Rename dashboard_icon_url to dashboard_icon_name for storing icon names instead of URLs
ALTER TABLE public.company_settings 
RENAME COLUMN dashboard_icon_url TO dashboard_icon_name;