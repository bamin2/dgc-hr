-- Add column to document_templates for employee request availability
ALTER TABLE document_templates 
ADD COLUMN IF NOT EXISTS available_for_request BOOLEAN DEFAULT false;

-- Create hr_document_requests table
CREATE TABLE hr_document_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES document_templates(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  notes TEXT,
  generated_document_id UUID REFERENCES generated_documents(id),
  rejection_reason TEXT,
  processed_by UUID REFERENCES profiles(id),
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE hr_document_requests ENABLE ROW LEVEL SECURITY;

-- RLS: Employees can view their own requests
CREATE POLICY "Employees can view their own HR document requests"
ON hr_document_requests
FOR SELECT
USING (
  employee_id IN (
    SELECT id FROM employees WHERE user_id = auth.uid()
  )
);

-- RLS: Employees can create their own requests
CREATE POLICY "Employees can create their own HR document requests"
ON hr_document_requests
FOR INSERT
WITH CHECK (
  employee_id IN (
    SELECT id FROM employees WHERE user_id = auth.uid()
  )
);

-- RLS: Employees can update their own pending requests (e.g., cancel)
CREATE POLICY "Employees can update their own pending HR document requests"
ON hr_document_requests
FOR UPDATE
USING (
  employee_id IN (
    SELECT id FROM employees WHERE user_id = auth.uid()
  )
  AND status = 'pending'
);

-- RLS: HR/Admin can view all requests (using user_roles table)
CREATE POLICY "HR can view all HR document requests"
ON hr_document_requests
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('hr', 'admin')
  )
);

-- RLS: HR/Admin can update all requests
CREATE POLICY "HR can update all HR document requests"
ON hr_document_requests
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('hr', 'admin')
  )
);

-- Create trigger for updated_at
CREATE TRIGGER update_hr_document_requests_updated_at
BEFORE UPDATE ON hr_document_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();