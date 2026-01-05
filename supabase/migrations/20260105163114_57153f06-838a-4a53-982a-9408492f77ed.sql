-- Phase 1: Attendance & Leave Management Tables

-- 1. Leave Types Table (reference table for leave categories)
CREATE TABLE public.leave_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT DEFAULT '#3b82f6',
  max_days_per_year INTEGER,
  is_paid BOOLEAN DEFAULT true,
  requires_approval BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Attendance Records Table
CREATE TABLE public.attendance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  check_in TIME,
  check_out TIME,
  status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late', 'on_leave', 'half_day', 'remote')),
  work_hours NUMERIC(4,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(employee_id, date)
);

-- 3. Leave Balances Table
CREATE TABLE public.leave_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  leave_type_id UUID NOT NULL REFERENCES public.leave_types(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  total_days NUMERIC(5,2) NOT NULL DEFAULT 0,
  used_days NUMERIC(5,2) DEFAULT 0,
  pending_days NUMERIC(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(employee_id, leave_type_id, year)
);

-- 4. Leave Requests Table
CREATE TABLE public.leave_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  leave_type_id UUID NOT NULL REFERENCES public.leave_types(id),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  days_count NUMERIC(5,2) NOT NULL,
  is_half_day BOOLEAN DEFAULT false,
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES public.employees(id),
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.leave_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;

-- Leave Types Policies (reference data - read by all, managed by HR/Admin)
CREATE POLICY "Authenticated users can view leave types"
  ON public.leave_types FOR SELECT
  USING (true);

CREATE POLICY "HR and Admin can insert leave types"
  ON public.leave_types FOR INSERT
  WITH CHECK (has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role]));

CREATE POLICY "HR and Admin can update leave types"
  ON public.leave_types FOR UPDATE
  USING (has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role]));

CREATE POLICY "HR and Admin can delete leave types"
  ON public.leave_types FOR DELETE
  USING (has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role]));

-- Attendance Records Policies
CREATE POLICY "Employees can view own attendance"
  ON public.attendance_records FOR SELECT
  USING (employee_id = get_user_employee_id(auth.uid()));

CREATE POLICY "HR and Admin can view all attendance"
  ON public.attendance_records FOR SELECT
  USING (has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role]));

CREATE POLICY "Managers can view reports attendance"
  ON public.attendance_records FOR SELECT
  USING (is_manager_of(auth.uid(), employee_id));

CREATE POLICY "Employees can insert own attendance"
  ON public.attendance_records FOR INSERT
  WITH CHECK (employee_id = get_user_employee_id(auth.uid()));

CREATE POLICY "HR and Admin can insert any attendance"
  ON public.attendance_records FOR INSERT
  WITH CHECK (has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role]));

CREATE POLICY "HR and Admin can update any attendance"
  ON public.attendance_records FOR UPDATE
  USING (has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role]));

CREATE POLICY "HR and Admin can delete attendance"
  ON public.attendance_records FOR DELETE
  USING (has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role]));

-- Leave Balances Policies
CREATE POLICY "Employees can view own leave balances"
  ON public.leave_balances FOR SELECT
  USING (employee_id = get_user_employee_id(auth.uid()));

CREATE POLICY "HR and Admin can view all leave balances"
  ON public.leave_balances FOR SELECT
  USING (has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role]));

CREATE POLICY "Managers can view reports leave balances"
  ON public.leave_balances FOR SELECT
  USING (is_manager_of(auth.uid(), employee_id));

CREATE POLICY "HR and Admin can insert leave balances"
  ON public.leave_balances FOR INSERT
  WITH CHECK (has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role]));

CREATE POLICY "HR and Admin can update leave balances"
  ON public.leave_balances FOR UPDATE
  USING (has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role]));

CREATE POLICY "HR and Admin can delete leave balances"
  ON public.leave_balances FOR DELETE
  USING (has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role]));

-- Leave Requests Policies
CREATE POLICY "Employees can view own leave requests"
  ON public.leave_requests FOR SELECT
  USING (employee_id = get_user_employee_id(auth.uid()));

CREATE POLICY "HR and Admin can view all leave requests"
  ON public.leave_requests FOR SELECT
  USING (has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role]));

CREATE POLICY "Managers can view reports leave requests"
  ON public.leave_requests FOR SELECT
  USING (is_manager_of(auth.uid(), employee_id));

CREATE POLICY "Employees can insert own leave requests"
  ON public.leave_requests FOR INSERT
  WITH CHECK (employee_id = get_user_employee_id(auth.uid()));

CREATE POLICY "HR and Admin can insert any leave requests"
  ON public.leave_requests FOR INSERT
  WITH CHECK (has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role]));

CREATE POLICY "Employees can update own pending leave requests"
  ON public.leave_requests FOR UPDATE
  USING (employee_id = get_user_employee_id(auth.uid()) AND status = 'pending');

CREATE POLICY "HR and Admin can update any leave requests"
  ON public.leave_requests FOR UPDATE
  USING (has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role]));

CREATE POLICY "Managers can update reports leave requests"
  ON public.leave_requests FOR UPDATE
  USING (is_manager_of(auth.uid(), employee_id));

CREATE POLICY "Employees can delete own pending leave requests"
  ON public.leave_requests FOR DELETE
  USING (employee_id = get_user_employee_id(auth.uid()) AND status = 'pending');

CREATE POLICY "HR and Admin can delete any leave requests"
  ON public.leave_requests FOR DELETE
  USING (has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role]));

-- Create updated_at triggers
CREATE TRIGGER update_leave_types_updated_at
  BEFORE UPDATE ON public.leave_types
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_attendance_records_updated_at
  BEFORE UPDATE ON public.attendance_records
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_leave_balances_updated_at
  BEFORE UPDATE ON public.leave_balances
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_leave_requests_updated_at
  BEFORE UPDATE ON public.leave_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default leave types
INSERT INTO public.leave_types (name, description, color, max_days_per_year, is_paid, requires_approval) VALUES
  ('Annual Leave', 'Regular paid time off for vacation and personal use', '#22c55e', 20, true, true),
  ('Sick Leave', 'Time off for illness or medical appointments', '#ef4444', 10, true, true),
  ('Personal Leave', 'Personal days for errands or appointments', '#3b82f6', 5, true, true),
  ('Maternity Leave', 'Leave for new mothers', '#ec4899', 90, true, true),
  ('Paternity Leave', 'Leave for new fathers', '#8b5cf6', 10, true, true),
  ('Unpaid Leave', 'Extended leave without pay', '#6b7280', NULL, false, true),
  ('Public Holiday', 'National and regional holidays', '#f59e0b', NULL, true, false),
  ('Work From Home', 'Remote work day', '#06b6d4', NULL, true, false);

-- Create indexes for performance
CREATE INDEX idx_attendance_employee_date ON public.attendance_records(employee_id, date);
CREATE INDEX idx_attendance_date ON public.attendance_records(date);
CREATE INDEX idx_leave_balances_employee_year ON public.leave_balances(employee_id, year);
CREATE INDEX idx_leave_requests_employee ON public.leave_requests(employee_id);
CREATE INDEX idx_leave_requests_status ON public.leave_requests(status);
CREATE INDEX idx_leave_requests_dates ON public.leave_requests(start_date, end_date);