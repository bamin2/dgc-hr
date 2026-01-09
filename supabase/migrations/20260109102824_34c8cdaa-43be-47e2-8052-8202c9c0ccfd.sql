-- Create document_types table
CREATE TABLE public.document_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  requires_expiry BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.document_types ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read document types
CREATE POLICY "Anyone can read document types"
  ON public.document_types FOR SELECT
  TO authenticated
  USING (true);

-- Seed default document types
INSERT INTO public.document_types (name, description, requires_expiry) VALUES
  ('ID Card', 'National or Government ID Card', true),
  ('Passport', 'Travel passport document', true),
  ('Work Visa', 'Work authorization visa', true),
  ('Employment Contract', 'Signed employment contract', false),
  ('Offer Letter', 'Job offer letter', false),
  ('Educational Certificate', 'Degree or diploma certificate', false),
  ('Professional License', 'Industry-specific license', true),
  ('Medical Certificate', 'Health clearance or fitness certificate', true),
  ('Driving License', 'Valid driving license', true),
  ('Other', 'Other documents', false);

-- Create employee_documents table
CREATE TABLE public.employee_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  document_type_id UUID NOT NULL REFERENCES public.document_types(id),
  document_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  expiry_date DATE,
  issue_date DATE,
  document_number TEXT,
  notes TEXT,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.employee_documents ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read documents (for employees viewing their own, HR viewing all)
CREATE POLICY "Authenticated users can read employee documents"
  ON public.employee_documents FOR SELECT
  TO authenticated
  USING (true);

-- Authenticated users can insert documents
CREATE POLICY "Authenticated users can insert employee documents"
  ON public.employee_documents FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Authenticated users can update documents
CREATE POLICY "Authenticated users can update employee documents"
  ON public.employee_documents FOR UPDATE
  TO authenticated
  USING (true);

-- Authenticated users can delete documents
CREATE POLICY "Authenticated users can delete employee documents"
  ON public.employee_documents FOR DELETE
  TO authenticated
  USING (true);

-- Create document_expiry_notifications table
CREATE TABLE public.document_expiry_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_document_id UUID NOT NULL REFERENCES public.employee_documents(id) ON DELETE CASCADE,
  days_before_expiry INTEGER NOT NULL DEFAULT 30,
  notify_employee BOOLEAN DEFAULT true,
  notify_manager BOOLEAN DEFAULT true,
  notify_hr BOOLEAN DEFAULT true,
  is_sent BOOLEAN DEFAULT false,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.document_expiry_notifications ENABLE ROW LEVEL SECURITY;

-- Authenticated users can manage notification settings
CREATE POLICY "Authenticated users can read document notifications"
  ON public.document_expiry_notifications FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert document notifications"
  ON public.document_expiry_notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update document notifications"
  ON public.document_expiry_notifications FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete document notifications"
  ON public.document_expiry_notifications FOR DELETE
  TO authenticated
  USING (true);

-- Create storage bucket for employee documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('employee-documents', 'employee-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Authenticated users can view employee documents"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'employee-documents');

CREATE POLICY "Authenticated users can upload employee documents"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'employee-documents');

CREATE POLICY "Authenticated users can update employee documents"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'employee-documents');

CREATE POLICY "Authenticated users can delete employee documents"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'employee-documents');

-- Add updated_at trigger
CREATE TRIGGER update_employee_documents_updated_at
  BEFORE UPDATE ON public.employee_documents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();