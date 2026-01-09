/**
 * Common Dashboard Types
 * Shared type definitions used across dashboard hooks
 */

// Common time off entry structure
export interface UpcomingTimeOffEntry {
  employeeId: string;
  employeeName: string;
  startDate: string;
  endDate: string;
  leaveTypeName?: string;
  daysCount: number;
}

// Common pending approvals structure
export interface PendingApprovals {
  leaveRequests: number;
  loanRequests?: number;
}

// Common payroll status
export interface PayrollStatus {
  lastRunDate: string | null;
  lastRunAmount: number | null;
  nextPayrollDate: string | null;
}

// Common loan info
export interface ActiveLoanInfo {
  id: string;
  principalAmount: number;
  outstandingBalance: number;
  nextInstallmentDate: string | null;
  nextInstallmentAmount: number | null;
}

// Leave balance entry
export interface LeaveBalanceEntry {
  leaveTypeId: string;
  leaveTypeName: string;
  color: string;
  total: number;
  used: number;
  pending: number;
  remaining: number;
}

// Requests summary
export interface RequestsSummary {
  pending: number;
  approved: number;
  rejected: number;
}

// Personal upcoming time off (with reason)
export interface PersonalUpcomingTimeOff {
  id: string;
  startDate: string;
  endDate: string;
  leaveTypeName: string;
  daysCount: number;
  reason: string | null;
}
