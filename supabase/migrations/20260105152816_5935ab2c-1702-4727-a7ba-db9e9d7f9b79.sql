-- Create company_settings table
CREATE TABLE public.company_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL DEFAULT 'My Company',
  legal_name TEXT,
  industry TEXT,
  company_size TEXT,
  tax_id TEXT,
  year_founded TEXT,
  email TEXT,
  phone TEXT,
  website TEXT,
  -- Address fields (flattened for simpler queries)
  address_street TEXT,
  address_city TEXT,
  address_state TEXT,
  address_zip_code TEXT,
  address_country TEXT,
  -- Branding settings
  logo_url TEXT,
  primary_color TEXT DEFAULT '#804EEC',
  timezone TEXT DEFAULT 'America/Los_Angeles',
  date_format TEXT DEFAULT 'MM/DD/YYYY',
  currency TEXT DEFAULT 'USD',
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read company settings
CREATE POLICY "Authenticated users can view company settings"
  ON public.company_settings FOR SELECT
  USING (true);

-- Only HR and Admin can modify company settings
CREATE POLICY "HR and Admin can update company settings"
  ON public.company_settings FOR UPDATE
  USING (has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role]));

CREATE POLICY "HR and Admin can insert company settings"
  ON public.company_settings FOR INSERT
  WITH CHECK (has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role]));

-- Insert default settings row (singleton pattern - one row per company)
INSERT INTO public.company_settings (
  id, name, legal_name, industry, company_size, primary_color
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'My Company',
  'My Company Inc.',
  'Technology',
  '51-200',
  '#804EEC'
);

-- Trigger to update updated_at timestamp
CREATE TRIGGER update_company_settings_updated_at
  BEFORE UPDATE ON public.company_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();