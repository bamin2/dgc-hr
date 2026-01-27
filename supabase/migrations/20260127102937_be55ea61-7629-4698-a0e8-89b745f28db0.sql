-- Fix payslip-templates storage bucket: Restrict to HR/Admin only
-- Drop the overly permissive policies first

DROP POLICY IF EXISTS "Authenticated users can upload payslip templates" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view payslip templates" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update payslip templates" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete payslip templates" ON storage.objects;

-- Create HR/Admin-only policies for payslip-templates bucket

-- SELECT: Only HR and Admin can view payslip templates
CREATE POLICY "HR and Admin can view payslip templates"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'payslip-templates' 
  AND public.has_any_role(auth.uid(), ARRAY['hr'::public.app_role, 'admin'::public.app_role])
);

-- INSERT: Only HR and Admin can upload payslip templates
CREATE POLICY "HR and Admin can upload payslip templates"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'payslip-templates' 
  AND public.has_any_role(auth.uid(), ARRAY['hr'::public.app_role, 'admin'::public.app_role])
);

-- UPDATE: Only HR and Admin can update payslip templates
CREATE POLICY "HR and Admin can update payslip templates"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'payslip-templates' 
  AND public.has_any_role(auth.uid(), ARRAY['hr'::public.app_role, 'admin'::public.app_role])
)
WITH CHECK (
  bucket_id = 'payslip-templates' 
  AND public.has_any_role(auth.uid(), ARRAY['hr'::public.app_role, 'admin'::public.app_role])
);

-- DELETE: Only HR and Admin can delete payslip templates
CREATE POLICY "HR and Admin can delete payslip templates"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'payslip-templates' 
  AND public.has_any_role(auth.uid(), ARRAY['hr'::public.app_role, 'admin'::public.app_role])
);