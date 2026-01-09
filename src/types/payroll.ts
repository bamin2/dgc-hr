/**
 * Centralized Payroll Types
 * These types are shared across payroll-related hooks and components
 */

export type PayrollRunStatus = 'draft' | 'processing' | 'completed' | 'scheduled' | 'payslips_issued';
export type PayrollRecordStatus = 'paid' | 'pending' | 'processing';

export interface PayrollRun {
  id: string;
  payPeriod: {
    startDate: string;
    endDate: string;
  };
  totalAmount: number;
  employeeCount: number;
  status: PayrollRunStatus;
  processedDate: string;
}

export interface DbPayrollRun {
  id: string;
  pay_period_start: string;
  pay_period_end: string;
  total_amount: number;
  employee_count: number;
  status: string;
  processed_date: string;
  created_at: string;
}

export interface PayrollEmployeeInsert {
  payroll_run_id: string;
  employee_id: string;
  employee_name: string;
  employee_code?: string;
  department: string;
  position?: string;
  base_salary: number;
  housing_allowance: number;
  transportation_allowance: number;
  other_allowances: Record<string, number>;
  gross_pay: number;
  gosi_deduction: number;
  other_deductions: Record<string, number>;
  total_deductions: number;
  net_pay: number;
}

export interface DashboardPayrollRecord {
  id: string;
  employeeId: string;
  employee: {
    firstName: string;
    lastName: string;
    department: string;
    position: string;
    avatar?: string;
    workLocationId?: string;
  };
  payPeriod: { startDate: string; endDate: string };
  baseSalary: number;
  overtime: number;
  bonuses: number;
  deductions: { tax: number; insurance: number; other: number };
  netPay: number;
  status: PayrollRecordStatus;
  paidDate?: string;
}

export interface PayrollMetricsData {
  totalPayroll: number;
  employeesPaid: number;
  pendingPayments: number;
  averageSalary: number;
}

export interface DepartmentPayrollData {
  department: string;
  total: number;
  count: number;
}

export interface PayrollRunData {
  id: string;
  payPeriod: { startDate: string; endDate: string };
  totalAmount: number;
  employeeCount: number;
  status: PayrollRunStatus;
  processedDate: string;
}

// Allowance and Deduction types
export interface AllowanceEntry {
  name: string;
  amount: number;
}

export interface DeductionEntry {
  name: string;
  amount: number;
}

export interface PayrollCalculation {
  baseSalary: number;
  housingAllowance: number;
  transportationAllowance: number;
  otherAllowances: AllowanceEntry[];
  grossPay: number;
  gosiDeduction: number;
  otherDeductions: DeductionEntry[];
  totalDeductions: number;
  netPay: number;
}
