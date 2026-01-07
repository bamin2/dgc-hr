-- Add new columns to payroll_runs for location-based runs
ALTER TABLE payroll_runs
ADD COLUMN IF NOT EXISTS location_id UUID REFERENCES work_locations(id),
ADD COLUMN IF NOT EXISTS created_by UUID;

-- Create payroll run status enum
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payroll_run_status') THEN
    CREATE TYPE payroll_run_status AS ENUM ('draft', 'finalized', 'payslips_issued');
  END IF;
END $$;

-- Create payroll_run_employees table for employee snapshots
CREATE TABLE IF NOT EXISTS payroll_run_employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payroll_run_id UUID NOT NULL REFERENCES payroll_runs(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employees(id),
  employee_name TEXT NOT NULL,
  employee_code TEXT,
  department TEXT,
  position TEXT,
  base_salary NUMERIC DEFAULT 0,
  housing_allowance NUMERIC DEFAULT 0,
  transportation_allowance NUMERIC DEFAULT 0,
  other_allowances JSONB DEFAULT '[]',
  gosi_deduction NUMERIC DEFAULT 0,
  other_deductions JSONB DEFAULT '[]',
  gross_pay NUMERIC DEFAULT 0,
  total_deductions NUMERIC DEFAULT 0,
  net_pay NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(payroll_run_id, employee_id)
);

-- Create payroll_run_adjustments table for one-off items
CREATE TABLE IF NOT EXISTS payroll_run_adjustments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payroll_run_id UUID NOT NULL REFERENCES payroll_runs(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employees(id),
  type TEXT NOT NULL CHECK (type IN ('earning', 'deduction')),
  name TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE payroll_run_employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_run_adjustments ENABLE ROW LEVEL SECURITY;

-- RLS policies for payroll_run_employees
CREATE POLICY "HR and Admin can view all payroll run employees"
ON payroll_run_employees FOR SELECT
USING (has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role]));

CREATE POLICY "HR and Admin can insert payroll run employees"
ON payroll_run_employees FOR INSERT
WITH CHECK (has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role]));

CREATE POLICY "HR and Admin can update payroll run employees"
ON payroll_run_employees FOR UPDATE
USING (has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role]));

CREATE POLICY "HR and Admin can delete payroll run employees"
ON payroll_run_employees FOR DELETE
USING (has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role]));

-- RLS policies for payroll_run_adjustments
CREATE POLICY "HR and Admin can view all payroll run adjustments"
ON payroll_run_adjustments FOR SELECT
USING (has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role]));

CREATE POLICY "HR and Admin can insert payroll run adjustments"
ON payroll_run_adjustments FOR INSERT
WITH CHECK (has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role]));

CREATE POLICY "HR and Admin can update payroll run adjustments"
ON payroll_run_adjustments FOR UPDATE
USING (has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role]));

CREATE POLICY "HR and Admin can delete payroll run adjustments"
ON payroll_run_adjustments FOR DELETE
USING (has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role]));