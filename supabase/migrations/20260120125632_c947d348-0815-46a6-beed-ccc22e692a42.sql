-- Allow all authenticated users to view employees for directory purposes
CREATE POLICY "All authenticated users can view employees"
ON public.employees
FOR SELECT
TO authenticated
USING (true);