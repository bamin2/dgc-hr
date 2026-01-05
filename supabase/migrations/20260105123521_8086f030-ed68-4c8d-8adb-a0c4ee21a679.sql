-- Create change type enum
CREATE TYPE public.salary_change_type AS ENUM ('initial', 'adjustment', 'promotion', 'annual_review', 'correction', 'bulk_update');

-- Create salary_history table
CREATE TABLE public.salary_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  previous_salary NUMERIC,
  new_salary NUMERIC NOT NULL,
  change_type salary_change_type NOT NULL DEFAULT 'adjustment',
  reason TEXT,
  effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
  changed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.salary_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "HR and Admin can view all salary history"
ON public.salary_history
FOR SELECT
USING (has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role]));

CREATE POLICY "Employees can view own salary history"
ON public.salary_history
FOR SELECT
USING (employee_id = get_user_employee_id(auth.uid()));

CREATE POLICY "HR and Admin can insert salary history"
ON public.salary_history
FOR INSERT
WITH CHECK (has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role]));

-- Create trigger function to auto-record salary changes
CREATE OR REPLACE FUNCTION public.record_salary_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only record if salary actually changed
  IF OLD.salary IS DISTINCT FROM NEW.salary THEN
    INSERT INTO public.salary_history (
      employee_id,
      previous_salary,
      new_salary,
      change_type,
      effective_date,
      changed_by
    ) VALUES (
      NEW.id,
      OLD.salary,
      NEW.salary,
      'adjustment',
      CURRENT_DATE,
      auth.uid()
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger on employees table
CREATE TRIGGER on_salary_change
AFTER UPDATE ON public.employees
FOR EACH ROW
EXECUTE FUNCTION public.record_salary_change();

-- Create index for faster queries
CREATE INDEX idx_salary_history_employee_id ON public.salary_history(employee_id);
CREATE INDEX idx_salary_history_created_at ON public.salary_history(created_at DESC);