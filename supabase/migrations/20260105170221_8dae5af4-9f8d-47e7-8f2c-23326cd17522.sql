-- Drop existing functions with CASCADE (will also drop dependent policies)
DROP FUNCTION IF EXISTS public.is_manager_of(UUID, UUID) CASCADE;
DROP FUNCTION IF EXISTS public.is_project_member(UUID, UUID) CASCADE;
DROP FUNCTION IF EXISTS public.is_project_owner(UUID, UUID) CASCADE;
DROP FUNCTION IF EXISTS public.get_user_employee_id(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.has_role(public.app_role, UUID) CASCADE;
DROP FUNCTION IF EXISTS public.has_any_role(public.app_role[], UUID) CASCADE;

-- Recreate is_manager_of to bypass RLS properly
CREATE FUNCTION public.is_manager_of(_employee_id UUID, _manager_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  result BOOLEAN;
BEGIN
  SET LOCAL row_security = OFF;
  
  SELECT EXISTS (
    SELECT 1
    FROM public.employees e
    JOIN public.profiles p ON p.employee_id = e.manager_id
    WHERE e.id = _employee_id
      AND p.id = _manager_user_id
  ) INTO result;
  
  RETURN result;
END;
$$;

-- Recreate is_project_member to bypass RLS properly
CREATE FUNCTION public.is_project_member(p_employee_id UUID, p_project_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  result BOOLEAN;
BEGIN
  SET LOCAL row_security = OFF;
  
  SELECT EXISTS (
    SELECT 1 FROM public.project_members
    WHERE project_id = p_project_id AND employee_id = p_employee_id
  ) INTO result;
  
  RETURN result;
END;
$$;

-- Recreate is_project_owner to bypass RLS properly
CREATE FUNCTION public.is_project_owner(p_employee_id UUID, p_project_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  result BOOLEAN;
BEGIN
  SET LOCAL row_security = OFF;
  
  SELECT EXISTS (
    SELECT 1 FROM public.projects
    WHERE id = p_project_id AND owner_id = p_employee_id
  ) INTO result;
  
  RETURN result;
END;
$$;

-- Recreate get_user_employee_id to bypass RLS properly
CREATE FUNCTION public.get_user_employee_id(_user_id UUID)
RETURNS UUID
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  result UUID;
BEGIN
  SET LOCAL row_security = OFF;
  
  SELECT employee_id FROM public.profiles 
  WHERE id = _user_id 
  INTO result;
  
  RETURN result;
END;
$$;

-- Recreate has_role to bypass RLS properly
CREATE FUNCTION public.has_role(_role public.app_role, _user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  result BOOLEAN;
BEGIN
  SET LOCAL row_security = OFF;
  
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  ) INTO result;
  
  RETURN result;
END;
$$;

-- Recreate has_any_role to bypass RLS properly
CREATE FUNCTION public.has_any_role(_roles public.app_role[], _user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  result BOOLEAN;
BEGIN
  SET LOCAL row_security = OFF;
  
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = ANY(_roles)
  ) INTO result;
  
  RETURN result;
END;
$$;

-- Recreate the dropped policies for employees table
CREATE POLICY "Managers can view their reports" ON public.employees
FOR SELECT USING (public.is_manager_of(id, auth.uid()));

-- Recreate the dropped policies for attendance_records table
CREATE POLICY "Managers can view reports attendance" ON public.attendance_records
FOR SELECT USING (public.is_manager_of(employee_id, auth.uid()));

-- Recreate the dropped policies for leave_balances table
CREATE POLICY "Managers can view reports leave balances" ON public.leave_balances
FOR SELECT USING (public.is_manager_of(employee_id, auth.uid()));

-- Recreate the dropped policies for leave_requests table
CREATE POLICY "Managers can view reports leave requests" ON public.leave_requests
FOR SELECT USING (public.is_manager_of(employee_id, auth.uid()));

CREATE POLICY "Managers can update reports leave requests" ON public.leave_requests
FOR UPDATE USING (public.is_manager_of(employee_id, auth.uid()));

-- Recreate project-related policies
CREATE POLICY "Project members can view projects" ON public.projects
FOR SELECT USING (
  public.is_project_member(public.get_user_employee_id(auth.uid()), id)
  OR public.is_project_owner(public.get_user_employee_id(auth.uid()), id)
  OR public.has_any_role(ARRAY['admin'::public.app_role, 'hr'::public.app_role], auth.uid())
);

CREATE POLICY "Project owners can update projects" ON public.projects
FOR UPDATE USING (
  public.is_project_owner(public.get_user_employee_id(auth.uid()), id)
  OR public.has_any_role(ARRAY['admin'::public.app_role, 'hr'::public.app_role], auth.uid())
);

CREATE POLICY "Project members can view memberships" ON public.project_members
FOR SELECT USING (
  public.is_project_member(public.get_user_employee_id(auth.uid()), project_id)
  OR public.is_project_owner(public.get_user_employee_id(auth.uid()), project_id)
  OR public.has_any_role(ARRAY['admin'::public.app_role, 'hr'::public.app_role], auth.uid())
);

CREATE POLICY "Project owners can manage memberships" ON public.project_members
FOR ALL USING (
  public.is_project_owner(public.get_user_employee_id(auth.uid()), project_id)
  OR public.has_any_role(ARRAY['admin'::public.app_role, 'hr'::public.app_role], auth.uid())
);

CREATE POLICY "Project members can view activities" ON public.project_activities
FOR SELECT USING (
  public.is_project_member(public.get_user_employee_id(auth.uid()), project_id)
  OR public.is_project_owner(public.get_user_employee_id(auth.uid()), project_id)
  OR public.has_any_role(ARRAY['admin'::public.app_role, 'hr'::public.app_role], auth.uid())
);

CREATE POLICY "Project members can create activities" ON public.project_activities
FOR INSERT WITH CHECK (
  public.is_project_member(public.get_user_employee_id(auth.uid()), project_id)
  OR public.is_project_owner(public.get_user_employee_id(auth.uid()), project_id)
  OR public.has_any_role(ARRAY['admin'::public.app_role, 'hr'::public.app_role], auth.uid())
);