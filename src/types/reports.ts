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
  currencyCode: string;
  hasMixedCurrencies: boolean;
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
  currencyCode: string;
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
  currencyCode: string;
  employeeCount: number;
  minGrossPay: number;
  maxGrossPay: number;
  avgGrossPay: number;
  medianGrossPay: number;
  totalGrossPay: number;
}

export interface SalaryChangeRecord {
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  department: string;
  currencyCode: string;
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
  currencyCode: string;
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
  currencyCode: string;
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
  currencyCode: string;
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

// =====================================
// Compliance & Cost Report Types
// =====================================

// CTC Report Types
export interface AllowanceBreakdownItem {
  name: string;
  amount: number;
}

export interface CTCRecord {
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  department: string;
  position: string;
  originalCurrency: string;
  basicSalary: number;
  allowancesTotal: number;
  allowancesBreakdown: AllowanceBreakdownItem[];
  grossPay: number;
  employerGosi: number;
  employerBenefitsCost: number;
  ctcMonthly: number;
  ctcYearly: number;
  wasConverted: boolean;
  conversionInfo?: { rate: number; effectiveDate: string; fromCurrency: string };
}

export interface CTCSummary {
  totalCtcMonthly: number;
  totalCtcYearly: number;
  totalGrossPay: number;
  totalEmployerGosi: number;
  totalEmployerBenefitsCost: number;
  employeeCount: number;
}

// Payroll Variance Types
export type VarianceReasonTag = 
  | 'salary_change' 
  | 'allowance_change' 
  | 'loan_started' 
  | 'loan_changed' 
  | 'loan_ended' 
  | 'adjustment' 
  | 'joiner' 
  | 'leaver';

export interface PayrollVarianceDetails {
  previousBasic: number;
  currentBasic: number;
  previousAllowances: number;
  currentAllowances: number;
  previousDeductions: number;
  currentDeductions: number;
  previousLoanInstallment: number;
  currentLoanInstallment: number;
  previousAllowancesBreakdown?: AllowanceBreakdownItem[];
  currentAllowancesBreakdown?: AllowanceBreakdownItem[];
}

export interface PayrollVarianceRecord {
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  department: string;
  previousGrossPay: number;
  currentGrossPay: number;
  deltaBHD: number;
  deltaPercent: number;
  reasons: VarianceReasonTag[];
  details: PayrollVarianceDetails;
}

export interface PayrollVarianceSummary {
  currentTotalGross: number;
  previousTotalGross: number;
  deltaAmount: number;
  deltaPercent: number;
  currentHeadcount: number;
  previousHeadcount: number;
  headcountDelta: number;
}

// Compliance Snapshot Types
export interface ComplianceMissingDocRecord {
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  department: string;
  location: string;
  missingDocumentType: string;
  documentTypeId: string;
}

export interface ComplianceExpiredDocRecord {
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  department: string;
  documentType: string;
  documentName: string;
  expiryDate: string;
  daysPastExpiry: number;
}

export interface ComplianceExpiringDocRecord {
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  department: string;
  documentType: string;
  documentName: string;
  expiryDate: string;
  daysUntilExpiry: number;
}

export interface GosiMismatchRecord {
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  department: string;
  location: string;
  issue: string;
  isSubjectToGosi: boolean | null;
  gosiRegisteredSalary: number | null;
  locationGosiEnabled: boolean | null;
}

export interface ComplianceSnapshotSummary {
  missingDocsCount: number;
  expiredDocsCount: number;
  expiringDocsCount: number;
  gosiMismatchCount: number;
}

// Extended Report Filters for Compliance & Cost reports
export interface CostReportFilters extends ReportFilters {
  comparePayrollRunId?: string;
  month?: string; // YYYY-MM format
  expiryWindowDays?: number; // 30, 60, or 90
}
