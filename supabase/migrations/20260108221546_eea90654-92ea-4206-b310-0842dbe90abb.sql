-- =============================================
-- Multi-Step Approval Workflow Tables
-- =============================================

-- 1. Create approval_workflows table (stores workflow configurations)
CREATE TABLE public.approval_workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_type TEXT UNIQUE NOT NULL CHECK (request_type IN ('time_off', 'loan', 'hr_letter')),
  is_active BOOLEAN DEFAULT true,
  steps JSONB NOT NULL DEFAULT '[]',
  default_hr_approver_id UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create request_approval_steps table (tracks individual approval steps)
CREATE TABLE public.request_approval_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL,
  request_type TEXT NOT NULL CHECK (request_type IN ('time_off', 'loan', 'hr_letter')),
  step_number INTEGER NOT NULL,
  approver_type TEXT NOT NULL CHECK (approver_type IN ('manager', 'hr', 'specific_user')),
  approver_user_id UUID REFERENCES auth.users(id),
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'pending', 'approved', 'rejected', 'skipped', 'cancelled')),
  acted_by UUID REFERENCES auth.users(id),
  acted_at TIMESTAMPTZ,
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(request_id, request_type, step_number)
);

-- 3. Add submitted_at column to leave_requests
ALTER TABLE public.leave_requests 
  ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ;

-- 4. Create indexes for performance
CREATE INDEX idx_request_approval_steps_pending 
  ON request_approval_steps(approver_user_id, status) 
  WHERE status = 'pending';

CREATE INDEX idx_request_approval_steps_request 
  ON request_approval_steps(request_id, request_type);

CREATE INDEX idx_approval_workflows_request_type 
  ON approval_workflows(request_type);

-- 5. Seed default workflows
INSERT INTO public.approval_workflows (request_type, steps) VALUES
  ('time_off', '[{"step": 1, "approver": "manager", "fallback": "hr"}, {"step": 2, "approver": "hr"}]'),
  ('loan', '[{"step": 1, "approver": "hr"}]'),
  ('hr_letter', '[{"step": 1, "approver": "hr"}]');

-- 6. Enable RLS
ALTER TABLE public.approval_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.request_approval_steps ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policies for approval_workflows
-- Anyone can read workflows (needed to determine approval flow)
CREATE POLICY "Anyone can view approval workflows" 
  ON public.approval_workflows 
  FOR SELECT 
  USING (true);

-- HR/Admin can manage workflows
CREATE POLICY "HR/Admin can insert workflows" 
  ON public.approval_workflows 
  FOR INSERT 
  WITH CHECK (
    has_any_role(auth.uid(), ARRAY['hr', 'admin']::app_role[])
  );

CREATE POLICY "HR/Admin can update workflows" 
  ON public.approval_workflows 
  FOR UPDATE 
  USING (
    has_any_role(auth.uid(), ARRAY['hr', 'admin']::app_role[])
  );

-- 8. RLS Policies for request_approval_steps
-- Users can view steps where they are the approver
CREATE POLICY "Approvers can view their pending steps" 
  ON public.request_approval_steps 
  FOR SELECT 
  USING (
    approver_user_id = auth.uid()
  );

-- Users can view steps for their own leave requests
CREATE POLICY "Employees can view steps for their requests" 
  ON public.request_approval_steps 
  FOR SELECT 
  USING (
    request_type = 'time_off' AND EXISTS (
      SELECT 1 FROM public.leave_requests lr 
      JOIN public.employees e ON lr.employee_id = e.id 
      WHERE lr.id = request_id AND e.user_id = auth.uid()
    )
  );

-- HR/Admin can view all steps
CREATE POLICY "HR/Admin can view all steps" 
  ON public.request_approval_steps 
  FOR SELECT 
  USING (
    has_any_role(auth.uid(), ARRAY['hr', 'admin']::app_role[])
  );

-- HR/Admin can insert steps (when initiating workflow)
CREATE POLICY "HR/Admin can insert steps" 
  ON public.request_approval_steps 
  FOR INSERT 
  WITH CHECK (
    has_any_role(auth.uid(), ARRAY['hr', 'admin']::app_role[])
  );

-- Employees can insert steps for their own requests
CREATE POLICY "Employees can insert steps for their requests" 
  ON public.request_approval_steps 
  FOR INSERT 
  WITH CHECK (
    request_type = 'time_off' AND EXISTS (
      SELECT 1 FROM public.leave_requests lr 
      JOIN public.employees e ON lr.employee_id = e.id 
      WHERE lr.id = request_id AND e.user_id = auth.uid()
    )
  );

-- Approvers can update their pending steps (to approve/reject)
CREATE POLICY "Approvers can update their pending steps" 
  ON public.request_approval_steps 
  FOR UPDATE 
  USING (
    approver_user_id = auth.uid() AND status = 'pending'
  );

-- HR/Admin can update any steps
CREATE POLICY "HR/Admin can update any steps" 
  ON public.request_approval_steps 
  FOR UPDATE 
  USING (
    has_any_role(auth.uid(), ARRAY['hr', 'admin']::app_role[])
  );

-- 9. Create trigger to update updated_at on approval_workflows
CREATE TRIGGER update_approval_workflows_updated_at
  BEFORE UPDATE ON public.approval_workflows
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();