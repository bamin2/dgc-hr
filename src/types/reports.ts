/**
 * Report Types and Definitions
 * Core type system for the production reports module
 */

export type ReportCategory = 'payroll' | 'salary' | 'leave' | 'loans' | 'compliance' | 'employees';

export type ExportFormat = 'excel' | 'csv' | 'pdf';

export interface ReportDefinition {
  id: string;
  name: string;
  category: ReportCategory;
  description: string;
  exportFormats: ExportFormat[];
  route?: string;
}

// Filter types for reports
export interface ReportFilters {
  dateRange?: { start: string; end: string };
  locationId?: string;
  departmentId?: string;
  employeeId?: string;
  status?: string;
  payrollRunId?: string;
  year?: number;
}

// Column definition for report tables
export interface ReportColumn<T = unknown> {
  key: keyof T | string;
  header: string;
  format?: 'text' | 'currency' | 'percentage' | 'date' | 'number';
  align?: 'left' | 'center' | 'right';
  width?: string;
}

// Payroll Report Types
export interface PayrollRunSummary {
  id: string;
  payPeriodStart: string;
  payPeriodEnd: string;
  processedDate: string;
  status: string;
  employeeCount: number;
  totalGross: number;
  totalDeductions: number;
  totalNetPay: number;
  employeeGosiTotal: number;
  employerGosiTotal: number;
  loanDeductionsTotal: number;
  locationName?: string;
}

export interface PayrollDetailedRecord {
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  department: string;
  position: string;
  baseSalary: number;
  housingAllowance: number;
  transportationAllowance: number;
  otherAllowances: number;
  grossPay: number;
  employeeGosi: number;
  employerGosi: number;
  loanDeductions: number;
  otherDeductions: number;
  totalDeductions: number;
  netPay: number;
}

export interface PayslipRegisterRecord {
  payrollRunId: string;
  payPeriod: string;
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  department: string;
  payslipIssued: boolean;
  issueDate?: string;
  issuedBy?: string;
}

// Salary Report Types
export interface SalaryDistributionRecord {
  department: string;
  location: string;
  employeeCount: number;
  minSalary: number;
  maxSalary: number;
  avgSalary: number;
  medianSalary: number;
  totalSalary: number;
}

export interface SalaryChangeRecord {
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  department: string;
  effectiveDate: string;
  previousSalary: number;
  newSalary: number;
  changeAmount: number;
  changePercentage: number;
  changeType: string;
  changedBy: string;
}

// Leave Report Types
export interface LeaveBalanceRecord {
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  department: string;
  leaveType: string;
  entitledDays: number;
  takenDays: number;
  pendingDays: number;
  remainingDays: number;
}

export interface LeaveRequestRecord {
  requestId: string;
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  department: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  daysCount: number;
  status: string;
  managerApproval?: string;
  hrApproval?: string;
  finalOutcome: string;
  submittedDate: string;
}

// Loan Report Types
export interface LoanSummaryRecord {
  loanId: string;
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  department: string;
  originalAmount: number;
  outstandingBalance: number;
  installmentAmount: number;
  paidInstallments: number;
  remainingInstallments: number;
  status: string;
  startDate: string;
  expectedEndDate: string;
}

export interface LoanInstallmentRecord {
  installmentId: string;
  loanId: string;
  employeeId: string;
  employeeName: string;
  dueDate: string;
  dueMonth: string;
  amount: number;
  status: string;
  paidDate?: string;
  paymentMethod: 'payroll' | 'manual' | 'pending';
  payrollRunId?: string;
}

// Compliance Report Types
export interface GosiContributionRecord {
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  nationality: string;
  location: string;
  gosiRegisteredSalary: number;
  employeeRate: number;
  employerRate: number;
  employeeContribution: number;
  employerContribution: number;
  totalContribution: number;
}

// Employee Report Types
export interface EmployeeMasterRecord {
  employeeId: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  department: string;
  position: string;
  employmentType: string;
  workerType: string;
  location: string;
  nationality: string;
  joinDate: string;
  status: string;
  managerName?: string;
}

// Report Dashboard Stats
export interface ReportDashboardStats {
  totalEmployees: number;
  activeEmployees: number;
  monthlyPayroll: number;
  pendingLeaveRequests: number;
  activeLoans: number;
  completedPayrollRuns: number;
}
