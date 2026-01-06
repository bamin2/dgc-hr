-- Make template references nullable for custom entries
ALTER TABLE public.employee_allowances 
  ALTER COLUMN allowance_template_id DROP NOT NULL;

ALTER TABLE public.employee_deductions 
  ALTER COLUMN deduction_template_id DROP NOT NULL;

-- Add name column for custom allowances/deductions
ALTER TABLE public.employee_allowances 
  ADD COLUMN custom_name TEXT;

ALTER TABLE public.employee_deductions 
  ADD COLUMN custom_name TEXT;

-- Add check constraints to ensure either template_id OR custom_name is provided
ALTER TABLE public.employee_allowances
  ADD CONSTRAINT chk_allowance_source 
  CHECK (allowance_template_id IS NOT NULL OR custom_name IS NOT NULL);

ALTER TABLE public.employee_deductions
  ADD CONSTRAINT chk_deduction_source 
  CHECK (deduction_template_id IS NOT NULL OR custom_name IS NOT NULL);