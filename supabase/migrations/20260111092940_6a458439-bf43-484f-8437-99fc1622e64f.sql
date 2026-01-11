-- Add columns to track GOSI and other deductions separately
ALTER TABLE offer_versions 
ADD COLUMN IF NOT EXISTS is_subject_to_gosi boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS gosi_employee_amount numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS other_deductions numeric DEFAULT 0;