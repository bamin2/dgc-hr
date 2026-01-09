-- Add email-specific smart tags for leave requests and payslips
-- These will use the same <<Tag Name>> syntax as document templates

INSERT INTO smart_tags (tag, field, source, category, description, is_system, is_active)
VALUES 
  -- Leave Request Tags
  ('<<Leave Type>>', 'leave_type', 'system', 'Leave', 'Type of leave requested (e.g., Annual Leave, Sick Leave)', true, true),
  ('<<Leave Start Date>>', 'leave_start_date', 'system', 'Leave', 'Leave start date', true, true),
  ('<<Leave End Date>>', 'leave_end_date', 'system', 'Leave', 'Leave end date', true, true),
  ('<<Leave Days Count>>', 'leave_days_count', 'system', 'Leave', 'Total number of leave days requested', true, true),
  ('<<Leave Reason>>', 'leave_reason', 'system', 'Leave', 'Reason for leave request (if provided)', true, true),
  ('<<Reviewer Name>>', 'reviewer_name', 'system', 'Leave', 'Name of the person who reviewed the request', true, true),
  ('<<Rejection Reason>>', 'rejection_reason', 'system', 'Leave', 'Reason for rejection (if rejected)', true, true),
  
  -- Payslip Tags
  ('<<Pay Period>>', 'pay_period', 'system', 'Payroll', 'Pay period (e.g., January 2026)', true, true),
  ('<<Net Pay>>', 'net_pay', 'system', 'Payroll', 'Net pay amount after all deductions', true, true),
  ('<<Gross Pay>>', 'gross_pay', 'system', 'Payroll', 'Gross pay amount before deductions', true, true),
  ('<<Total Deductions>>', 'total_deductions', 'system', 'Payroll', 'Total deductions from payslip', true, true),
  ('<<Total Earnings>>', 'total_earnings', 'system', 'Payroll', 'Total earnings including allowances', true, true)
ON CONFLICT DO NOTHING;