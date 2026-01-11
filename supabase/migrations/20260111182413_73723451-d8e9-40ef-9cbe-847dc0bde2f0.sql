-- =====================================================
-- Performance Indexes for Common Query Patterns
-- =====================================================

-- === PAYROLL RUNS ===
-- Used by: usePayrollRuns, get_reports_overview RPC
CREATE INDEX IF NOT EXISTS idx_payroll_runs_status 
  ON payroll_runs(status);

CREATE INDEX IF NOT EXISTS idx_payroll_runs_processed_date 
  ON payroll_runs(processed_date DESC);

CREATE INDEX IF NOT EXISTS idx_payroll_runs_pay_period 
  ON payroll_runs(pay_period_start, pay_period_end);

CREATE INDEX IF NOT EXISTS idx_payroll_runs_status_period 
  ON payroll_runs(status, pay_period_start, pay_period_end);

-- === PAYROLL RUN EMPLOYEES ===
-- Used by: usePayrollRunEmployees, get_reports_overview RPC
CREATE INDEX IF NOT EXISTS idx_payroll_run_employees_run_id 
  ON payroll_run_employees(payroll_run_id);

CREATE INDEX IF NOT EXISTS idx_payroll_run_employees_employee 
  ON payroll_run_employees(employee_id);

-- === REQUEST APPROVAL STEPS ===
-- Used by: useApprovalSteps, usePendingApprovalsCount
CREATE INDEX IF NOT EXISTS idx_approval_steps_approver_status 
  ON request_approval_steps(approver_user_id, status);

CREATE INDEX IF NOT EXISTS idx_approval_steps_request 
  ON request_approval_steps(request_id, request_type);

CREATE INDEX IF NOT EXISTS idx_approval_steps_status 
  ON request_approval_steps(status);

-- === NOTIFICATIONS ===
-- Used by: useNotifications, useUnreadNotificationsCount
CREATE INDEX IF NOT EXISTS idx_notifications_user_read 
  ON notifications(user_id, is_read);

CREATE INDEX IF NOT EXISTS idx_notifications_user_created 
  ON notifications(user_id, created_at DESC);

-- === BENEFIT PLANS ===
-- Used by: useBenefitsMetrics
CREATE INDEX IF NOT EXISTS idx_benefit_plans_status 
  ON benefit_plans(status);

-- === BENEFIT ENROLLMENTS ===
-- Used by: useBenefitsMetrics (status filter)
CREATE INDEX IF NOT EXISTS idx_benefit_enrollments_status 
  ON benefit_enrollments(status);

-- === EMPLOYEES ===
-- Used by: get_dashboard_metrics RPC (new hires count)
CREATE INDEX IF NOT EXISTS idx_employees_created_at 
  ON employees(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_employees_join_date 
  ON employees(join_date);

CREATE INDEX IF NOT EXISTS idx_employees_status_join_date 
  ON employees(status, join_date);

-- === ATTENDANCE RECORDS ===
-- Used by: get_dashboard_metrics RPC, useAttendanceRecords
CREATE INDEX IF NOT EXISTS idx_attendance_status 
  ON attendance_records(status);

CREATE INDEX IF NOT EXISTS idx_attendance_date_status 
  ON attendance_records(date, status);

-- === LEAVE REQUESTS ===
-- Composite for date range + status queries in RPC
CREATE INDEX IF NOT EXISTS idx_leave_requests_status_dates 
  ON leave_requests(status, start_date, end_date);

-- === LOANS ===
-- Composite for employee + status lookups
CREATE INDEX IF NOT EXISTS idx_loans_employee_status 
  ON loans(employee_id, status);

-- === LOAN INSTALLMENTS ===
-- Composite for due date range + status
CREATE INDEX IF NOT EXISTS idx_loan_installments_status_due_date 
  ON loan_installments(status, due_date);