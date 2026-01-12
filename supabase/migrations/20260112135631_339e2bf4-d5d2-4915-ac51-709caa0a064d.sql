-- Allow employees to view their own payroll run employee records
CREATE POLICY "Employees can view their own payslips"
ON payroll_run_employees
FOR SELECT
USING (
  employee_id IN (
    SELECT id FROM employees 
    WHERE user_id = auth.uid()
  )
);

-- Allow employees to view payroll runs that contain their issued payslips
CREATE POLICY "Employees can view payroll runs for their issued payslips"
ON payroll_runs
FOR SELECT
USING (
  status = 'payslips_issued' 
  AND id IN (
    SELECT payroll_run_id FROM payroll_run_employees
    WHERE employee_id IN (
      SELECT id FROM employees 
      WHERE user_id = auth.uid()
    )
  )
);