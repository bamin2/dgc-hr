-- Add missing RLS policy to allow HR and Admin to manage all beneficiaries
-- This fixes the issue where HR/Admin could create enrollments for employees
-- but couldn't insert the associated dependents/beneficiaries

CREATE POLICY "HR and Admin can manage all beneficiaries"
ON public.benefit_beneficiaries
FOR ALL
TO public
USING (has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role]))
WITH CHECK (has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role]));