-- Add approval_mode column to document_templates
ALTER TABLE document_templates 
ADD COLUMN IF NOT EXISTS approval_mode TEXT NOT NULL DEFAULT 'hr_approval'
CHECK (approval_mode IN ('auto_generate', 'hr_approval', 'admin_approval'));

-- Add docx_storage_path for private DOCX storage (like payslip templates)
ALTER TABLE document_templates 
ADD COLUMN IF NOT EXISTS docx_storage_path TEXT;

-- Add original_filename for DOCX
ALTER TABLE document_templates 
ADD COLUMN IF NOT EXISTS docx_original_filename TEXT;

-- Add pdf_storage_path to hr_document_requests for generated documents
ALTER TABLE hr_document_requests 
ADD COLUMN IF NOT EXISTS pdf_storage_path TEXT;

-- Create storage bucket for HR letters (private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('hr-letters', 'hr-letters', false)
ON CONFLICT (id) DO NOTHING;

-- RLS: Employees can read their own HR letters
CREATE POLICY "Employees can read own HR letters"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'hr-letters' AND
  EXISTS (
    SELECT 1 FROM employees e 
    WHERE e.user_id = auth.uid() 
    AND (storage.foldername(name))[1] = e.id::text
  )
);

-- RLS: HR/Admin can read all HR letters
CREATE POLICY "HR Admin can read all HR letters"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'hr-letters' AND
  public.has_any_role(auth.uid(), ARRAY['hr', 'admin']::app_role[])
);

-- RLS: HR/Admin can upload HR letters
CREATE POLICY "HR Admin can upload HR letters"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'hr-letters' AND
  public.has_any_role(auth.uid(), ARRAY['hr', 'admin']::app_role[])
);

-- RLS: HR/Admin can update HR letters
CREATE POLICY "HR Admin can update HR letters"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'hr-letters' AND
  public.has_any_role(auth.uid(), ARRAY['hr', 'admin']::app_role[])
);

-- RLS: HR/Admin can delete HR letters
CREATE POLICY "HR Admin can delete HR letters"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'hr-letters' AND
  public.has_any_role(auth.uid(), ARRAY['hr', 'admin']::app_role[])
);