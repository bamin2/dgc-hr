-- =============================================================================
-- SECURITY FIX: Complete remaining security policy fixes
-- =============================================================================

-- Drop any existing duplicate policies before recreating
DROP POLICY IF EXISTS "Employees can view own salary history" ON public.salary_history;
DROP POLICY IF EXISTS "HR and Admin can view all salary history" ON public.salary_history;
DROP POLICY IF EXISTS "HR and Admin can insert salary history" ON public.salary_history;
DROP POLICY IF EXISTS "HR and Admin can update salary history" ON public.salary_history;
DROP POLICY IF EXISTS "HR and Admin can delete salary history" ON public.salary_history;

-- Drop the overly permissive ALL policy if it exists
DROP POLICY IF EXISTS "salary_history_manage_hr_admin" ON public.salary_history;

-- Recreate proper policies for salary_history with proper separation
CREATE POLICY "Employees can view own salary history"
  ON public.salary_history FOR SELECT
  USING (employee_id = get_user_employee_id(auth.uid()));

CREATE POLICY "HR and Admin can view all salary history"
  ON public.salary_history FOR SELECT
  USING (has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role]));

CREATE POLICY "HR and Admin can insert salary history"
  ON public.salary_history FOR INSERT
  WITH CHECK (has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role]));

CREATE POLICY "HR and Admin can update salary history"
  ON public.salary_history FOR UPDATE
  USING (has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role]));

CREATE POLICY "HR and Admin can delete salary history"
  ON public.salary_history FOR DELETE
  USING (has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role]));