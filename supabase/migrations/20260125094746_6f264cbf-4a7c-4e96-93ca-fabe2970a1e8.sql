-- Add DELETE policy for HR/Admin to delete HR document requests
CREATE POLICY "HR can delete HR document requests"
  ON public.hr_document_requests
  FOR DELETE
  TO authenticated
  USING (
    public.has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role])
  );