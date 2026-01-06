-- Recreate has_any_role with swapped args as SQL function (removes SET LOCAL issue)
CREATE OR REPLACE FUNCTION public.has_any_role(_roles app_role[], _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = ANY(_roles)
  )
$$;

-- Recreate has_role with swapped args as SQL function (removes SET LOCAL issue)
CREATE OR REPLACE FUNCTION public.has_role(_role app_role, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Recreate is_manager_of as SQL function without SET LOCAL
CREATE OR REPLACE FUNCTION public.is_manager_of(_employee_id uuid, _manager_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.employees e
    JOIN public.profiles p ON p.employee_id = e.manager_id
    WHERE e.id = _employee_id
      AND p.id = _manager_user_id
  )
$$;

-- Recreate is_project_member as SQL function without SET LOCAL
CREATE OR REPLACE FUNCTION public.is_project_member(p_employee_id uuid, p_project_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.project_members
    WHERE project_id = p_project_id AND employee_id = p_employee_id
  )
$$;

-- Recreate is_project_owner as SQL function without SET LOCAL  
CREATE OR REPLACE FUNCTION public.is_project_owner(p_employee_id uuid, p_project_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.projects
    WHERE id = p_project_id AND owner_id = p_employee_id
  )
$$;

-- Recreate get_user_employee_id as SQL function without SET LOCAL
CREATE OR REPLACE FUNCTION public.get_user_employee_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT employee_id FROM public.profiles 
  WHERE id = _user_id
$$;