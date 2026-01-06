-- Create document_templates table
CREATE TABLE public.document_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.document_templates ENABLE ROW LEVEL SECURITY;

-- Create policies (HR and Admin can manage templates)
CREATE POLICY "Authenticated users can view active templates"
ON public.document_templates
FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage templates"
ON public.document_templates
FOR ALL
USING (auth.role() = 'authenticated');

-- Create generated_documents table for future use
CREATE TABLE public.generated_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES public.document_templates(id) ON DELETE SET NULL,
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  generated_by UUID REFERENCES public.employees(id) ON DELETE SET NULL
);

-- Enable RLS
ALTER TABLE public.generated_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view generated documents"
ON public.generated_documents
FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage generated documents"
ON public.generated_documents
FOR ALL
USING (auth.role() = 'authenticated');

-- Create trigger for updated_at
CREATE TRIGGER update_document_templates_updated_at
BEFORE UPDATE ON public.document_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default templates
INSERT INTO public.document_templates (name, category, description, content) VALUES
(
  'Offer Letter - Standard',
  'offer_letter',
  'Standard offer letter for full-time employees',
  'Dear <<Full Name>>,

We are pleased to offer you the position of <<Job Title>> in our <<Department>> department at <<Company Name>>.

Your employment will commence on <<Start Date>>. You will report to <<Manager Name>> at our <<Work Location>> office.

Your compensation package includes:
- Base Salary: <<Salary>> <<Currency>> per month

Please sign and return this offer letter within 7 days.

We look forward to welcoming you to our team.

Best regards,
HR Department
<<Company Name>>
<<Company Address>>'
),
(
  'Salary Certificate',
  'salary_certificate',
  'Official salary verification certificate',
  'SALARY CERTIFICATE

Date: <<Current Date>>

To Whom It May Concern,

This is to certify that <<Full Name>> (Employee ID: <<Employee Code>>) is employed with <<Company Name>> since <<Start Date>>.

<<First Name>> currently holds the position of <<Job Title>> in the <<Department>> department.

<<First Name>>''s current monthly salary is <<Salary>> <<Currency>>.

This certificate is issued upon request for whatever purpose it may serve.

Sincerely,
HR Department
<<Company Name>>'
),
(
  'Experience Certificate',
  'experience_certificate',
  'Employment verification and experience certificate',
  'EXPERIENCE CERTIFICATE

Date: <<Current Date>>

To Whom It May Concern,

This is to certify that <<Full Name>> was employed with <<Company Name>> from <<Start Date>> to <<End Date>>.

During the tenure, <<First Name>> worked as <<Job Title>> in the <<Department>> department and demonstrated excellent performance.

We wish <<First Name>> all the best in future endeavors.

Sincerely,
HR Department
<<Company Name>>
<<Company Address>>'
),
(
  'Employee Contract',
  'contract',
  'Full employment contract with terms and conditions',
  'EMPLOYMENT CONTRACT

This Employment Contract is entered into on <<Current Date>> between:

EMPLOYER: <<Company Legal Name>>
Address: <<Company Address>>

EMPLOYEE: <<Full Name>>
Address: <<Address>>
Nationality: <<Nationality>>

1. POSITION
The Employee is hired as <<Job Title>> in the <<Department>> department.

2. START DATE
Employment begins on <<Start Date>>.

3. WORK LOCATION
The Employee will be based at <<Work Location>>.

4. COMPENSATION
Monthly Salary: <<Salary>> <<Currency>>

5. REPORTING
The Employee reports to <<Manager Name>>.

IN WITNESS WHEREOF, the parties have executed this Contract.

_________________________          _________________________
<<Company Name>>                   <<Full Name>>
Date: ________________             Date: ________________'
);