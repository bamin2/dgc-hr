-- Drop existing restrictive policies for payslip-templates bucket
DROP POLICY IF EXISTS "HR and Admin can upload payslip templates" ON storage.objects;
DROP POLICY IF EXISTS "HR and Admin can view payslip templates" ON storage.objects;
DROP POLICY IF EXISTS "HR and Admin can update payslip templates" ON storage.objects;
DROP POLICY IF EXISTS "HR and Admin can delete payslip templates" ON storage.objects;

-- Create simpler policies that allow authenticated users
-- (Access control is handled at the application/route level)
CREATE POLICY "Authenticated users can upload payslip templates"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'payslip-templates' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Authenticated users can view payslip templates"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'payslip-templates' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Authenticated users can update payslip templates"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'payslip-templates' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Authenticated users can delete payslip templates"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'payslip-templates' 
    AND auth.role() = 'authenticated'
  );

-- Drop existing restrictive policies for payslips bucket
DROP POLICY IF EXISTS "HR and Admin can upload payslips" ON storage.objects;
DROP POLICY IF EXISTS "HR and Admin can view payslips" ON storage.objects;
DROP POLICY IF EXISTS "Employees can view own payslips" ON storage.objects;

-- Create simpler policies for payslips bucket
CREATE POLICY "Authenticated users can upload payslips"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'payslips' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Authenticated users can view payslips"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'payslips' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Authenticated users can delete payslips"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'payslips' 
    AND auth.role() = 'authenticated'
  );