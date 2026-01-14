-- Phase 1: Populate missing employees.user_id from profiles.employee_id
UPDATE employees e
SET user_id = p.id
FROM profiles p
WHERE p.employee_id = e.id
  AND e.user_id IS NULL;

-- Phase 2: Create helper function to get current user's employee_id
CREATE OR REPLACE FUNCTION public.get_my_employee_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT id FROM employees WHERE user_id = auth.uid() LIMIT 1;
$$;

-- Phase 3: Update the RLS policy that depends on profiles.employee_id
-- Drop the old policy
DROP POLICY IF EXISTS "Employees can view their own visible documents" ON employee_documents;

-- Create new policy using employees.user_id
CREATE POLICY "Employees can view their own visible documents"
ON employee_documents
FOR SELECT
USING (
  employee_id IN (
    SELECT id FROM employees WHERE user_id = auth.uid()
  )
  AND visible_to_employee = true
);

-- Phase 4: Drop the profiles.employee_id column (no longer needed)
ALTER TABLE profiles DROP COLUMN IF EXISTS employee_id;