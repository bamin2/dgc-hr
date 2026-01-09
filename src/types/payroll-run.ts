/**
 * Payroll Run Employee Types
 * Types for payroll processing and employee compensation snapshots
 */

export interface PayrollRunEmployee {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string | null;
  department: string | null;
  position: string | null;
  baseSalary: number;
  housingAllowance: number;
  transportationAllowance: number;
  otherAllowances: { name: string; amount: number }[];
  gosiDeduction: number;
  otherDeductions: { name: string; amount: number }[];
  grossPay: number;
  totalDeductions: number;
  netPay: number;
}

// Internal types for payroll calculations
export interface AllowanceTemplate {
  id: string;
  name: string;
  amount: number;
  amount_type: string;
  percentage_of: string | null;
  is_taxable: boolean | null;
}

export interface DeductionTemplate {
  id: string;
  name: string;
  amount: number;
  amount_type: string;
  percentage_of: string | null;
}

export interface EmployeeAllowanceRow {
  id: string;
  employee_id: string;
  allowance_template_id: string | null;
  custom_name: string | null;
  custom_amount: number | null;
  percentage: number | null;
  allowance_template: AllowanceTemplate | null;
}

export interface EmployeeDeductionRow {
  id: string;
  employee_id: string;
  deduction_template_id: string | null;
  custom_name: string | null;
  custom_amount: number | null;
  deduction_template: DeductionTemplate | null;
}
