-- Create helper function to check project membership (bypasses RLS)
CREATE OR REPLACE FUNCTION public.is_project_member(p_project_id UUID, p_employee_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM project_members
    WHERE project_id = p_project_id AND employee_id = p_employee_id
  );
$$;

-- Create helper function to check project ownership (bypasses RLS)
CREATE OR REPLACE FUNCTION public.is_project_owner(p_project_id UUID, p_employee_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM projects
    WHERE id = p_project_id AND owner_id = p_employee_id
  );
$$;

-- Fix projects table policies
DROP POLICY IF EXISTS "Members can view their projects" ON projects;
CREATE POLICY "Members can view their projects"
  ON projects FOR SELECT
  USING (public.is_project_member(id, public.get_user_employee_id(auth.uid())));

-- Fix project_members table policies
DROP POLICY IF EXISTS "Project owners can manage members" ON project_members;
CREATE POLICY "Project owners can manage members"
  ON project_members FOR ALL
  USING (public.is_project_owner(project_id, public.get_user_employee_id(auth.uid())));

DROP POLICY IF EXISTS "Members can view project members" ON project_members;
CREATE POLICY "Members can view project members"
  ON project_members FOR SELECT
  USING (public.is_project_member(project_id, public.get_user_employee_id(auth.uid())));

-- Fix project_activities table policies
DROP POLICY IF EXISTS "Members can view project activities" ON project_activities;
CREATE POLICY "Members can view project activities"
  ON project_activities FOR SELECT
  USING (public.is_project_member(project_id, public.get_user_employee_id(auth.uid())));

DROP POLICY IF EXISTS "Members can insert activities" ON project_activities;
CREATE POLICY "Members can insert activities"
  ON project_activities FOR INSERT
  WITH CHECK (public.is_project_member(project_id, public.get_user_employee_id(auth.uid())));