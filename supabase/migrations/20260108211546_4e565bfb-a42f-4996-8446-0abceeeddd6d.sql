-- Remove the check constraint that prevents storing both duration_months and installment_amount
-- The generate_loan_installments function calculates and stores both values, which is correct behavior
ALTER TABLE public.loans DROP CONSTRAINT IF EXISTS loans_repayment_method_check;