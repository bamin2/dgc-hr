-- Add insurance card URL columns for storing card copies

-- Add insurance_card_url to benefit_enrollments (for employee's card)
ALTER TABLE public.benefit_enrollments
ADD COLUMN insurance_card_url TEXT;

-- Add insurance_card_url to benefit_beneficiaries (for dependents' cards)
ALTER TABLE public.benefit_beneficiaries
ADD COLUMN insurance_card_url TEXT;

-- Add comment for documentation
COMMENT ON COLUMN public.benefit_enrollments.insurance_card_url IS 'URL to the employee insurance card image stored in benefit-documents bucket';
COMMENT ON COLUMN public.benefit_beneficiaries.insurance_card_url IS 'URL to the dependent insurance card image stored in benefit-documents bucket';