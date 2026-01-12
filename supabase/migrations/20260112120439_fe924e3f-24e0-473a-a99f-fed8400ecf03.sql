-- Computed relationship function to get the manager of an employee (Many-to-One self-reference)
-- This disambiguates the self-referential foreign key for PostgREST
CREATE OR REPLACE FUNCTION public.manager(employees)
RETURNS SETOF employees
ROWS 1
LANGUAGE sql
STABLE
AS $$
  SELECT * FROM employees WHERE id = $1.manager_id
$$;

-- Computed relationship function to get direct reports of an employee (One-to-Many self-reference)
CREATE OR REPLACE FUNCTION public.direct_reports(employees)
RETURNS SETOF employees
LANGUAGE sql
STABLE
AS $$
  SELECT * FROM employees WHERE manager_id = $1.id
$$;