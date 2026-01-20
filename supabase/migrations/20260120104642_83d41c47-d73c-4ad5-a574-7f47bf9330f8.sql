-- Final fixes for remaining permissive RLS policies

-- Fix banks - drop permissive and ensure proper policies
DROP POLICY IF EXISTS "Authenticated users can manage banks" ON public.banks;

-- Fix document_expiry_notifications
DROP POLICY IF EXISTS "Authenticated users can delete document notifications" ON public.document_expiry_notifications;
DROP POLICY IF EXISTS "Authenticated users can insert document notifications" ON public.document_expiry_notifications;
DROP POLICY IF EXISTS "Authenticated users can update document notifications" ON public.document_expiry_notifications;

-- Fix employee_documents
DROP POLICY IF EXISTS "Authenticated users can delete employee documents" ON public.employee_documents;
DROP POLICY IF EXISTS "Authenticated users can insert employee documents" ON public.employee_documents;
DROP POLICY IF EXISTS "Authenticated users can update employee documents" ON public.employee_documents;

-- Fix employee_imports
DROP POLICY IF EXISTS "Authenticated users can update their imports" ON public.employee_imports;

-- Fix loans DELETE
DROP POLICY IF EXISTS "Authenticated users can delete loans" ON public.loans;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'loans' AND policyname = 'HR and Admin can delete loans') THEN
    EXECUTE 'CREATE POLICY "HR and Admin can delete loans" ON public.loans FOR DELETE USING (has_any_role(auth.uid(), ARRAY[''hr''::app_role, ''admin''::app_role]))';
  END IF;
END $$;