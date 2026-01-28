-- Create pending_salary_changes table for scheduled salary updates
CREATE TABLE public.pending_salary_changes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  salary_history_id UUID REFERENCES public.salary_history(id) ON DELETE SET NULL,
  new_salary NUMERIC NOT NULL,
  new_gosi_salary NUMERIC,
  new_allowances JSONB,
  new_deductions JSONB,
  effective_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'applied', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  applied_at TIMESTAMPTZ,
  UNIQUE (employee_id, effective_date, status)
);

-- Add index for efficient querying
CREATE INDEX idx_pending_salary_changes_employee_status ON public.pending_salary_changes(employee_id, status);
CREATE INDEX idx_pending_salary_changes_effective_date ON public.pending_salary_changes(effective_date, status);

-- Enable RLS
ALTER TABLE public.pending_salary_changes ENABLE ROW LEVEL SECURITY;

-- HR/Admin can manage pending changes
CREATE POLICY "hr_admin_manage_pending_salary_changes" ON public.pending_salary_changes
  FOR ALL
  TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['hr', 'admin']::app_role[]))
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['hr', 'admin']::app_role[]));

-- Add comment for documentation
COMMENT ON TABLE public.pending_salary_changes IS 'Stores scheduled salary changes that will be applied on a future effective date';