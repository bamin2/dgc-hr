-- Fix get_user_employee_id to use employees.user_id instead of profiles.employee_id
CREATE OR REPLACE FUNCTION public.get_user_employee_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT id FROM public.employees 
  WHERE user_id = _user_id
  LIMIT 1
$$;