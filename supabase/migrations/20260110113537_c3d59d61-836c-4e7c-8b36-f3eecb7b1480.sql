-- Phase 1: Multi-Currency Database Schema Changes

-- First, fix the GOSI data inconsistency that's blocking updates
-- Set gosi_registered_salary to the employee's salary for those with is_subject_to_gosi=true but NULL gosi_registered_salary
UPDATE public.employees 
SET gosi_registered_salary = salary
WHERE is_subject_to_gosi = true 
AND gosi_registered_salary IS NULL 
AND salary IS NOT NULL;

-- For any remaining (salary also NULL), set is_subject_to_gosi to false
UPDATE public.employees 
SET is_subject_to_gosi = false
WHERE is_subject_to_gosi = true 
AND gosi_registered_salary IS NULL;

-- 1.1 Add salary_currency_code to employees table
ALTER TABLE public.employees 
ADD COLUMN IF NOT EXISTS salary_currency_code TEXT;

-- Backfill salary_currency_code from work location currency
UPDATE public.employees e
SET salary_currency_code = wl.currency
FROM public.work_locations wl
WHERE e.work_location_id = wl.id
AND e.salary_currency_code IS NULL
AND wl.currency IS NOT NULL;

-- Set default BHD for employees without work location currency
UPDATE public.employees
SET salary_currency_code = 'BHD'
WHERE salary_currency_code IS NULL;

-- 1.2 Create fx_rates table for currency conversion
CREATE TABLE IF NOT EXISTS public.fx_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  base_currency_code TEXT NOT NULL DEFAULT 'BHD',
  quote_currency_code TEXT NOT NULL,
  rate NUMERIC(18, 6) NOT NULL CHECK (rate > 0),
  effective_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(base_currency_code, quote_currency_code, effective_date)
);

-- Enable RLS on fx_rates
ALTER TABLE public.fx_rates ENABLE ROW LEVEL SECURITY;

-- HR and Admin can manage FX rates (all operations)
CREATE POLICY "HR and Admin can manage FX rates" ON public.fx_rates
FOR ALL TO authenticated
USING (public.has_any_role(auth.uid(), ARRAY['hr', 'admin']::public.app_role[]));

-- All authenticated users can view FX rates (for report display)
CREATE POLICY "Authenticated users can view FX rates" ON public.fx_rates
FOR SELECT TO authenticated
USING (true);

-- Create trigger to update updated_at
CREATE TRIGGER update_fx_rates_updated_at
BEFORE UPDATE ON public.fx_rates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 1.3 Add reporting_currency to company_settings
ALTER TABLE public.company_settings 
ADD COLUMN IF NOT EXISTS reporting_currency TEXT DEFAULT 'BHD';

-- Insert default SAR rate for initial setup (1 BHD = 9.94 SAR approximately)
INSERT INTO public.fx_rates (base_currency_code, quote_currency_code, rate, effective_date)
VALUES ('BHD', 'SAR', 9.94, CURRENT_DATE)
ON CONFLICT (base_currency_code, quote_currency_code, effective_date) DO NOTHING;