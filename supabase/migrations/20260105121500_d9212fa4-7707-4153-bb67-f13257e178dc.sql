-- Create allowance templates table
CREATE TABLE public.allowance_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  amount NUMERIC NOT NULL DEFAULT 0,
  amount_type TEXT NOT NULL DEFAULT 'fixed',
  percentage_of TEXT,
  is_taxable BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create deduction templates table
CREATE TABLE public.deduction_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  amount NUMERIC NOT NULL DEFAULT 0,
  amount_type TEXT NOT NULL DEFAULT 'fixed',
  percentage_of TEXT,
  is_mandatory BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create employee allowances junction table
CREATE TABLE public.employee_allowances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE NOT NULL,
  allowance_template_id UUID REFERENCES public.allowance_templates(id) ON DELETE CASCADE NOT NULL,
  custom_amount NUMERIC,
  effective_date DATE DEFAULT CURRENT_DATE,
  end_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(employee_id, allowance_template_id)
);

-- Create employee deductions junction table
CREATE TABLE public.employee_deductions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE NOT NULL,
  deduction_template_id UUID REFERENCES public.deduction_templates(id) ON DELETE CASCADE NOT NULL,
  custom_amount NUMERIC,
  effective_date DATE DEFAULT CURRENT_DATE,
  end_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(employee_id, deduction_template_id)
);

-- Enable RLS on all tables
ALTER TABLE public.allowance_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deduction_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_allowances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_deductions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for allowance_templates
CREATE POLICY "Authenticated users can view active allowance templates"
ON public.allowance_templates FOR SELECT
USING (true);

CREATE POLICY "HR and Admin can insert allowance templates"
ON public.allowance_templates FOR INSERT
WITH CHECK (public.has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role]));

CREATE POLICY "HR and Admin can update allowance templates"
ON public.allowance_templates FOR UPDATE
USING (public.has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role]));

CREATE POLICY "HR and Admin can delete allowance templates"
ON public.allowance_templates FOR DELETE
USING (public.has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role]));

-- RLS Policies for deduction_templates
CREATE POLICY "Authenticated users can view active deduction templates"
ON public.deduction_templates FOR SELECT
USING (true);

CREATE POLICY "HR and Admin can insert deduction templates"
ON public.deduction_templates FOR INSERT
WITH CHECK (public.has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role]));

CREATE POLICY "HR and Admin can update deduction templates"
ON public.deduction_templates FOR UPDATE
USING (public.has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role]));

CREATE POLICY "HR and Admin can delete deduction templates"
ON public.deduction_templates FOR DELETE
USING (public.has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role]));

-- RLS Policies for employee_allowances
CREATE POLICY "HR and Admin can view all employee allowances"
ON public.employee_allowances FOR SELECT
USING (public.has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role]));

CREATE POLICY "Employees can view own allowances"
ON public.employee_allowances FOR SELECT
USING (employee_id = public.get_user_employee_id(auth.uid()));

CREATE POLICY "HR and Admin can insert employee allowances"
ON public.employee_allowances FOR INSERT
WITH CHECK (public.has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role]));

CREATE POLICY "HR and Admin can update employee allowances"
ON public.employee_allowances FOR UPDATE
USING (public.has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role]));

CREATE POLICY "HR and Admin can delete employee allowances"
ON public.employee_allowances FOR DELETE
USING (public.has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role]));

-- RLS Policies for employee_deductions
CREATE POLICY "HR and Admin can view all employee deductions"
ON public.employee_deductions FOR SELECT
USING (public.has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role]));

CREATE POLICY "Employees can view own deductions"
ON public.employee_deductions FOR SELECT
USING (employee_id = public.get_user_employee_id(auth.uid()));

CREATE POLICY "HR and Admin can insert employee deductions"
ON public.employee_deductions FOR INSERT
WITH CHECK (public.has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role]));

CREATE POLICY "HR and Admin can update employee deductions"
ON public.employee_deductions FOR UPDATE
USING (public.has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role]));

CREATE POLICY "HR and Admin can delete employee deductions"
ON public.employee_deductions FOR DELETE
USING (public.has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role]));

-- Add updated_at triggers
CREATE TRIGGER update_allowance_templates_updated_at
BEFORE UPDATE ON public.allowance_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_deduction_templates_updated_at
BEFORE UPDATE ON public.deduction_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();