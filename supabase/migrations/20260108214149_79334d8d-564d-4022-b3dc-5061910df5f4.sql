-- Create loan_events table for event sourcing
CREATE TABLE public.loan_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id UUID NOT NULL REFERENCES public.loans(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('disburse', 'top_up', 'restructure', 'skip_installment', 'manual_payment', 'note')),
  effective_date DATE NOT NULL,
  amount_delta NUMERIC(12,2),
  new_installment_amount NUMERIC(12,2),
  new_duration_months INTEGER,
  affected_installment_id UUID REFERENCES public.loan_installments(id) ON DELETE SET NULL,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add columns to loan_installments for skip tracking
ALTER TABLE public.loan_installments 
  ADD COLUMN skipped_reason TEXT,
  ADD COLUMN rescheduled_from_installment_id UUID REFERENCES public.loan_installments(id) ON DELETE SET NULL,
  ADD COLUMN schedule_version INTEGER DEFAULT 1;

-- Enable RLS on loan_events
ALTER TABLE public.loan_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for loan_events
CREATE POLICY "HR and Admin can view all loan events"
  ON public.loan_events FOR SELECT
  USING (has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role]));

CREATE POLICY "Employees can view own loan events"
  ON public.loan_events FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.loans 
    WHERE loans.id = loan_events.loan_id 
    AND loans.employee_id = get_user_employee_id(auth.uid())
  ));

CREATE POLICY "HR and Admin can insert loan events"
  ON public.loan_events FOR INSERT
  WITH CHECK (has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role]));

CREATE POLICY "HR and Admin can update loan events"
  ON public.loan_events FOR UPDATE
  USING (has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role]));

CREATE POLICY "HR and Admin can delete loan events"
  ON public.loan_events FOR DELETE
  USING (has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role]));