-- Extend leave_types table with policy rules
ALTER TABLE leave_types 
ADD COLUMN IF NOT EXISTS count_weekends boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS requires_document boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS document_required_after_days integer DEFAULT NULL,
ADD COLUMN IF NOT EXISTS visible_to_employees boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS allow_carryover boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS max_carryover_days integer DEFAULT NULL,
ADD COLUMN IF NOT EXISTS min_days_notice integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS max_consecutive_days integer DEFAULT NULL;

-- Create leave_balance_adjustments table to track manual changes
CREATE TABLE public.leave_balance_adjustments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  leave_balance_id uuid REFERENCES leave_balances(id) ON DELETE CASCADE NOT NULL,
  employee_id uuid REFERENCES employees(id) ON DELETE CASCADE NOT NULL,
  leave_type_id uuid REFERENCES leave_types(id) ON DELETE CASCADE NOT NULL,
  adjustment_days numeric NOT NULL,
  adjustment_type text NOT NULL CHECK (adjustment_type IN ('manual', 'carryover', 'expiry', 'correction')),
  reason text,
  adjusted_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.leave_balance_adjustments ENABLE ROW LEVEL SECURITY;

-- RLS policies for leave_balance_adjustments
-- HR and Admin can view all adjustments
CREATE POLICY "HR and Admin can view all adjustments"
ON public.leave_balance_adjustments
FOR SELECT
USING (
  public.has_any_role(ARRAY['hr'::app_role, 'admin'::app_role], auth.uid())
);

-- HR and Admin can create adjustments
CREATE POLICY "HR and Admin can create adjustments"
ON public.leave_balance_adjustments
FOR INSERT
WITH CHECK (
  public.has_any_role(ARRAY['hr'::app_role, 'admin'::app_role], auth.uid())
);

-- HR and Admin can update adjustments
CREATE POLICY "HR and Admin can update adjustments"
ON public.leave_balance_adjustments
FOR UPDATE
USING (
  public.has_any_role(ARRAY['hr'::app_role, 'admin'::app_role], auth.uid())
);

-- HR and Admin can delete adjustments
CREATE POLICY "HR and Admin can delete adjustments"
ON public.leave_balance_adjustments
FOR DELETE
USING (
  public.has_any_role(ARRAY['hr'::app_role, 'admin'::app_role], auth.uid())
);

-- Employees can view their own adjustments
CREATE POLICY "Employees can view own adjustments"
ON public.leave_balance_adjustments
FOR SELECT
USING (
  employee_id = public.get_user_employee_id(auth.uid())
);

-- Create indexes for performance
CREATE INDEX idx_leave_balance_adjustments_employee_id ON public.leave_balance_adjustments(employee_id);
CREATE INDEX idx_leave_balance_adjustments_leave_type_id ON public.leave_balance_adjustments(leave_type_id);
CREATE INDEX idx_leave_balance_adjustments_created_at ON public.leave_balance_adjustments(created_at DESC);