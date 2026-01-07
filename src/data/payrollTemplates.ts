export interface AllowanceTemplate {
  id: string;
  name: string;
  description: string | null;
  amount: number;
  default_amount: number;
  is_variable: boolean;
  amount_type: 'fixed' | 'percentage';
  percentage_of: string | null;
  is_taxable: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DeductionTemplate {
  id: string;
  name: string;
  description: string | null;
  amount: number;
  amount_type: 'fixed' | 'percentage';
  percentage_of: string | null;
  is_mandatory: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface EmployeeAllowance {
  id: string;
  employee_id: string;
  allowance_template_id: string;
  custom_amount: number | null;
  custom_name: string | null;
  percentage: number | null;
  effective_date: string;
  end_date: string | null;
  created_at: string;
  allowance_template?: AllowanceTemplate;
}

export interface EmployeeDeduction {
  id: string;
  employee_id: string;
  deduction_template_id: string;
  custom_amount: number | null;
  effective_date: string;
  end_date: string | null;
  created_at: string;
  deduction_template?: DeductionTemplate;
}

export const amountTypes = [
  { value: 'fixed', label: 'Fixed Amount' },
  { value: 'percentage', label: 'Percentage' },
];

export const percentageOfOptions = [
  { value: 'base_salary', label: 'Base Salary' },
  { value: 'gross_pay', label: 'Gross Pay' },
];
