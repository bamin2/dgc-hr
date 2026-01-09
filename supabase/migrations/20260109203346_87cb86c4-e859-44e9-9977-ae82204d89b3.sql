-- Add compensation smart tags for salary calculations
INSERT INTO public.smart_tags (tag, field, source, category, description, is_system, is_active) 
VALUES 
  ('<<Basic Salary>>', 'basic_salary', 'employee', 'Compensation', 'Base salary before allowances', true, true),
  ('<<Gross Salary>>', 'gross_salary', 'employee', 'Compensation', 'Basic salary plus all allowances', true, true),
  ('<<Total Allowances>>', 'total_allowances', 'employee', 'Compensation', 'Sum of all monthly allowances', true, true),
  ('<<Net Deductions>>', 'net_deductions', 'employee', 'Compensation', 'Total deductions including GOSI', true, true),
  ('<<Net Salary>>', 'net_salary', 'employee', 'Compensation', 'Take-home pay after all deductions', true, true)
ON CONFLICT (tag) DO NOTHING;