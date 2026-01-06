-- Create enum for correction status
CREATE TYPE correction_status AS ENUM ('pending_manager', 'pending_hr', 'approved', 'rejected');

-- Create attendance_corrections table
CREATE TABLE public.attendance_corrections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  attendance_record_id UUID NOT NULL REFERENCES public.attendance_records(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  original_check_in TIME WITHOUT TIME ZONE,
  original_check_out TIME WITHOUT TIME ZONE,
  corrected_check_in TIME WITHOUT TIME ZONE NOT NULL,
  corrected_check_out TIME WITHOUT TIME ZONE,
  reason TEXT NOT NULL,
  status correction_status NOT NULL DEFAULT 'pending_manager',
  manager_id UUID REFERENCES public.employees(id),
  manager_reviewed_at TIMESTAMP WITH TIME ZONE,
  manager_notes TEXT,
  hr_reviewer_id UUID REFERENCES public.employees(id),
  hr_reviewed_at TIMESTAMP WITH TIME ZONE,
  hr_notes TEXT,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.attendance_corrections ENABLE ROW LEVEL SECURITY;

-- Employees can view their own corrections
CREATE POLICY "Employees can view own corrections"
ON public.attendance_corrections
FOR SELECT
USING (employee_id = get_user_employee_id(auth.uid()));

-- Employees can create corrections for their own attendance
CREATE POLICY "Employees can create own corrections"
ON public.attendance_corrections
FOR INSERT
WITH CHECK (employee_id = get_user_employee_id(auth.uid()));

-- Managers can view corrections from their team
CREATE POLICY "Managers can view team corrections"
ON public.attendance_corrections
FOR SELECT
USING (is_manager_of(employee_id, auth.uid()));

-- Managers can update corrections pending their approval
CREATE POLICY "Managers can update pending corrections"
ON public.attendance_corrections
FOR UPDATE
USING (
  is_manager_of(employee_id, auth.uid()) 
  AND status = 'pending_manager'
);

-- HR and Admin can view all corrections
CREATE POLICY "HR and Admin can view all corrections"
ON public.attendance_corrections
FOR SELECT
USING (has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role]));

-- HR and Admin can update corrections pending HR approval
CREATE POLICY "HR and Admin can update pending HR corrections"
ON public.attendance_corrections
FOR UPDATE
USING (
  has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role])
  AND status = 'pending_hr'
);

-- HR and Admin can delete corrections
CREATE POLICY "HR and Admin can delete corrections"
ON public.attendance_corrections
FOR DELETE
USING (has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role]));

-- Create updated_at trigger
CREATE TRIGGER update_attendance_corrections_updated_at
BEFORE UPDATE ON public.attendance_corrections
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();