-- Create enums for onboarding
CREATE TYPE onboarding_status AS ENUM ('pending', 'scheduled', 'in_progress', 'completed', 'incomplete');
CREATE TYPE task_status AS ENUM ('pending', 'in_progress', 'completed', 'skipped');
CREATE TYPE task_category AS ENUM ('documentation', 'training', 'setup', 'introduction', 'compliance');
CREATE TYPE task_assignee AS ENUM ('employee', 'hr', 'manager', 'it');

-- Create onboarding_workflows table (templates)
CREATE TABLE public.onboarding_workflows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT 'Briefcase',
  estimated_days INTEGER DEFAULT 14,
  categories task_category[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create onboarding_workflow_tasks table (template tasks)
CREATE TABLE public.onboarding_workflow_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workflow_id UUID NOT NULL REFERENCES public.onboarding_workflows(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category task_category NOT NULL DEFAULT 'documentation',
  assigned_to task_assignee NOT NULL DEFAULT 'hr',
  is_required BOOLEAN DEFAULT true,
  task_order INTEGER DEFAULT 1,
  due_days_offset INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create onboarding_records table (employee onboarding instances)
CREATE TABLE public.onboarding_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  workflow_id UUID REFERENCES public.onboarding_workflows(id) ON DELETE SET NULL,
  workflow_name TEXT NOT NULL,
  start_date DATE NOT NULL,
  scheduled_completion DATE,
  completed_on DATE,
  status onboarding_status NOT NULL DEFAULT 'pending',
  manager_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
  buddy_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
  it_contact_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
  hr_contact_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
  welcome_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create onboarding_tasks table (actual tasks for an employee's onboarding)
CREATE TABLE public.onboarding_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  onboarding_record_id UUID NOT NULL REFERENCES public.onboarding_records(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category task_category NOT NULL DEFAULT 'documentation',
  assigned_to task_assignee NOT NULL DEFAULT 'hr',
  is_required BOOLEAN DEFAULT true,
  task_order INTEGER DEFAULT 1,
  due_date DATE,
  status task_status NOT NULL DEFAULT 'pending',
  completed_at TIMESTAMP WITH TIME ZONE,
  completed_by UUID REFERENCES public.employees(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.onboarding_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_workflow_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_tasks ENABLE ROW LEVEL SECURITY;

-- Policies for onboarding_workflows (templates - can be viewed by all authenticated users)
CREATE POLICY "Authenticated users can view workflows" 
ON public.onboarding_workflows FOR SELECT 
USING (true);

CREATE POLICY "HR and Admin can insert workflows" 
ON public.onboarding_workflows FOR INSERT 
WITH CHECK (has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role]));

CREATE POLICY "HR and Admin can update workflows" 
ON public.onboarding_workflows FOR UPDATE 
USING (has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role]));

CREATE POLICY "HR and Admin can delete workflows" 
ON public.onboarding_workflows FOR DELETE 
USING (has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role]));

-- Policies for onboarding_workflow_tasks
CREATE POLICY "Authenticated users can view workflow tasks" 
ON public.onboarding_workflow_tasks FOR SELECT 
USING (true);

CREATE POLICY "HR and Admin can manage workflow tasks" 
ON public.onboarding_workflow_tasks FOR ALL 
USING (has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role]));

-- Policies for onboarding_records
CREATE POLICY "HR and Admin can view all onboarding records" 
ON public.onboarding_records FOR SELECT 
USING (has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role]));

CREATE POLICY "Managers can view their reports onboarding" 
ON public.onboarding_records FOR SELECT 
USING (is_manager_of(employee_id, auth.uid()));

CREATE POLICY "HR and Admin can insert onboarding records" 
ON public.onboarding_records FOR INSERT 
WITH CHECK (has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role]));

CREATE POLICY "HR and Admin can update onboarding records" 
ON public.onboarding_records FOR UPDATE 
USING (has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role]));

CREATE POLICY "HR and Admin can delete onboarding records" 
ON public.onboarding_records FOR DELETE 
USING (has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role]));

-- Policies for onboarding_tasks
CREATE POLICY "HR and Admin can view all onboarding tasks" 
ON public.onboarding_tasks FOR SELECT 
USING (has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role]));

CREATE POLICY "Managers can view their reports onboarding tasks" 
ON public.onboarding_tasks FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM onboarding_records orec
  WHERE orec.id = onboarding_tasks.onboarding_record_id
  AND is_manager_of(orec.employee_id, auth.uid())
));

CREATE POLICY "HR and Admin can manage onboarding tasks" 
ON public.onboarding_tasks FOR ALL 
USING (has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role]));

-- Create indexes for performance
CREATE INDEX idx_onboarding_workflow_tasks_workflow ON public.onboarding_workflow_tasks(workflow_id);
CREATE INDEX idx_onboarding_records_employee ON public.onboarding_records(employee_id);
CREATE INDEX idx_onboarding_records_status ON public.onboarding_records(status);
CREATE INDEX idx_onboarding_tasks_record ON public.onboarding_tasks(onboarding_record_id);
CREATE INDEX idx_onboarding_tasks_status ON public.onboarding_tasks(status);

-- Insert default workflow templates
INSERT INTO public.onboarding_workflows (id, name, description, icon, estimated_days, categories) VALUES
  ('11111111-1111-1111-1111-111111111111', 'General', 'Standard onboarding for most roles with essential documentation, training, and introductions.', 'Briefcase', 14, ARRAY['documentation', 'training', 'setup', 'introduction', 'compliance']::task_category[]),
  ('22222222-2222-2222-2222-222222222222', 'Engineering', 'Developer-focused onboarding with additional tech setup, coding standards, and development tools.', 'Code', 21, ARRAY['documentation', 'training', 'setup', 'introduction', 'compliance']::task_category[]),
  ('33333333-3333-3333-3333-333333333333', 'Sales', 'Sales-focused onboarding with CRM training, product knowledge, and sales methodology.', 'TrendingUp', 14, ARRAY['documentation', 'training', 'setup', 'introduction', 'compliance']::task_category[]),
  ('44444444-4444-4444-4444-444444444444', 'Remote', 'Tailored for remote employees with virtual setup, remote tools, and async communication.', 'Globe', 10, ARRAY['documentation', 'training', 'setup', 'introduction', 'compliance']::task_category[]),
  ('55555555-5555-5555-5555-555555555555', 'Executive', 'Leadership onboarding with board introductions, strategic planning, and executive coaching.', 'Crown', 30, ARRAY['documentation', 'training', 'setup', 'introduction', 'compliance']::task_category[]);

-- Insert default General workflow tasks
INSERT INTO public.onboarding_workflow_tasks (workflow_id, title, description, category, assigned_to, is_required, task_order, due_days_offset) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Sign employment contract', 'Review and sign the official employment contract.', 'documentation', 'hr', true, 1, 0),
  ('11111111-1111-1111-1111-111111111111', 'Submit ID documents', 'Provide copies of government-issued ID and work authorization.', 'documentation', 'employee', true, 2, 1),
  ('11111111-1111-1111-1111-111111111111', 'Complete W-4 tax form', 'Fill out federal tax withholding form.', 'documentation', 'employee', true, 3, 1),
  ('11111111-1111-1111-1111-111111111111', 'Direct deposit setup', 'Provide bank account details.', 'documentation', 'employee', false, 4, 2),
  ('11111111-1111-1111-1111-111111111111', 'Emergency contact form', 'Submit emergency contact information.', 'documentation', 'employee', true, 5, 2),
  ('11111111-1111-1111-1111-111111111111', 'Complete company orientation', 'Watch orientation video and complete quiz.', 'training', 'employee', true, 6, 3),
  ('11111111-1111-1111-1111-111111111111', 'Safety training', 'Complete workplace safety training.', 'training', 'employee', true, 7, 4),
  ('11111111-1111-1111-1111-111111111111', 'Review employee handbook', 'Read and acknowledge employee handbook.', 'training', 'employee', true, 8, 5),
  ('11111111-1111-1111-1111-111111111111', 'IT equipment setup', 'Set up laptop and equipment.', 'setup', 'it', true, 9, 1),
  ('11111111-1111-1111-1111-111111111111', 'Email account activation', 'Activate corporate email.', 'setup', 'it', true, 10, 1),
  ('11111111-1111-1111-1111-111111111111', 'Access card provisioning', 'Receive building access card.', 'setup', 'it', true, 11, 2),
  ('11111111-1111-1111-1111-111111111111', 'Meet with manager', 'One-on-one with direct manager.', 'introduction', 'manager', true, 12, 3),
  ('11111111-1111-1111-1111-111111111111', 'Team introduction meeting', 'Meet team members.', 'introduction', 'manager', true, 13, 4),
  ('11111111-1111-1111-1111-111111111111', 'Office tour', 'Tour of office facilities.', 'introduction', 'hr', false, 14, 1),
  ('11111111-1111-1111-1111-111111111111', 'Background check verification', 'Complete background check.', 'compliance', 'hr', true, 15, 7),
  ('11111111-1111-1111-1111-111111111111', 'NDA signing', 'Sign non-disclosure agreement.', 'compliance', 'hr', true, 16, 1),
  ('11111111-1111-1111-1111-111111111111', 'Policy acknowledgment', 'Acknowledge company policies.', 'compliance', 'employee', true, 17, 7);

-- Insert Engineering workflow tasks
INSERT INTO public.onboarding_workflow_tasks (workflow_id, title, description, category, assigned_to, is_required, task_order, due_days_offset) VALUES
  ('22222222-2222-2222-2222-222222222222', 'Sign employment contract', 'Review and sign the official employment contract.', 'documentation', 'hr', true, 1, 0),
  ('22222222-2222-2222-2222-222222222222', 'Submit ID documents', 'Provide copies of government-issued ID.', 'documentation', 'employee', true, 2, 1),
  ('22222222-2222-2222-2222-222222222222', 'Complete W-4 tax form', 'Fill out federal tax withholding form.', 'documentation', 'employee', true, 3, 1),
  ('22222222-2222-2222-2222-222222222222', 'Complete company orientation', 'Watch orientation video.', 'training', 'employee', true, 4, 3),
  ('22222222-2222-2222-2222-222222222222', 'Review employee handbook', 'Read employee handbook.', 'training', 'employee', true, 5, 5),
  ('22222222-2222-2222-2222-222222222222', 'Engineering standards training', 'Learn coding standards and best practices.', 'training', 'manager', true, 6, 7),
  ('22222222-2222-2222-2222-222222222222', 'Git workflow training', 'Learn branching strategy and PR process.', 'training', 'manager', true, 7, 10),
  ('22222222-2222-2222-2222-222222222222', 'Code review introduction', 'Learn code review process.', 'training', 'manager', true, 8, 14),
  ('22222222-2222-2222-2222-222222222222', 'IT equipment setup', 'Set up laptop and monitors.', 'setup', 'it', true, 9, 1),
  ('22222222-2222-2222-2222-222222222222', 'Development environment setup', 'Install IDE, tools, and dependencies.', 'setup', 'it', true, 10, 3),
  ('22222222-2222-2222-2222-222222222222', 'Repository access', 'Get access to GitHub/GitLab repos.', 'setup', 'it', true, 11, 2),
  ('22222222-2222-2222-2222-222222222222', 'CI/CD pipeline access', 'Access to deployment pipelines.', 'setup', 'it', true, 12, 5),
  ('22222222-2222-2222-2222-222222222222', 'Meet with manager', 'One-on-one with engineering manager.', 'introduction', 'manager', true, 13, 3),
  ('22222222-2222-2222-2222-222222222222', 'Team introduction', 'Meet engineering team.', 'introduction', 'manager', true, 14, 4),
  ('22222222-2222-2222-2222-222222222222', 'Architecture overview', 'System architecture walkthrough.', 'introduction', 'manager', true, 15, 7),
  ('22222222-2222-2222-2222-222222222222', 'NDA signing', 'Sign non-disclosure agreement.', 'compliance', 'hr', true, 16, 1),
  ('22222222-2222-2222-2222-222222222222', 'IP assignment agreement', 'Sign intellectual property agreement.', 'compliance', 'hr', true, 17, 1);

-- Insert Sales workflow tasks
INSERT INTO public.onboarding_workflow_tasks (workflow_id, title, description, category, assigned_to, is_required, task_order, due_days_offset) VALUES
  ('33333333-3333-3333-3333-333333333333', 'Sign employment contract', 'Review and sign employment contract.', 'documentation', 'hr', true, 1, 0),
  ('33333333-3333-3333-3333-333333333333', 'Submit ID documents', 'Provide identification documents.', 'documentation', 'employee', true, 2, 1),
  ('33333333-3333-3333-3333-333333333333', 'Commission structure review', 'Review compensation and commission plan.', 'documentation', 'hr', true, 3, 2),
  ('33333333-3333-3333-3333-333333333333', 'Complete company orientation', 'Watch orientation video.', 'training', 'employee', true, 4, 3),
  ('33333333-3333-3333-3333-333333333333', 'Product knowledge training', 'Learn about products and services.', 'training', 'manager', true, 5, 5),
  ('33333333-3333-3333-3333-333333333333', 'CRM training', 'Learn Salesforce/CRM system.', 'training', 'manager', true, 6, 7),
  ('33333333-3333-3333-3333-333333333333', 'Sales methodology training', 'Learn sales process and techniques.', 'training', 'manager', true, 7, 10),
  ('33333333-3333-3333-3333-333333333333', 'Competitive landscape training', 'Learn about competitors.', 'training', 'manager', true, 8, 12),
  ('33333333-3333-3333-3333-333333333333', 'IT equipment setup', 'Set up laptop and phone.', 'setup', 'it', true, 9, 1),
  ('33333333-3333-3333-3333-333333333333', 'CRM account setup', 'Configure CRM access.', 'setup', 'it', true, 10, 2),
  ('33333333-3333-3333-3333-333333333333', 'Meet with sales manager', 'One-on-one with sales manager.', 'introduction', 'manager', true, 11, 3),
  ('33333333-3333-3333-3333-333333333333', 'Team introduction', 'Meet sales team.', 'introduction', 'manager', true, 12, 4),
  ('33333333-3333-3333-3333-333333333333', 'Shadow experienced rep', 'Observe sales calls.', 'introduction', 'manager', true, 13, 7),
  ('33333333-3333-3333-3333-333333333333', 'NDA signing', 'Sign non-disclosure agreement.', 'compliance', 'hr', true, 14, 1);

-- Insert Remote workflow tasks
INSERT INTO public.onboarding_workflow_tasks (workflow_id, title, description, category, assigned_to, is_required, task_order, due_days_offset) VALUES
  ('44444444-4444-4444-4444-444444444444', 'Sign employment contract', 'Review and sign employment contract.', 'documentation', 'hr', true, 1, 0),
  ('44444444-4444-4444-4444-444444444444', 'Submit ID documents', 'Provide identification documents.', 'documentation', 'employee', true, 2, 1),
  ('44444444-4444-4444-4444-444444444444', 'Home office stipend form', 'Request home office equipment stipend.', 'documentation', 'employee', false, 3, 2),
  ('44444444-4444-4444-4444-444444444444', 'Complete company orientation', 'Watch orientation video.', 'training', 'employee', true, 4, 3),
  ('44444444-4444-4444-4444-444444444444', 'Remote work best practices', 'Learn remote work guidelines.', 'training', 'employee', true, 5, 4),
  ('44444444-4444-4444-4444-444444444444', 'Async communication training', 'Learn Slack, email etiquette.', 'training', 'manager', true, 6, 5),
  ('44444444-4444-4444-4444-444444444444', 'Laptop shipped and received', 'Confirm laptop delivery.', 'setup', 'it', true, 7, 0),
  ('44444444-4444-4444-4444-444444444444', 'VPN configuration', 'Set up VPN access.', 'setup', 'it', true, 8, 2),
  ('44444444-4444-4444-4444-444444444444', 'Collaboration tools setup', 'Set up Slack, Zoom, etc.', 'setup', 'it', true, 9, 2),
  ('44444444-4444-4444-4444-444444444444', 'Virtual meet with manager', 'Video call with manager.', 'introduction', 'manager', true, 10, 3),
  ('44444444-4444-4444-4444-444444444444', 'Virtual team introduction', 'Video call with team.', 'introduction', 'manager', true, 11, 4),
  ('44444444-4444-4444-4444-444444444444', 'Virtual buddy assignment', 'Meet remote buddy.', 'introduction', 'hr', false, 12, 3),
  ('44444444-4444-4444-4444-444444444444', 'NDA signing', 'Sign non-disclosure agreement.', 'compliance', 'hr', true, 13, 1);

-- Insert Executive workflow tasks
INSERT INTO public.onboarding_workflow_tasks (workflow_id, title, description, category, assigned_to, is_required, task_order, due_days_offset) VALUES
  ('55555555-5555-5555-5555-555555555555', 'Sign executive contract', 'Review and sign executive employment agreement.', 'documentation', 'hr', true, 1, 0),
  ('55555555-5555-5555-5555-555555555555', 'Submit ID documents', 'Provide identification documents.', 'documentation', 'employee', true, 2, 1),
  ('55555555-5555-5555-5555-555555555555', 'Equity agreement signing', 'Review and sign stock option agreement.', 'documentation', 'hr', true, 3, 3),
  ('55555555-5555-5555-5555-555555555555', 'Company strategy overview', 'Deep dive into company strategy.', 'training', 'manager', true, 4, 7),
  ('55555555-5555-5555-5555-555555555555', 'Financial review', 'Review company financials.', 'training', 'manager', true, 5, 10),
  ('55555555-5555-5555-5555-555555555555', 'Leadership training', 'Executive leadership program.', 'training', 'hr', true, 6, 14),
  ('55555555-5555-5555-5555-555555555555', 'IT equipment setup', 'Set up laptop and equipment.', 'setup', 'it', true, 7, 1),
  ('55555555-5555-5555-5555-555555555555', 'Executive assistant assignment', 'Meet executive assistant.', 'setup', 'hr', false, 8, 5),
  ('55555555-5555-5555-5555-555555555555', 'Board member introductions', 'Meet board members.', 'introduction', 'manager', true, 9, 14),
  ('55555555-5555-5555-5555-555555555555', 'Executive team meeting', 'Meet C-suite executives.', 'introduction', 'manager', true, 10, 7),
  ('55555555-5555-5555-5555-555555555555', 'Department head meetings', 'Meet all department heads.', 'introduction', 'manager', true, 11, 21),
  ('55555555-5555-5555-5555-555555555555', 'Key client introductions', 'Meet top clients.', 'introduction', 'manager', false, 12, 28),
  ('55555555-5555-5555-5555-555555555555', 'NDA signing', 'Sign non-disclosure agreement.', 'compliance', 'hr', true, 13, 1),
  ('55555555-5555-5555-5555-555555555555', 'D&O insurance enrollment', 'Enroll in directors insurance.', 'compliance', 'hr', true, 14, 7);