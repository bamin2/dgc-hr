-- Create benefit type enum
CREATE TYPE benefit_type AS ENUM ('health', 'dental', 'vision', 'life', 'disability', 'retirement', 'wellness', 'other');

-- Create benefit status enum
CREATE TYPE benefit_status AS ENUM ('active', 'inactive', 'pending');

-- Create enrollment status enum
CREATE TYPE enrollment_status AS ENUM ('active', 'pending', 'cancelled', 'expired');

-- Create claim status enum
CREATE TYPE claim_status AS ENUM ('pending', 'approved', 'rejected', 'processing');

-- Create benefit_plans table
CREATE TABLE public.benefit_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type benefit_type NOT NULL,
  provider TEXT NOT NULL,
  description TEXT,
  status benefit_status NOT NULL DEFAULT 'active',
  enrolled_count INTEGER DEFAULT 0,
  features TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create benefit_coverage_levels table (for plan pricing tiers)
CREATE TABLE public.benefit_coverage_levels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_id UUID NOT NULL REFERENCES public.benefit_plans(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  employee_cost NUMERIC NOT NULL DEFAULT 0,
  employer_cost NUMERIC NOT NULL DEFAULT 0,
  coverage_details JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create benefit_enrollments table
CREATE TABLE public.benefit_enrollments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.benefit_plans(id) ON DELETE CASCADE,
  coverage_level_id UUID NOT NULL REFERENCES public.benefit_coverage_levels(id),
  status enrollment_status NOT NULL DEFAULT 'pending',
  start_date DATE NOT NULL,
  end_date DATE,
  employee_contribution NUMERIC NOT NULL DEFAULT 0,
  employer_contribution NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create benefit_claims table
CREATE TABLE public.benefit_claims (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.benefit_plans(id) ON DELETE CASCADE,
  enrollment_id UUID NOT NULL REFERENCES public.benefit_enrollments(id) ON DELETE CASCADE,
  claim_number TEXT NOT NULL UNIQUE,
  claim_date DATE NOT NULL,
  service_date DATE NOT NULL,
  amount NUMERIC NOT NULL,
  approved_amount NUMERIC,
  status claim_status NOT NULL DEFAULT 'pending',
  description TEXT,
  provider_name TEXT,
  rejection_reason TEXT,
  reviewed_by UUID REFERENCES public.employees(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create benefit_beneficiaries table
CREATE TABLE public.benefit_beneficiaries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  enrollment_id UUID NOT NULL REFERENCES public.benefit_enrollments(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  relationship TEXT NOT NULL,
  date_of_birth DATE,
  percentage NUMERIC DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.benefit_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.benefit_coverage_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.benefit_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.benefit_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.benefit_beneficiaries ENABLE ROW LEVEL SECURITY;

-- RLS Policies for benefit_plans (viewable by all authenticated users)
CREATE POLICY "Authenticated users can view benefit plans"
ON public.benefit_plans FOR SELECT
USING (true);

CREATE POLICY "HR and Admin can insert benefit plans"
ON public.benefit_plans FOR INSERT
WITH CHECK (has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role]));

CREATE POLICY "HR and Admin can update benefit plans"
ON public.benefit_plans FOR UPDATE
USING (has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role]));

CREATE POLICY "HR and Admin can delete benefit plans"
ON public.benefit_plans FOR DELETE
USING (has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role]));

-- RLS Policies for benefit_coverage_levels
CREATE POLICY "Authenticated users can view coverage levels"
ON public.benefit_coverage_levels FOR SELECT
USING (true);

CREATE POLICY "HR and Admin can manage coverage levels"
ON public.benefit_coverage_levels FOR ALL
USING (has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role]));

-- RLS Policies for benefit_enrollments
CREATE POLICY "HR and Admin can view all enrollments"
ON public.benefit_enrollments FOR SELECT
USING (has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role]));

CREATE POLICY "Employees can view own enrollments"
ON public.benefit_enrollments FOR SELECT
USING (employee_id = get_user_employee_id(auth.uid()));

CREATE POLICY "HR and Admin can manage enrollments"
ON public.benefit_enrollments FOR ALL
USING (has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role]));

-- RLS Policies for benefit_claims
CREATE POLICY "HR and Admin can view all claims"
ON public.benefit_claims FOR SELECT
USING (has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role]));

CREATE POLICY "Employees can view own claims"
ON public.benefit_claims FOR SELECT
USING (employee_id = get_user_employee_id(auth.uid()));

CREATE POLICY "Employees can insert own claims"
ON public.benefit_claims FOR INSERT
WITH CHECK (employee_id = get_user_employee_id(auth.uid()));

CREATE POLICY "HR and Admin can manage claims"
ON public.benefit_claims FOR ALL
USING (has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role]));

-- RLS Policies for benefit_beneficiaries
CREATE POLICY "HR and Admin can view all beneficiaries"
ON public.benefit_beneficiaries FOR SELECT
USING (has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role]));

CREATE POLICY "Employees can view own beneficiaries"
ON public.benefit_beneficiaries FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.benefit_enrollments be
    WHERE be.id = enrollment_id
    AND be.employee_id = get_user_employee_id(auth.uid())
  )
);

CREATE POLICY "Employees can manage own beneficiaries"
ON public.benefit_beneficiaries FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.benefit_enrollments be
    WHERE be.id = enrollment_id
    AND be.employee_id = get_user_employee_id(auth.uid())
  )
);

-- Create indexes for better query performance
CREATE INDEX idx_benefit_enrollments_employee ON public.benefit_enrollments(employee_id);
CREATE INDEX idx_benefit_enrollments_plan ON public.benefit_enrollments(plan_id);
CREATE INDEX idx_benefit_claims_employee ON public.benefit_claims(employee_id);
CREATE INDEX idx_benefit_claims_status ON public.benefit_claims(status);
CREATE INDEX idx_benefit_coverage_plan ON public.benefit_coverage_levels(plan_id);

-- Create trigger for updated_at
CREATE TRIGGER update_benefit_plans_updated_at
BEFORE UPDATE ON public.benefit_plans
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_benefit_enrollments_updated_at
BEFORE UPDATE ON public.benefit_enrollments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_benefit_claims_updated_at
BEFORE UPDATE ON public.benefit_claims
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();