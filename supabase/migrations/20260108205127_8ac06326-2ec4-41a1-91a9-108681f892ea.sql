-- Create loans table
CREATE TABLE public.loans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE RESTRICT,
  requested_by uuid REFERENCES auth.users(id),
  created_by uuid REFERENCES auth.users(id),
  principal_amount numeric NOT NULL CHECK (principal_amount > 0),
  repayment_frequency text NOT NULL DEFAULT 'monthly',
  duration_months integer,
  installment_amount numeric,
  start_date date NOT NULL,
  deduct_from_payroll boolean NOT NULL DEFAULT true,
  status text NOT NULL DEFAULT 'requested',
  approved_by uuid REFERENCES auth.users(id),
  approved_at timestamptz,
  disbursed_at timestamptz,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT loans_repayment_method_check CHECK (
    (duration_months IS NOT NULL AND installment_amount IS NULL) OR
    (duration_months IS NULL AND installment_amount IS NOT NULL)
  ),
  CONSTRAINT loans_status_check CHECK (
    status IN ('requested', 'approved', 'rejected', 'active', 'closed', 'cancelled')
  )
);

-- Create loan_installments table
CREATE TABLE public.loan_installments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id uuid NOT NULL REFERENCES public.loans(id) ON DELETE CASCADE,
  installment_number integer NOT NULL,
  due_date date NOT NULL,
  amount numeric NOT NULL,
  status text NOT NULL DEFAULT 'due',
  paid_at timestamptz,
  paid_method text,
  paid_in_payroll_run_id uuid REFERENCES public.payroll_runs(id),
  created_at timestamptz DEFAULT now(),
  
  CONSTRAINT loan_installments_unique UNIQUE (loan_id, installment_number),
  CONSTRAINT loan_installments_status_check CHECK (
    status IN ('due', 'paid', 'skipped')
  ),
  CONSTRAINT loan_installments_paid_method_check CHECK (
    paid_method IS NULL OR paid_method IN ('payroll', 'manual')
  )
);

-- Create function to generate loan installments
CREATE OR REPLACE FUNCTION public.generate_loan_installments(loan_uuid uuid)
RETURNS void AS $$
DECLARE
  loan_record RECORD;
  calculated_duration integer;
  calculated_installment numeric;
  i integer;
  installment_due_date date;
  remaining_principal numeric;
  current_installment_amount numeric;
BEGIN
  SELECT * INTO loan_record FROM public.loans WHERE id = loan_uuid;
  
  IF loan_record IS NULL THEN
    RAISE EXCEPTION 'Loan not found';
  END IF;
  
  -- Calculate missing field
  IF loan_record.duration_months IS NOT NULL THEN
    calculated_duration := loan_record.duration_months;
    calculated_installment := ROUND(loan_record.principal_amount / calculated_duration, 2);
  ELSE
    calculated_installment := loan_record.installment_amount;
    calculated_duration := CEIL(loan_record.principal_amount / calculated_installment);
  END IF;
  
  -- Update loan with calculated values
  UPDATE public.loans 
  SET duration_months = calculated_duration,
      installment_amount = calculated_installment,
      updated_at = now()
  WHERE id = loan_uuid;
  
  -- Generate installments
  remaining_principal := loan_record.principal_amount;
  FOR i IN 1..calculated_duration LOOP
    installment_due_date := loan_record.start_date + ((i - 1) * INTERVAL '1 month')::interval;
    
    -- Last installment gets the remaining amount to handle rounding
    IF i = calculated_duration THEN
      current_installment_amount := remaining_principal;
    ELSE
      current_installment_amount := calculated_installment;
    END IF;
    
    remaining_principal := remaining_principal - current_installment_amount;
    
    INSERT INTO public.loan_installments (loan_id, installment_number, due_date, amount)
    VALUES (loan_uuid, i, installment_due_date, current_installment_amount);
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create function to check and close completed loans
CREATE OR REPLACE FUNCTION public.check_loan_completion()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if all installments are paid for this loan
  IF NOT EXISTS (
    SELECT 1 FROM public.loan_installments 
    WHERE loan_id = NEW.loan_id AND status = 'due'
  ) THEN
    UPDATE public.loans 
    SET status = 'closed', updated_at = now()
    WHERE id = NEW.loan_id AND status = 'active';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to auto-close loans when all installments are paid
CREATE TRIGGER check_loan_completion_trigger
AFTER UPDATE OF status ON public.loan_installments
FOR EACH ROW
WHEN (NEW.status = 'paid')
EXECUTE FUNCTION public.check_loan_completion();

-- Enable RLS
ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loan_installments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for loans
CREATE POLICY "Employees can view own loans"
ON public.loans FOR SELECT
USING (employee_id = get_user_employee_id(auth.uid()));

CREATE POLICY "Employees can request loans"
ON public.loans FOR INSERT
WITH CHECK (
  requested_by = auth.uid() AND 
  employee_id = get_user_employee_id(auth.uid()) AND
  status = 'requested'
);

CREATE POLICY "HR and Admin can view all loans"
ON public.loans FOR SELECT
USING (has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role]));

CREATE POLICY "HR and Admin can insert loans"
ON public.loans FOR INSERT
WITH CHECK (has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role]));

CREATE POLICY "HR and Admin can update loans"
ON public.loans FOR UPDATE
USING (has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role]));

CREATE POLICY "HR and Admin can delete loans"
ON public.loans FOR DELETE
USING (has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role]));

-- RLS Policies for loan_installments
CREATE POLICY "Employees can view own loan installments"
ON public.loan_installments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.loans 
    WHERE loans.id = loan_installments.loan_id 
    AND loans.employee_id = get_user_employee_id(auth.uid())
  )
);

CREATE POLICY "HR and Admin can view all loan installments"
ON public.loan_installments FOR SELECT
USING (has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role]));

CREATE POLICY "HR and Admin can insert loan installments"
ON public.loan_installments FOR INSERT
WITH CHECK (has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role]));

CREATE POLICY "HR and Admin can update loan installments"
ON public.loan_installments FOR UPDATE
USING (has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role]));

CREATE POLICY "HR and Admin can delete loan installments"
ON public.loan_installments FOR DELETE
USING (has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role]));

-- Create indexes for performance
CREATE INDEX idx_loans_employee_id ON public.loans(employee_id);
CREATE INDEX idx_loans_status ON public.loans(status);
CREATE INDEX idx_loan_installments_loan_id ON public.loan_installments(loan_id);
CREATE INDEX idx_loan_installments_due_date ON public.loan_installments(due_date);
CREATE INDEX idx_loan_installments_status ON public.loan_installments(status);