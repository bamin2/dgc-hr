-- Allow loan deletion with cascade to installments
ALTER TABLE public.loan_installments 
DROP CONSTRAINT IF EXISTS loan_installments_loan_id_fkey;

ALTER TABLE public.loan_installments 
ADD CONSTRAINT loan_installments_loan_id_fkey 
  FOREIGN KEY (loan_id) REFERENCES public.loans(id) ON DELETE CASCADE;

-- Add RLS policy for loan deletion
CREATE POLICY "Authenticated users can delete loans"
ON public.loans FOR DELETE
TO authenticated
USING (true);

-- Add column to track ad hoc payments on installments
ALTER TABLE public.loan_installments 
ADD COLUMN IF NOT EXISTS is_partial_payment BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS original_amount NUMERIC(12,2);