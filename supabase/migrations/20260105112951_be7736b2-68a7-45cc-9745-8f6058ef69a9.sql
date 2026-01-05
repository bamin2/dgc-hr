-- Create Operations department
INSERT INTO departments (name, description)
VALUES ('Operations', 'Operations and business management');

-- Create Vice President position in Operations
INSERT INTO positions (title, department_id, level)
SELECT 'Vice President', id, 9
FROM departments WHERE name = 'Operations';

-- Create employee record for Bader Amin
INSERT INTO employees (
  first_name,
  last_name,
  email,
  department_id,
  position_id,
  status,
  employee_code,
  join_date
)
SELECT 
  'Bader',
  'Amin',
  'bamin@dgcholding.com',
  d.id,
  p.id,
  'active',
  'EMP001',
  CURRENT_DATE
FROM departments d
JOIN positions p ON p.department_id = d.id AND p.title = 'Vice President'
WHERE d.name = 'Operations';