
-- Fix RLS policies for payroll_runs table
-- Drop the overly permissive policies
DROP POLICY IF EXISTS "Allow public read access on payroll_runs" ON payroll_runs;
DROP POLICY IF EXISTS "Allow public insert access on payroll_runs" ON payroll_runs;

-- Create proper role-based policies
CREATE POLICY "HR and Admin can view all payroll runs"
ON payroll_runs FOR SELECT
USING (has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role]));

CREATE POLICY "HR and Admin can insert payroll runs"
ON payroll_runs FOR INSERT
WITH CHECK (has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role]));

CREATE POLICY "HR and Admin can update payroll runs"
ON payroll_runs FOR UPDATE
USING (has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role]));

CREATE POLICY "HR and Admin can delete draft payroll runs"
ON payroll_runs FOR DELETE
USING (
  has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role])
  AND status = 'draft'
);
