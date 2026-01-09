-- Add new columns for tracking allowance and deduction changes
ALTER TABLE public.salary_history
  ADD COLUMN IF NOT EXISTS previous_allowances JSONB,
  ADD COLUMN IF NOT EXISTS new_allowances JSONB,
  ADD COLUMN IF NOT EXISTS previous_deductions JSONB,
  ADD COLUMN IF NOT EXISTS new_deductions JSONB;

-- Add new change type enum values
ALTER TYPE public.salary_change_type ADD VALUE IF NOT EXISTS 'allowance_change';
ALTER TYPE public.salary_change_type ADD VALUE IF NOT EXISTS 'deduction_change';
ALTER TYPE public.salary_change_type ADD VALUE IF NOT EXISTS 'compensation_update';