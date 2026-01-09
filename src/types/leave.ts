/**
 * Centralized Leave Management Types
 * These types are shared across leave-related hooks and components
 */

export type LeaveRequestStatus = 'pending' | 'approved' | 'rejected';

export interface LeaveRequest {
  id: string;
  employee_id: string;
  leave_type_id: string;
  start_date: string;
  end_date: string;
  days_count: number;
  is_half_day: boolean;
  reason: string | null;
  status: LeaveRequestStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
  employee?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    avatar_url: string | null;
    department?: {
      id: string;
      name: string;
    } | null;
  };
  leave_type?: {
    id: string;
    name: string;
    color: string | null;
    is_paid: boolean;
  };
  reviewer?: {
    id: string;
    first_name: string;
    last_name: string;
  } | null;
}

export interface SalaryDeductionTier {
  from_days: number;
  to_days: number;
  deduction_percentage: number;
}

export interface LeaveType {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  max_days_per_year: number | null;
  is_paid: boolean;
  requires_approval: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  count_weekends: boolean | null;
  requires_document: boolean | null;
  document_required_after_days: number | null;
  visible_to_employees: boolean | null;
  allow_carryover: boolean | null;
  max_carryover_days: number | null;
  min_days_notice: number | null;
  max_consecutive_days: number | null;
  has_salary_deduction: boolean | null;
  salary_deduction_tiers: SalaryDeductionTier[] | null;
}

export interface LeaveBalance {
  id: string;
  employee_id: string;
  leave_type_id: string;
  year: number;
  total_days: number;
  used_days: number;
  pending_days: number;
  created_at: string;
  updated_at: string;
  leave_type?: {
    id: string;
    name: string;
    color: string | null;
    is_paid: boolean;
  };
}

export interface LeaveBalanceSummary {
  leaveTypeId: string;
  leaveTypeName: string;
  color: string;
  total: number;
  used: number;
  pending: number;
  remaining: number;
}

export interface LeaveBalanceAdjustment {
  id: string;
  leave_balance_id: string;
  employee_id: string;
  leave_type_id: string;
  adjustment_days: number;
  adjustment_type: 'manual' | 'carryover' | 'expiry' | 'correction';
  reason: string | null;
  adjusted_by: string | null;
  created_at: string;
  employee?: {
    id: string;
    first_name: string;
    last_name: string;
    avatar_url: string | null;
  };
  leave_type?: {
    id: string;
    name: string;
    color: string | null;
  };
  adjuster?: {
    id: string;
    first_name: string | null;
    last_name: string | null;
  };
}

export interface AllEmployeeBalance {
  employee_id: string;
  employee_name: string;
  employee_avatar: string | null;
  department: string | null;
  balances: {
    leave_type_id: string;
    leave_type_name: string;
    leave_type_color: string | null;
    balance_id: string;
    total_days: number;
    used_days: number;
    pending_days: number;
    remaining_days: number;
  }[];
}
