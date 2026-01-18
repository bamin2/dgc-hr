CREATE OR REPLACE FUNCTION generate_loan_installments(loan_uuid uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  loan_record RECORD;
  caller_employee_id uuid;
  calculated_duration integer;
  calculated_installment numeric;
  i integer;
  installment_due_date date;
  remaining_principal numeric;
  current_installment_amount numeric;
  has_permission boolean;
BEGIN
  -- Get caller's employee ID from employees table (NOT profiles)
  SELECT id INTO caller_employee_id 
  FROM public.employees WHERE user_id = auth.uid();
  
  -- Check if caller has HR or Admin role
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('hr', 'admin')
  ) INTO has_permission;
  
  -- Get loan and verify permission
  SELECT * INTO loan_record 
  FROM public.loans 
  WHERE id = loan_uuid
    AND (employee_id = caller_employee_id OR has_permission);
  
  IF loan_record IS NULL THEN
    RAISE EXCEPTION 'Loan not found or access denied';
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
$$;