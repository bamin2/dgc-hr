-- Fix overly permissive RLS policies on public_holidays table
-- Only HR/Admin should be able to INSERT, UPDATE, DELETE

-- Drop existing permissive policies for write operations
DROP POLICY IF EXISTS "Authenticated users can insert public holidays" ON public.public_holidays;
DROP POLICY IF EXISTS "Authenticated users can update public holidays" ON public.public_holidays;
DROP POLICY IF EXISTS "Authenticated users can delete public holidays" ON public.public_holidays;
DROP POLICY IF EXISTS "public_holidays_insert" ON public.public_holidays;
DROP POLICY IF EXISTS "public_holidays_update" ON public.public_holidays;
DROP POLICY IF EXISTS "public_holidays_delete" ON public.public_holidays;

-- Create restricted policies for public_holidays
CREATE POLICY "HR and Admin can insert public holidays"
ON public.public_holidays
FOR INSERT
TO authenticated
WITH CHECK (public.has_any_role(ARRAY['hr'::public.app_role, 'admin'::public.app_role], auth.uid()));

CREATE POLICY "HR and Admin can update public holidays"
ON public.public_holidays
FOR UPDATE
TO authenticated
USING (public.has_any_role(ARRAY['hr'::public.app_role, 'admin'::public.app_role], auth.uid()))
WITH CHECK (public.has_any_role(ARRAY['hr'::public.app_role, 'admin'::public.app_role], auth.uid()));

CREATE POLICY "HR and Admin can delete public holidays"
ON public.public_holidays
FOR DELETE
TO authenticated
USING (public.has_any_role(ARRAY['hr'::public.app_role, 'admin'::public.app_role], auth.uid()));

-- Fix banks table - restrict write operations to HR/Admin
DROP POLICY IF EXISTS "Authenticated users can insert banks" ON public.banks;
DROP POLICY IF EXISTS "Authenticated users can update banks" ON public.banks;
DROP POLICY IF EXISTS "Authenticated users can delete banks" ON public.banks;
DROP POLICY IF EXISTS "banks_insert" ON public.banks;
DROP POLICY IF EXISTS "banks_update" ON public.banks;
DROP POLICY IF EXISTS "banks_delete" ON public.banks;

CREATE POLICY "HR and Admin can insert banks"
ON public.banks
FOR INSERT
TO authenticated
WITH CHECK (public.has_any_role(ARRAY['hr'::public.app_role, 'admin'::public.app_role], auth.uid()));

CREATE POLICY "HR and Admin can update banks"
ON public.banks
FOR UPDATE
TO authenticated
USING (public.has_any_role(ARRAY['hr'::public.app_role, 'admin'::public.app_role], auth.uid()))
WITH CHECK (public.has_any_role(ARRAY['hr'::public.app_role, 'admin'::public.app_role], auth.uid()));

CREATE POLICY "HR and Admin can delete banks"
ON public.banks
FOR DELETE
TO authenticated
USING (public.has_any_role(ARRAY['hr'::public.app_role, 'admin'::public.app_role], auth.uid()));

-- Fix document_templates table - restrict write operations to HR/Admin
DROP POLICY IF EXISTS "Authenticated users can insert document templates" ON public.document_templates;
DROP POLICY IF EXISTS "Authenticated users can update document templates" ON public.document_templates;
DROP POLICY IF EXISTS "Authenticated users can delete document templates" ON public.document_templates;
DROP POLICY IF EXISTS "document_templates_insert" ON public.document_templates;
DROP POLICY IF EXISTS "document_templates_update" ON public.document_templates;
DROP POLICY IF EXISTS "document_templates_delete" ON public.document_templates;

CREATE POLICY "HR and Admin can insert document templates"
ON public.document_templates
FOR INSERT
TO authenticated
WITH CHECK (public.has_any_role(ARRAY['hr'::public.app_role, 'admin'::public.app_role], auth.uid()));

CREATE POLICY "HR and Admin can update document templates"
ON public.document_templates
FOR UPDATE
TO authenticated
USING (public.has_any_role(ARRAY['hr'::public.app_role, 'admin'::public.app_role], auth.uid()))
WITH CHECK (public.has_any_role(ARRAY['hr'::public.app_role, 'admin'::public.app_role], auth.uid()));

CREATE POLICY "HR and Admin can delete document templates"
ON public.document_templates
FOR DELETE
TO authenticated
USING (public.has_any_role(ARRAY['hr'::public.app_role, 'admin'::public.app_role], auth.uid()));

-- Fix generated_documents table - restrict write operations to HR/Admin
DROP POLICY IF EXISTS "Authenticated users can insert generated documents" ON public.generated_documents;
DROP POLICY IF EXISTS "Authenticated users can update generated documents" ON public.generated_documents;
DROP POLICY IF EXISTS "Authenticated users can delete generated documents" ON public.generated_documents;
DROP POLICY IF EXISTS "generated_documents_insert" ON public.generated_documents;
DROP POLICY IF EXISTS "generated_documents_update" ON public.generated_documents;
DROP POLICY IF EXISTS "generated_documents_delete" ON public.generated_documents;

CREATE POLICY "HR and Admin can insert generated documents"
ON public.generated_documents
FOR INSERT
TO authenticated
WITH CHECK (public.has_any_role(ARRAY['hr'::public.app_role, 'admin'::public.app_role], auth.uid()));

CREATE POLICY "HR and Admin can update generated documents"
ON public.generated_documents
FOR UPDATE
TO authenticated
USING (public.has_any_role(ARRAY['hr'::public.app_role, 'admin'::public.app_role], auth.uid()))
WITH CHECK (public.has_any_role(ARRAY['hr'::public.app_role, 'admin'::public.app_role], auth.uid()));

CREATE POLICY "HR and Admin can delete generated documents"
ON public.generated_documents
FOR DELETE
TO authenticated
USING (public.has_any_role(ARRAY['hr'::public.app_role, 'admin'::public.app_role], auth.uid()));