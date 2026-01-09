-- Add self-service visibility settings to company_settings
ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS employee_can_view_compensation boolean DEFAULT true;
ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS show_compensation_line_items boolean DEFAULT false;

-- Add visibility flag to employee_documents for self-service access
ALTER TABLE employee_documents ADD COLUMN IF NOT EXISTS visible_to_employee boolean DEFAULT false;

-- Create RLS policy for employees to view their own visible documents
CREATE POLICY "Employees can view their own visible documents"
ON employee_documents FOR SELECT
TO authenticated
USING (
  employee_id IN (
    SELECT employee_id FROM profiles WHERE id = auth.uid()
  )
  AND visible_to_employee = true
);

-- Update existing RLS policies to maintain HR/Admin access
-- Note: Existing policies should already handle HR/Admin access