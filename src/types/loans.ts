/**
 * Centralized Loan Types
 * These types are shared across loan-related hooks and components
 */

export type LoanStatus = 'requested' | 'approved' | 'rejected' | 'active' | 'closed' | 'cancelled';
export type InstallmentStatus = 'due' | 'paid' | 'skipped';
export type PaymentMethod = 'payroll' | 'manual';

export interface Loan {
  id: string;
  employee_id: string;
  requested_by: string | null;
  created_by: string | null;
  principal_amount: number;
  repayment_frequency: string;
  duration_months: number | null;
  installment_amount: number | null;
  start_date: string;
  deduct_from_payroll: boolean;
  status: LoanStatus;
  approved_by: string | null;
  approved_at: string | null;
  disbursed_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  employee?: {
    id: string;
    first_name: string;
    last_name: string;
    full_name: string | null;
    avatar_url: string | null;
    department_id: string | null;
  };
}

export interface LoanInstallment {
  id: string;
  loan_id: string;
  installment_number: number;
  due_date: string;
  amount: number;
  status: InstallmentStatus;
  paid_at: string | null;
  paid_method: PaymentMethod | null;
  paid_in_payroll_run_id: string | null;
  created_at: string;
  skipped_reason?: string | null;
}

export interface LoanWithInstallments extends Loan {
  installments: LoanInstallment[];
}

export interface LoanEvent {
  id: string;
  loan_id: string;
  event_type: string;
  effective_date: string;
  amount_delta: number | null;
  new_installment_amount: number | null;
  new_duration_months: number | null;
  affected_installment_id: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
}

// Input types for mutations
export interface RequestLoanParams {
  principal_amount: number;
  duration_months?: number;
  installment_amount?: number;
  start_date: string;
  deduct_from_payroll: boolean;
  notes?: string;
}

export interface CreateLoanParams {
  employee_id: string;
  principal_amount: number;
  duration_months?: number;
  installment_amount?: number;
  start_date: string;
  deduct_from_payroll: boolean;
  notes?: string;
  auto_disburse?: boolean;
}

export interface ApproveLoanParams {
  loanId: string;
  deductFromPayroll: boolean;
  autoDisburse: boolean;
}

export interface AdHocPaymentParams {
  loanId: string;
  amount: number;
  rescheduleOption: 'reduce_duration' | 'reduce_amount' | 'apply_next';
}
