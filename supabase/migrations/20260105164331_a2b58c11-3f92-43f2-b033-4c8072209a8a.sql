-- Create project_status enum type
CREATE TYPE public.project_status AS ENUM ('todo', 'in_progress', 'need_review', 'done');

-- Create project_priority enum type
CREATE TYPE public.project_priority AS ENUM ('low', 'medium', 'high');

-- Create activity_type enum type
CREATE TYPE public.activity_type AS ENUM ('created', 'status_change', 'assignee_added', 'assignee_removed', 'comment', 'updated');

-- Create projects table
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  status public.project_status NOT NULL DEFAULT 'todo',
  priority public.project_priority NOT NULL DEFAULT 'medium',
  start_date DATE,
  end_date DATE,
  due_date DATE,
  owner_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create project_members table
CREATE TABLE public.project_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member', -- 'owner', 'manager', 'member'
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(project_id, employee_id)
);

-- Create project_activities table (for activity log)
CREATE TABLE public.project_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
  activity_type public.activity_type NOT NULL,
  old_status public.project_status,
  new_status public.project_status,
  target_employee_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
  comment TEXT,
  mentioned_employee_ids UUID[],
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_activities ENABLE ROW LEVEL SECURITY;

-- Projects RLS Policies
-- HR and Admin can do everything
CREATE POLICY "HR and Admin can view all projects"
  ON public.projects FOR SELECT
  USING (has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role]));

CREATE POLICY "HR and Admin can insert projects"
  ON public.projects FOR INSERT
  WITH CHECK (has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role]));

CREATE POLICY "HR and Admin can update projects"
  ON public.projects FOR UPDATE
  USING (has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role]));

CREATE POLICY "HR and Admin can delete projects"
  ON public.projects FOR DELETE
  USING (has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role]));

-- Employees can view projects they are members of
CREATE POLICY "Members can view their projects"
  ON public.projects FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.project_members pm
      WHERE pm.project_id = projects.id
      AND pm.employee_id = get_user_employee_id(auth.uid())
    )
  );

-- Employees can create projects (they become the owner)
CREATE POLICY "Employees can create projects"
  ON public.projects FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Project owners can update their projects
CREATE POLICY "Owners can update their projects"
  ON public.projects FOR UPDATE
  USING (owner_id = get_user_employee_id(auth.uid()));

-- Project Members RLS Policies
CREATE POLICY "HR and Admin can view all project members"
  ON public.project_members FOR SELECT
  USING (has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role]));

CREATE POLICY "HR and Admin can manage project members"
  ON public.project_members FOR ALL
  USING (has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role]));

CREATE POLICY "Members can view project members"
  ON public.project_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.project_members pm2
      WHERE pm2.project_id = project_members.project_id
      AND pm2.employee_id = get_user_employee_id(auth.uid())
    )
  );

-- Project owners can manage members
CREATE POLICY "Project owners can manage members"
  ON public.project_members FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_members.project_id
      AND p.owner_id = get_user_employee_id(auth.uid())
    )
  );

-- Project Activities RLS Policies
CREATE POLICY "HR and Admin can view all activities"
  ON public.project_activities FOR SELECT
  USING (has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role]));

CREATE POLICY "Members can view project activities"
  ON public.project_activities FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.project_members pm
      WHERE pm.project_id = project_activities.project_id
      AND pm.employee_id = get_user_employee_id(auth.uid())
    )
  );

CREATE POLICY "Members can insert activities"
  ON public.project_activities FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.project_members pm
      WHERE pm.project_id = project_activities.project_id
      AND pm.employee_id = get_user_employee_id(auth.uid())
    )
  );

CREATE POLICY "HR and Admin can insert activities"
  ON public.project_activities FOR INSERT
  WITH CHECK (has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role]));

-- Create indexes for performance
CREATE INDEX idx_projects_status ON public.projects(status);
CREATE INDEX idx_projects_owner_id ON public.projects(owner_id);
CREATE INDEX idx_projects_department_id ON public.projects(department_id);
CREATE INDEX idx_project_members_project_id ON public.project_members(project_id);
CREATE INDEX idx_project_members_employee_id ON public.project_members(employee_id);
CREATE INDEX idx_project_activities_project_id ON public.project_activities(project_id);
CREATE INDEX idx_project_activities_created_at ON public.project_activities(created_at DESC);

-- Create updated_at trigger for projects
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();