-- Create storage bucket for DOCX templates
INSERT INTO storage.buckets (id, name, public)
VALUES ('docx-templates', 'docx-templates', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to docx templates
CREATE POLICY "DOCX templates are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'docx-templates');

-- Allow authenticated users to upload docx templates
CREATE POLICY "Authenticated users can upload DOCX templates"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'docx-templates' AND auth.role() = 'authenticated');

-- Allow authenticated users to update docx templates
CREATE POLICY "Authenticated users can update DOCX templates"
ON storage.objects FOR UPDATE
USING (bucket_id = 'docx-templates' AND auth.role() = 'authenticated');

-- Allow authenticated users to delete docx templates
CREATE POLICY "Authenticated users can delete DOCX templates"
ON storage.objects FOR DELETE
USING (bucket_id = 'docx-templates' AND auth.role() = 'authenticated');

-- Add docx_template_url column to document_templates
ALTER TABLE public.document_templates 
ADD COLUMN IF NOT EXISTS docx_template_url TEXT;