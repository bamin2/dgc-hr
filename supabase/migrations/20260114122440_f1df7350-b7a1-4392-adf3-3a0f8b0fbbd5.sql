-- Drop is_manager_of with CASCADE (will drop dependent policies) and recreate everything
DROP FUNCTION IF EXISTS public.is_manager_of(uuid, uuid) CASCADE;

-- Recreate the function with fixed implementation
CREATE FUNCTION public.is_manager_of(_manager_user_id uuid, _employee_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.employees e
    JOIN public.employees m ON m.user_id = _manager_user_id
    WHERE e.id = _employee_id
      AND e.manager_id = m.id
  );
$$;

-- Recreate all dependent policies
CREATE POLICY "Managers can view their reports"
ON public.employees
FOR SELECT
USING (public.is_manager_of(auth.uid(), id));

CREATE POLICY "Managers can view reports attendance"
ON public.attendance_records
FOR SELECT
USING (public.is_manager_of(auth.uid(), employee_id));

CREATE POLICY "Managers can view reports leave balances"
ON public.leave_balances
FOR SELECT
USING (public.is_manager_of(auth.uid(), employee_id));

CREATE POLICY "Managers can view reports leave requests"
ON public.leave_requests
FOR SELECT
USING (public.is_manager_of(auth.uid(), employee_id));

CREATE POLICY "Managers can update reports leave requests"
ON public.leave_requests
FOR UPDATE
USING (public.is_manager_of(auth.uid(), employee_id));

CREATE POLICY "Managers can view their reports onboarding"
ON public.onboarding_records
FOR SELECT
USING (public.is_manager_of(auth.uid(), employee_id));

CREATE POLICY "Managers can view their reports onboarding tasks"
ON public.onboarding_tasks
FOR SELECT
USING (public.is_manager_of(auth.uid(), (SELECT employee_id FROM public.onboarding_records WHERE id = onboarding_tasks.onboarding_record_id)));

CREATE POLICY "Managers can view their reports offboarding"
ON public.offboarding_records
FOR SELECT
USING (public.is_manager_of(auth.uid(), employee_id));

CREATE POLICY "Managers can view team corrections"
ON public.attendance_corrections
FOR SELECT
USING (public.is_manager_of(auth.uid(), employee_id));

CREATE POLICY "Managers can update pending corrections"
ON public.attendance_corrections
FOR UPDATE
USING (public.is_manager_of(auth.uid(), employee_id) AND status = 'pending_manager'::correction_status);