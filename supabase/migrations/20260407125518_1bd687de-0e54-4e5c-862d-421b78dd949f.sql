
-- HR and admin can insert employee documents
CREATE POLICY "HR and admin can insert employee documents"
ON public.employee_documents
FOR INSERT
TO authenticated
WITH CHECK (
  public.has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role])
);

-- HR and admin can update employee documents
CREATE POLICY "HR and admin can update employee documents"
ON public.employee_documents
FOR UPDATE
TO authenticated
USING (
  public.has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role])
)
WITH CHECK (
  public.has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role])
);

-- HR and admin can delete employee documents
CREATE POLICY "HR and admin can delete employee documents"
ON public.employee_documents
FOR DELETE
TO authenticated
USING (
  public.has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role])
);

-- HR and admin can insert document expiry notifications
CREATE POLICY "HR and admin can insert document expiry notifications"
ON public.document_expiry_notifications
FOR INSERT
TO authenticated
WITH CHECK (
  public.has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role])
);

-- HR and admin can update document expiry notifications
CREATE POLICY "HR and admin can update document expiry notifications"
ON public.document_expiry_notifications
FOR UPDATE
TO authenticated
USING (
  public.has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role])
)
WITH CHECK (
  public.has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role])
);

-- HR and admin can delete document expiry notifications
CREATE POLICY "HR and admin can delete document expiry notifications"
ON public.document_expiry_notifications
FOR DELETE
TO authenticated
USING (
  public.has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role])
);
