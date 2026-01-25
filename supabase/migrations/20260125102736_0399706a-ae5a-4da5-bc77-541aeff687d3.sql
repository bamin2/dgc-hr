-- Add expiry date for employee insurance cards
ALTER TABLE public.benefit_enrollments
ADD COLUMN insurance_card_expiry_date DATE;

-- Add expiry date for dependent insurance cards  
ALTER TABLE public.benefit_beneficiaries
ADD COLUMN insurance_card_expiry_date DATE;

-- Add comment for documentation
COMMENT ON COLUMN public.benefit_enrollments.insurance_card_expiry_date IS 'Expiry date for employee insurance card';
COMMENT ON COLUMN public.benefit_beneficiaries.insurance_card_expiry_date IS 'Expiry date for dependent insurance card';