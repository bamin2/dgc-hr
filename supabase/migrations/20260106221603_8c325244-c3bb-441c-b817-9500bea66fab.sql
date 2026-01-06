-- Add policy document URL column to benefit_plans
ALTER TABLE benefit_plans 
ADD COLUMN IF NOT EXISTS policy_document_url TEXT;

-- Create storage bucket for benefit documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('benefit-documents', 'benefit-documents', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload benefit documents
CREATE POLICY "Authenticated users can upload benefit documents"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'benefit-documents');

-- Allow public read access to benefit documents
CREATE POLICY "Public can view benefit documents"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'benefit-documents');

-- Allow authenticated users to update their uploads
CREATE POLICY "Authenticated users can update benefit documents"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'benefit-documents');

-- Allow authenticated users to delete benefit documents
CREATE POLICY "Authenticated users can delete benefit documents"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'benefit-documents');