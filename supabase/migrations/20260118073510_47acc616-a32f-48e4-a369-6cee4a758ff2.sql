-- Add national_id column to benefit_beneficiaries table
ALTER TABLE public.benefit_beneficiaries 
ADD COLUMN national_id TEXT NULL;