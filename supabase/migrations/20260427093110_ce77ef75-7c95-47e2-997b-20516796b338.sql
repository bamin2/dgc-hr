ALTER TABLE public.loans
  ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'staff_loan',
  ADD COLUMN IF NOT EXISTS deduction_name text;

ALTER TABLE public.loans
  DROP CONSTRAINT IF EXISTS loans_category_check;

ALTER TABLE public.loans
  ADD CONSTRAINT loans_category_check
  CHECK (category IN ('staff_loan', 'other_deduction'));