/**
 * Payslip Template Types
 */

export interface PayslipTemplateSettings {
  branding: {
    show_logo: boolean;
    logo_alignment: 'left' | 'center' | 'right';
    show_company_address: boolean;
    footer_disclaimer_text: string;
    show_generated_timestamp: boolean;
  };
  layout: {
    paper_size: 'A4' | 'Letter';
    margin_top: number;
    margin_bottom: number;
    margin_left: number;
    margin_right: number;
    decimals: number;
    negative_format: 'minus_prefix';
  };
  visibility: {
    show_employee_id: boolean;
    show_department: boolean;
    show_job_title: boolean;
    show_pay_period: boolean;
  };
  breakdown: {
    earnings_breakdown: 'summary' | 'detailed';
    deductions_breakdown: 'summary' | 'detailed';
    include_gosi_line: boolean;
  };
  currency: {
    payslip_currency_mode: 'employee_currency' | 'location_currency';
  };
}

export interface PayslipTemplate {
  id: string;
  name: string;
  description: string | null;
  status: 'draft' | 'active' | 'archived';
  version_number: number;
  effective_from: string | null;
  is_default: boolean;
  work_location_id: string | null;
  docx_storage_path: string;
  original_filename: string | null;
  settings: PayslipTemplateSettings;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  work_location?: {
    id: string;
    name: string;
  } | null;
}

export interface PayslipTemplateInsert {
  name: string;
  description?: string | null;
  status?: 'draft' | 'active' | 'archived';
  version_number?: number;
  effective_from?: string | null;
  is_default?: boolean;
  work_location_id?: string | null;
  docx_storage_path: string;
  original_filename?: string | null;
  settings?: Partial<PayslipTemplateSettings>;
}

export interface PayslipTemplateUpdate {
  name?: string;
  description?: string | null;
  status?: 'draft' | 'active' | 'archived';
  version_number?: number;
  effective_from?: string | null;
  is_default?: boolean;
  work_location_id?: string | null;
  docx_storage_path?: string;
  original_filename?: string | null;
  settings?: PayslipTemplateSettings;
}

export interface PayslipDocument {
  id: string;
  payroll_run_id: string;
  employee_id: string;
  template_id: string;
  period_start: string;
  period_end: string;
  currency_code: string;
  pdf_storage_path: string;
  generated_at: string;
  generated_by: string | null;
  status: 'generated' | 'voided';
  metadata: Record<string, unknown>;
  // Joined data
  employee?: {
    id: string;
    first_name: string;
    last_name: string;
    employee_code: string | null;
    avatar_url: string | null;
  } | null;
  template?: PayslipTemplate | null;
}

export interface PayslipDocumentInsert {
  payroll_run_id: string;
  employee_id: string;
  template_id: string;
  period_start: string;
  period_end: string;
  currency_code?: string;
  pdf_storage_path: string;
  generated_by?: string | null;
  status?: 'generated' | 'voided';
  metadata?: Record<string, unknown>;
}

export const DEFAULT_PAYSLIP_TEMPLATE_SETTINGS: PayslipTemplateSettings = {
  branding: {
    show_logo: true,
    logo_alignment: 'left',
    show_company_address: true,
    footer_disclaimer_text: "This is a computer-generated document. No signature is required.",
    show_generated_timestamp: true,
  },
  layout: {
    paper_size: 'A4',
    margin_top: 20,
    margin_bottom: 20,
    margin_left: 15,
    margin_right: 15,
    decimals: 2,
    negative_format: 'minus_prefix',
  },
  visibility: {
    show_employee_id: true,
    show_department: true,
    show_job_title: true,
    show_pay_period: true,
  },
  breakdown: {
    earnings_breakdown: 'detailed',
    deductions_breakdown: 'detailed',
    include_gosi_line: true,
  },
  currency: {
    payslip_currency_mode: 'employee_currency',
  },
};

export type PayslipTemplateStatus = 'draft' | 'active' | 'archived';
export type PayslipDocumentStatus = 'generated' | 'voided';
