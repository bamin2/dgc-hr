-- Add passport_number and cpr_number columns to employees table
ALTER TABLE public.employees
ADD COLUMN passport_number TEXT,
ADD COLUMN cpr_number TEXT;