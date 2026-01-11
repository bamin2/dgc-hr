-- Create enums for the Hiring module
CREATE TYPE candidate_status AS ENUM (
  'draft', 'in_process', 'offer_sent', 'offer_accepted', 'offer_rejected', 'archived'
);

CREATE TYPE offer_status AS ENUM (
  'draft', 'sent', 'accepted', 'rejected', 'expired', 'archived'
);

CREATE TYPE offer_version_status AS ENUM (
  'draft', 'sent', 'superseded', 'accepted', 'rejected', 'expired'
);

CREATE TYPE offer_email_status AS ENUM (
  'draft', 'sent', 'failed'
);

-- Create candidates table
CREATE TABLE public.candidates (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  candidate_code text NOT NULL UNIQUE,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  phone text,
  nationality text,
  work_location_id uuid REFERENCES public.work_locations(id),
  department_id uuid REFERENCES public.departments(id),
  position_id uuid REFERENCES public.positions(id),
  manager_employee_id uuid REFERENCES public.employees(id),
  proposed_start_date date,
  notes text,
  status candidate_status NOT NULL DEFAULT 'draft',
  created_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create offer_letter_templates table
CREATE TABLE public.offer_letter_templates (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_name text NOT NULL,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  subject_template text NOT NULL DEFAULT 'Offer Letter - {job_title} at {company_name}',
  body_template text NOT NULL,
  placeholders_supported text[] DEFAULT ARRAY['candidate_name', 'job_title', 'department', 'work_location', 'start_date', 'currency', 'basic_salary', 'housing_allowance', 'transport_allowance', 'other_allowances', 'gross_pay_total', 'employer_gosi_amount', 'company_name', 'current_date'],
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create offers table
CREATE TABLE public.offers (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  offer_code text NOT NULL UNIQUE,
  candidate_id uuid NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
  status offer_status NOT NULL DEFAULT 'draft',
  current_version_id uuid,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create offer_versions table
CREATE TABLE public.offer_versions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  offer_id uuid NOT NULL REFERENCES public.offers(id) ON DELETE CASCADE,
  version_number integer NOT NULL DEFAULT 1,
  status offer_version_status NOT NULL DEFAULT 'draft',
  effective_date date,
  sent_at timestamp with time zone,
  superseded_at timestamp with time zone,
  accepted_at timestamp with time zone,
  rejected_at timestamp with time zone,
  remarks_internal text,
  change_reason text,
  work_location_id uuid REFERENCES public.work_locations(id),
  department_id uuid REFERENCES public.departments(id),
  position_id uuid REFERENCES public.positions(id),
  manager_employee_id uuid REFERENCES public.employees(id),
  start_date date,
  currency_code text NOT NULL DEFAULT 'SAR',
  basic_salary numeric NOT NULL DEFAULT 0,
  housing_allowance numeric NOT NULL DEFAULT 0,
  transport_allowance numeric NOT NULL DEFAULT 0,
  other_allowances numeric NOT NULL DEFAULT 0,
  deductions_fixed numeric NOT NULL DEFAULT 0,
  gross_pay_total numeric GENERATED ALWAYS AS (basic_salary + housing_allowance + transport_allowance + other_allowances) STORED,
  deductions_total numeric NOT NULL DEFAULT 0,
  net_pay_estimate numeric GENERATED ALWAYS AS (basic_salary + housing_allowance + transport_allowance + other_allowances - deductions_fixed) STORED,
  employer_gosi_amount numeric NOT NULL DEFAULT 0,
  template_id uuid REFERENCES public.offer_letter_templates(id),
  created_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(offer_id, version_number)
);

-- Add foreign key for current_version_id after offer_versions is created
ALTER TABLE public.offers ADD CONSTRAINT offers_current_version_id_fkey 
  FOREIGN KEY (current_version_id) REFERENCES public.offer_versions(id);

-- Create offer_emails table
CREATE TABLE public.offer_emails (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  offer_version_id uuid NOT NULL REFERENCES public.offer_versions(id) ON DELETE CASCADE,
  to_email text NOT NULL,
  subject text NOT NULL,
  body_rendered text NOT NULL,
  status offer_email_status NOT NULL DEFAULT 'draft',
  provider_message_id text,
  error_message text,
  sent_at timestamp with time zone,
  sent_by uuid REFERENCES auth.users(id)
);

-- Create employee_conversion_log table
CREATE TABLE public.employee_conversion_log (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  candidate_id uuid NOT NULL REFERENCES public.candidates(id),
  offer_id uuid NOT NULL REFERENCES public.offers(id),
  offer_version_id uuid NOT NULL REFERENCES public.offer_versions(id),
  employee_id uuid NOT NULL REFERENCES public.employees(id),
  converted_at timestamp with time zone NOT NULL DEFAULT now(),
  converted_by uuid REFERENCES auth.users(id)
);

-- Create sequence for candidate codes
CREATE SEQUENCE IF NOT EXISTS candidate_code_seq START WITH 1;

-- Create sequence for offer codes
CREATE SEQUENCE IF NOT EXISTS offer_code_seq START WITH 1;

-- Function to generate candidate code
CREATE OR REPLACE FUNCTION public.generate_candidate_code()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.candidate_code IS NULL OR NEW.candidate_code = '' THEN
    NEW.candidate_code := 'CAND-' || LPAD(nextval('candidate_code_seq')::text, 4, '0');
  END IF;
  RETURN NEW;
END;
$$;

-- Function to generate offer code
CREATE OR REPLACE FUNCTION public.generate_offer_code()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.offer_code IS NULL OR NEW.offer_code = '' THEN
    NEW.offer_code := 'OFF-' || LPAD(nextval('offer_code_seq')::text, 4, '0');
  END IF;
  RETURN NEW;
END;
$$;

-- Create triggers for auto-generating codes
CREATE TRIGGER generate_candidate_code_trigger
  BEFORE INSERT ON public.candidates
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_candidate_code();

CREATE TRIGGER generate_offer_code_trigger
  BEFORE INSERT ON public.offers
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_offer_code();

-- Create trigger for updating updated_at
CREATE TRIGGER update_candidates_updated_at
  BEFORE UPDATE ON public.candidates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_offers_updated_at
  BEFORE UPDATE ON public.offers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_offer_letter_templates_updated_at
  BEFORE UPDATE ON public.offer_letter_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS on all tables
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offer_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offer_letter_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offer_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_conversion_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for candidates (HR and Admin only)
CREATE POLICY "HR and Admin can view candidates"
  ON public.candidates FOR SELECT
  USING (public.has_any_role(auth.uid(), ARRAY['hr', 'admin']::app_role[]));

CREATE POLICY "HR and Admin can insert candidates"
  ON public.candidates FOR INSERT
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['hr', 'admin']::app_role[]));

CREATE POLICY "HR and Admin can update candidates"
  ON public.candidates FOR UPDATE
  USING (public.has_any_role(auth.uid(), ARRAY['hr', 'admin']::app_role[]));

CREATE POLICY "HR and Admin can delete candidates"
  ON public.candidates FOR DELETE
  USING (public.has_any_role(auth.uid(), ARRAY['hr', 'admin']::app_role[]));

-- RLS Policies for offers
CREATE POLICY "HR and Admin can view offers"
  ON public.offers FOR SELECT
  USING (public.has_any_role(auth.uid(), ARRAY['hr', 'admin']::app_role[]));

CREATE POLICY "HR and Admin can insert offers"
  ON public.offers FOR INSERT
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['hr', 'admin']::app_role[]));

CREATE POLICY "HR and Admin can update offers"
  ON public.offers FOR UPDATE
  USING (public.has_any_role(auth.uid(), ARRAY['hr', 'admin']::app_role[]));

CREATE POLICY "HR and Admin can delete offers"
  ON public.offers FOR DELETE
  USING (public.has_any_role(auth.uid(), ARRAY['hr', 'admin']::app_role[]));

-- RLS Policies for offer_versions
CREATE POLICY "HR and Admin can view offer_versions"
  ON public.offer_versions FOR SELECT
  USING (public.has_any_role(auth.uid(), ARRAY['hr', 'admin']::app_role[]));

CREATE POLICY "HR and Admin can insert offer_versions"
  ON public.offer_versions FOR INSERT
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['hr', 'admin']::app_role[]));

CREATE POLICY "HR and Admin can update offer_versions"
  ON public.offer_versions FOR UPDATE
  USING (public.has_any_role(auth.uid(), ARRAY['hr', 'admin']::app_role[]));

CREATE POLICY "HR and Admin can delete offer_versions"
  ON public.offer_versions FOR DELETE
  USING (public.has_any_role(auth.uid(), ARRAY['hr', 'admin']::app_role[]));

-- RLS Policies for offer_letter_templates
CREATE POLICY "HR and Admin can view offer_letter_templates"
  ON public.offer_letter_templates FOR SELECT
  USING (public.has_any_role(auth.uid(), ARRAY['hr', 'admin']::app_role[]));

CREATE POLICY "HR and Admin can insert offer_letter_templates"
  ON public.offer_letter_templates FOR INSERT
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['hr', 'admin']::app_role[]));

CREATE POLICY "HR and Admin can update offer_letter_templates"
  ON public.offer_letter_templates FOR UPDATE
  USING (public.has_any_role(auth.uid(), ARRAY['hr', 'admin']::app_role[]));

CREATE POLICY "HR and Admin can delete offer_letter_templates"
  ON public.offer_letter_templates FOR DELETE
  USING (public.has_any_role(auth.uid(), ARRAY['hr', 'admin']::app_role[]));

-- RLS Policies for offer_emails
CREATE POLICY "HR and Admin can view offer_emails"
  ON public.offer_emails FOR SELECT
  USING (public.has_any_role(auth.uid(), ARRAY['hr', 'admin']::app_role[]));

CREATE POLICY "HR and Admin can insert offer_emails"
  ON public.offer_emails FOR INSERT
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['hr', 'admin']::app_role[]));

CREATE POLICY "HR and Admin can update offer_emails"
  ON public.offer_emails FOR UPDATE
  USING (public.has_any_role(auth.uid(), ARRAY['hr', 'admin']::app_role[]));

-- RLS Policies for employee_conversion_log
CREATE POLICY "HR and Admin can view employee_conversion_log"
  ON public.employee_conversion_log FOR SELECT
  USING (public.has_any_role(auth.uid(), ARRAY['hr', 'admin']::app_role[]));

CREATE POLICY "HR and Admin can insert employee_conversion_log"
  ON public.employee_conversion_log FOR INSERT
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['hr', 'admin']::app_role[]));

-- Create indexes for performance
CREATE INDEX idx_candidates_status ON public.candidates(status);
CREATE INDEX idx_candidates_department ON public.candidates(department_id);
CREATE INDEX idx_candidates_work_location ON public.candidates(work_location_id);
CREATE INDEX idx_offers_candidate ON public.offers(candidate_id);
CREATE INDEX idx_offers_status ON public.offers(status);
CREATE INDEX idx_offer_versions_offer ON public.offer_versions(offer_id);
CREATE INDEX idx_offer_versions_status ON public.offer_versions(status);
CREATE INDEX idx_offer_emails_version ON public.offer_emails(offer_version_id);
CREATE INDEX idx_conversion_log_candidate ON public.employee_conversion_log(candidate_id);

-- Insert a default offer letter template
INSERT INTO public.offer_letter_templates (template_name, description, body_template)
VALUES (
  'Standard Offer Letter',
  'Default offer letter template for new hires',
  '<div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px;">
<p style="text-align: right;">{current_date}</p>

<p>Dear {candidate_name},</p>

<p>We are pleased to extend an offer of employment for the position of <strong>{job_title}</strong> in the <strong>{department}</strong> department at <strong>{company_name}</strong>.</p>

<h3>Position Details</h3>
<ul>
  <li><strong>Title:</strong> {job_title}</li>
  <li><strong>Department:</strong> {department}</li>
  <li><strong>Location:</strong> {work_location}</li>
  <li><strong>Start Date:</strong> {start_date}</li>
</ul>

<h3>Compensation Package</h3>
<table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
  <tr style="background-color: #f5f5f5;">
    <td style="padding: 10px; border: 1px solid #ddd;"><strong>Basic Salary</strong></td>
    <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">{currency} {basic_salary}</td>
  </tr>
  <tr>
    <td style="padding: 10px; border: 1px solid #ddd;"><strong>Housing Allowance</strong></td>
    <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">{currency} {housing_allowance}</td>
  </tr>
  <tr style="background-color: #f5f5f5;">
    <td style="padding: 10px; border: 1px solid #ddd;"><strong>Transport Allowance</strong></td>
    <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">{currency} {transport_allowance}</td>
  </tr>
  <tr>
    <td style="padding: 10px; border: 1px solid #ddd;"><strong>Other Allowances</strong></td>
    <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">{currency} {other_allowances}</td>
  </tr>
  <tr style="background-color: #e8f5e9;">
    <td style="padding: 10px; border: 1px solid #ddd;"><strong>Total Monthly Gross</strong></td>
    <td style="padding: 10px; border: 1px solid #ddd; text-align: right;"><strong>{currency} {gross_pay_total}</strong></td>
  </tr>
</table>

<p>This offer is contingent upon successful completion of background verification and any other pre-employment requirements.</p>

<p>Please confirm your acceptance of this offer by signing and returning this letter by [acceptance deadline].</p>

<p>We look forward to welcoming you to our team!</p>

<p>Sincerely,<br/>
Human Resources<br/>
{company_name}</p>

<div style="margin-top: 60px; border-top: 1px solid #ddd; padding-top: 20px;">
<p><strong>Acceptance</strong></p>
<p>I, {candidate_name}, accept the terms of employment as outlined above.</p>
<p style="margin-top: 40px;">Signature: ___________________________ Date: _______________</p>
</div>
</div>'
);