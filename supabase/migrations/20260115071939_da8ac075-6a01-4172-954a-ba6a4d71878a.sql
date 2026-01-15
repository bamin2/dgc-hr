-- Create payslip_templates table
CREATE TABLE public.payslip_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
  version_number integer NOT NULL DEFAULT 1,
  effective_from date,
  is_default boolean NOT NULL DEFAULT false,
  work_location_id uuid REFERENCES public.work_locations(id) ON DELETE SET NULL,
  docx_storage_path text NOT NULL,
  original_filename text,
  settings jsonb NOT NULL DEFAULT '{
    "branding": {
      "show_logo": true,
      "logo_alignment": "left",
      "show_company_address": true,
      "footer_disclaimer_text": "This is a computer-generated document. No signature is required.",
      "show_generated_timestamp": true
    },
    "layout": {
      "paper_size": "A4",
      "margin_top": 20,
      "margin_bottom": 20,
      "margin_left": 15,
      "margin_right": 15,
      "decimals": 2,
      "negative_format": "minus_prefix"
    },
    "visibility": {
      "show_employee_id": true,
      "show_department": true,
      "show_job_title": true,
      "show_pay_period": true
    },
    "breakdown": {
      "earnings_breakdown": "detailed",
      "deductions_breakdown": "detailed",
      "include_gosi_line": true
    },
    "currency": {
      "payslip_currency_mode": "employee_currency"
    }
  }'::jsonb,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create payslip_documents table
CREATE TABLE public.payslip_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payroll_run_id uuid NOT NULL REFERENCES public.payroll_runs(id) ON DELETE CASCADE,
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  template_id uuid NOT NULL REFERENCES public.payslip_templates(id) ON DELETE RESTRICT,
  period_start date NOT NULL,
  period_end date NOT NULL,
  currency_code text NOT NULL DEFAULT 'BHD',
  pdf_storage_path text NOT NULL,
  generated_at timestamptz NOT NULL DEFAULT now(),
  generated_by uuid REFERENCES auth.users(id),
  status text NOT NULL DEFAULT 'generated' CHECK (status IN ('generated', 'voided')),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);

-- Create indexes for performance
CREATE INDEX idx_payslip_templates_status ON public.payslip_templates(status);
CREATE INDEX idx_payslip_templates_work_location ON public.payslip_templates(work_location_id);
CREATE INDEX idx_payslip_templates_is_default ON public.payslip_templates(is_default) WHERE is_default = true;
CREATE INDEX idx_payslip_documents_payroll_run ON public.payslip_documents(payroll_run_id);
CREATE INDEX idx_payslip_documents_employee ON public.payslip_documents(employee_id);
CREATE INDEX idx_payslip_documents_period ON public.payslip_documents(period_start, period_end);

-- Add updated_at trigger for payslip_templates
CREATE TRIGGER update_payslip_templates_updated_at
  BEFORE UPDATE ON public.payslip_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS
ALTER TABLE public.payslip_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payslip_documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies for payslip_templates (HR/Admin only)
CREATE POLICY "HR and Admin can view all payslip templates"
  ON public.payslip_templates FOR SELECT
  USING (public.has_any_role(auth.uid(), ARRAY['hr', 'admin']::public.app_role[]));

CREATE POLICY "HR and Admin can create payslip templates"
  ON public.payslip_templates FOR INSERT
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['hr', 'admin']::public.app_role[]));

CREATE POLICY "HR and Admin can update payslip templates"
  ON public.payslip_templates FOR UPDATE
  USING (public.has_any_role(auth.uid(), ARRAY['hr', 'admin']::public.app_role[]));

CREATE POLICY "HR and Admin can delete payslip templates"
  ON public.payslip_templates FOR DELETE
  USING (public.has_any_role(auth.uid(), ARRAY['hr', 'admin']::public.app_role[]));

-- RLS Policies for payslip_documents
CREATE POLICY "Employees can view their own payslip documents"
  ON public.payslip_documents FOR SELECT
  USING (
    employee_id IN (
      SELECT id FROM public.employees WHERE user_id = auth.uid()
    )
    OR public.has_any_role(auth.uid(), ARRAY['hr', 'admin']::public.app_role[])
  );

CREATE POLICY "HR and Admin can insert payslip documents"
  ON public.payslip_documents FOR INSERT
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['hr', 'admin']::public.app_role[]));

CREATE POLICY "HR and Admin can update payslip documents"
  ON public.payslip_documents FOR UPDATE
  USING (public.has_any_role(auth.uid(), ARRAY['hr', 'admin']::public.app_role[]));

-- Create storage bucket for payslip templates
INSERT INTO storage.buckets (id, name, public)
VALUES ('payslip-templates', 'payslip-templates', false)
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for generated payslips
INSERT INTO storage.buckets (id, name, public)
VALUES ('payslips', 'payslips', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for payslip-templates bucket (HR/Admin only)
CREATE POLICY "HR and Admin can upload payslip templates"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'payslip-templates'
    AND public.has_any_role(auth.uid(), ARRAY['hr', 'admin']::public.app_role[])
  );

CREATE POLICY "HR and Admin can view payslip templates"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'payslip-templates'
    AND public.has_any_role(auth.uid(), ARRAY['hr', 'admin']::public.app_role[])
  );

CREATE POLICY "HR and Admin can update payslip templates"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'payslip-templates'
    AND public.has_any_role(auth.uid(), ARRAY['hr', 'admin']::public.app_role[])
  );

CREATE POLICY "HR and Admin can delete payslip templates"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'payslip-templates'
    AND public.has_any_role(auth.uid(), ARRAY['hr', 'admin']::public.app_role[])
  );

-- Storage policies for payslips bucket
CREATE POLICY "Employees can view their own payslips"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'payslips'
    AND (
      -- Check if the path contains the employee's code
      EXISTS (
        SELECT 1 FROM public.employees e
        WHERE e.user_id = auth.uid()
        AND name LIKE '%' || e.employee_code || '%'
      )
      OR public.has_any_role(auth.uid(), ARRAY['hr', 'admin']::public.app_role[])
    )
  );

CREATE POLICY "HR and Admin can upload payslips"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'payslips'
    AND public.has_any_role(auth.uid(), ARRAY['hr', 'admin']::public.app_role[])
  );

CREATE POLICY "HR and Admin can delete payslips"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'payslips'
    AND public.has_any_role(auth.uid(), ARRAY['hr', 'admin']::public.app_role[])
  );