-- Create smart_tags table
CREATE TABLE public.smart_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tag TEXT NOT NULL UNIQUE,
  field TEXT NOT NULL,
  source TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  is_system BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.smart_tags ENABLE ROW LEVEL SECURITY;

-- Policy: All authenticated users can read
CREATE POLICY "Authenticated users can view smart tags"
  ON public.smart_tags FOR SELECT
  USING (true);

-- Policy: Only HR/Admin can insert
CREATE POLICY "HR and Admin can insert smart tags"
  ON public.smart_tags FOR INSERT
  WITH CHECK (has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role]));

-- Policy: Only HR/Admin can update
CREATE POLICY "HR and Admin can update smart tags"
  ON public.smart_tags FOR UPDATE
  USING (has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role]));

-- Policy: Only HR/Admin can delete non-system tags
CREATE POLICY "HR and Admin can delete non-system smart tags"
  ON public.smart_tags FOR DELETE
  USING (has_any_role(auth.uid(), ARRAY['hr'::app_role, 'admin'::app_role]) AND is_system = false);

-- Create updated_at trigger
CREATE TRIGGER update_smart_tags_updated_at
  BEFORE UPDATE ON public.smart_tags
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Seed default smart tags from the existing data
INSERT INTO public.smart_tags (tag, field, source, category, description, is_system) VALUES
  -- Employee fields
  ('<<First Name>>', 'first_name', 'employee', 'Employee', 'Employee''s first name', true),
  ('<<Last Name>>', 'last_name', 'employee', 'Employee', 'Employee''s last name', true),
  ('<<Full Name>>', 'full_name', 'employee', 'Employee', 'Employee''s full name', true),
  ('<<Email>>', 'email', 'employee', 'Employee', 'Employee''s email address', true),
  ('<<Phone>>', 'phone', 'employee', 'Employee', 'Employee''s phone number', true),
  ('<<Address>>', 'address', 'employee', 'Employee', 'Employee''s address', true),
  ('<<Nationality>>', 'nationality', 'employee', 'Employee', 'Employee''s nationality', true),
  ('<<Employee Code>>', 'employee_code', 'employee', 'Employee', 'Employee ID/code', true),
  ('<<Date of Birth>>', 'date_of_birth', 'employee', 'Employee', 'Employee''s date of birth', true),
  
  -- Employment fields
  ('<<Job Title>>', 'title', 'position', 'Employment', 'Employee''s job title', true),
  ('<<Department>>', 'name', 'department', 'Employment', 'Employee''s department', true),
  ('<<Start Date>>', 'join_date', 'employee', 'Employment', 'Employment start date', true),
  ('<<End Date>>', 'end_date', 'employee', 'Employment', 'Employment end date (for terminations)', true),
  ('<<Work Location>>', 'name', 'work_location', 'Employment', 'Work location name', true),
  ('<<Manager Name>>', 'full_name', 'manager', 'Employment', 'Direct manager''s name', true),
  ('<<Contract Period>>', 'contract_period', 'employee', 'Employment', 'Duration of contract', true),
  ('<<Probation Period>>', 'probation_period', 'employee', 'Employment', 'Probation period duration', true),
  ('<<Notice Period>>', 'notice_period', 'employee', 'Employment', 'Required notice period', true),
  
  -- Compensation fields
  ('<<Salary>>', 'salary', 'employee', 'Compensation', 'Monthly salary amount', true),
  ('<<Currency>>', 'currency', 'work_location', 'Compensation', 'Salary currency', true),
  ('<<Net Allowances>>', 'net_allowances', 'employee', 'Compensation', 'Total monthly allowances', true),
  ('<<Annual Leave Days>>', 'annual_leave_days', 'employee', 'Compensation', 'Number of annual leave days', true),
  
  -- Company fields
  ('<<Company Logo>>', 'logo_url', 'company', 'Company', 'Company logo image', true),
  ('<<Company Name>>', 'name', 'company', 'Company', 'Company name', true),
  ('<<Company Legal Name>>', 'legal_name', 'company', 'Company', 'Company legal name', true),
  ('<<Company Address>>', 'full_address', 'company', 'Company', 'Full company address', true),
  ('<<Company Email>>', 'email', 'company', 'Company', 'Company email', true),
  ('<<Company Phone>>', 'phone', 'company', 'Company', 'Company phone number', true),
  
  -- Signature fields
  ('<<Signature Title>>', 'signature_title', 'system', 'Signature', 'Title of the signing authority (e.g., HR Director)', true),
  ('<<Signature Name>>', 'signature_name', 'system', 'Signature', 'Name of the signing authority', true),
  
  -- Date fields
  ('<<Current Date>>', 'current_date', 'system', 'Date', 'Today''s date', true),
  ('<<Current Year>>', 'current_year', 'system', 'Date', 'Current year', true),
  ('<<Offer Expiry Date>>', 'offer_expiry_date', 'system', 'Date', 'Date by which offer must be accepted', true);