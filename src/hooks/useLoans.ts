import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { queryKeys } from "@/lib/queryKeys";
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
  status: "requested" | "approved" | "rejected" | "active" | "closed" | "cancelled";
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
  status: "due" | "paid" | "skipped";
  paid_at: string | null;
  paid_method: "payroll" | "manual" | null;
  paid_in_payroll_run_id: string | null;
  created_at: string;
}

export interface LoanWithInstallments extends Loan {
  installments: LoanInstallment[];
}

export function useLoans(filters?: { status?: string; employeeId?: string }) {
  return useQuery({
    queryKey: queryKeys.loans.withFilters(filters),
    queryFn: async () => {
      let query = supabase
        .from("loans")
        .select(`
          *,
          employee:employees(id, first_name, last_name, full_name, avatar_url, department_id)
        `)
        .order("created_at", { ascending: false });

      if (filters?.status) {
        query = query.eq("status", filters.status);
      }
      if (filters?.employeeId) {
        query = query.eq("employee_id", filters.employeeId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Loan[];
    },
  });
}

export function useMyLoans() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: queryKeys.loans.my(user?.id || ''),
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from("loans")
        .select(`
          *,
          employee:employees(id, first_name, last_name, full_name, avatar_url, department_id)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Loan[];
    },
    enabled: !!user?.id,
  });
}

export function useLoan(loanId: string | null) {
  return useQuery({
    queryKey: queryKeys.loans.detail(loanId || ''),
    queryFn: async () => {
      if (!loanId) return null;

      const { data: loan, error: loanError } = await supabase
        .from("loans")
        .select(`
          *,
          employee:employees(id, first_name, last_name, full_name, avatar_url, department_id)
        `)
        .eq("id", loanId)
        .single();

      if (loanError) throw loanError;

      const { data: installments, error: installmentsError } = await supabase
        .from("loan_installments")
        .select("*")
        .eq("loan_id", loanId)
        .order("installment_number", { ascending: true });

      if (installmentsError) throw installmentsError;

      return {
        ...loan,
        installments: installments || [],
      } as LoanWithInstallments;
    },
    enabled: !!loanId,
  });
}

export function useLoanInstallments(loanId: string | null) {
  return useQuery({
    queryKey: queryKeys.loans.installments(loanId || ''),
    queryFn: async () => {
      if (!loanId) return [];

      const { data, error } = await supabase
        .from("loan_installments")
        .select("*")
        .eq("loan_id", loanId)
        .order("installment_number", { ascending: true });

      if (error) throw error;
      return data as LoanInstallment[];
    },
    enabled: !!loanId,
  });
}

interface RequestLoanParams {
  principal_amount: number;
  duration_months?: number;
  installment_amount?: number;
  start_date: string;
  deduct_from_payroll: boolean;
  notes?: string;
}

export function useRequestLoan() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (params: RequestLoanParams) => {
      // Get employee_id for current user
      const { data: employee, error: empError } = await supabase
        .from("employees")
        .select("id")
        .eq("user_id", user?.id)
        .single();

      if (empError) throw new Error("Could not find employee record");

      const { data, error } = await supabase
        .from("loans")
        .insert({
          employee_id: employee.id,
          requested_by: user?.id,
          principal_amount: params.principal_amount,
          duration_months: params.duration_months,
          installment_amount: params.installment_amount,
          start_date: params.start_date,
          deduct_from_payroll: params.deduct_from_payroll,
          notes: params.notes,
          status: "requested",
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.loans.all });
    },
  });
}

interface CreateLoanParams {
  employee_id: string;
  principal_amount: number;
  duration_months?: number;
  installment_amount?: number;
  start_date: string;
  deduct_from_payroll: boolean;
  notes?: string;
  auto_disburse?: boolean;
}

export function useCreateLoan() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (params: CreateLoanParams) => {
      const { data, error } = await supabase
        .from("loans")
        .insert({
          employee_id: params.employee_id,
          created_by: user?.id,
          principal_amount: params.principal_amount,
          duration_months: params.duration_months,
          installment_amount: params.installment_amount,
          start_date: params.start_date,
          deduct_from_payroll: params.deduct_from_payroll,
          notes: params.notes,
          status: params.auto_disburse ? "active" : "approved",
          approved_by: user?.id,
          approved_at: new Date().toISOString(),
          disbursed_at: params.auto_disburse ? new Date().toISOString() : null,
        })
        .select()
        .single();

      if (error) throw error;

      // If auto_disburse, generate installments
      if (params.auto_disburse) {
        const { error: genError } = await supabase.rpc("generate_loan_installments", {
          loan_uuid: data.id,
        });
        if (genError) throw genError;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.loans.all });
    },
  });
}

interface ApproveLoanParams {
  loanId: string;
  deductFromPayroll: boolean;
  autoDisburse: boolean;
}

export function useApproveLoan() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ loanId, deductFromPayroll, autoDisburse }: ApproveLoanParams) => {
      // Update loan with HR options
      const { data: loan, error } = await supabase
        .from("loans")
        .update({
          status: autoDisburse ? "active" : "approved",
          approved_by: user?.id,
          approved_at: new Date().toISOString(),
          deduct_from_payroll: deductFromPayroll,
          disbursed_at: autoDisburse ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", loanId)
        .select(`
          *,
          employee:employees(id, user_id, first_name, last_name, full_name)
        `)
        .single();

      if (error) throw error;

      // Generate installments if auto-disbursing
      if (autoDisburse) {
        const { error: genError } = await supabase.rpc("generate_loan_installments", {
          loan_uuid: loanId,
        });
        if (genError) throw genError;
      }

      // Send notification to employee if they have a user_id
      const employeeUserId = loan.employee?.user_id;
      if (employeeUserId) {
        await supabase.from("notifications").insert({
          user_id: employeeUserId,
          type: "approval",
          title: "Loan Approved",
          message: `Your loan request for ${loan.principal_amount.toLocaleString()} has been approved.`,
          priority: "medium",
          is_read: false,
          action_url: `/employees/${loan.employee.id}?tab=loans`,
          metadata: { loanId },
        });
      }

      return loan;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.loans.all });
    },
  });
}

export function useRejectLoan() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ loanId, reason }: { loanId: string; reason?: string }) => {
      // Get loan with employee info first
      const { data: loan, error } = await supabase
        .from("loans")
        .update({
          status: "rejected",
          approved_by: user?.id,
          approved_at: new Date().toISOString(),
          notes: reason,
          updated_at: new Date().toISOString(),
        })
        .eq("id", loanId)
        .select(`
          *,
          employee:employees(id, user_id, first_name, last_name, full_name)
        `)
        .single();

      if (error) throw error;

      // Send notification to employee if they have a user_id
      const employeeUserId = loan.employee?.user_id;
      if (employeeUserId) {
        await supabase.from("notifications").insert({
          user_id: employeeUserId,
          type: "approval",
          title: "Loan Request Declined",
          message: `Your loan request for ${loan.principal_amount.toLocaleString()} has been declined.${reason ? ` Reason: ${reason}` : ""}`,
          priority: "medium",
          is_read: false,
          action_url: `/employees/${loan.employee.id}?tab=loans`,
          metadata: { loanId },
        });
      }

      return loan;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.loans.all });
    },
  });
}

export function useDisburseLoan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (loanId: string) => {
      // Update loan status
      const { error: updateError } = await supabase
        .from("loans")
        .update({
          status: "active",
          disbursed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", loanId);

      if (updateError) throw updateError;

      // Generate installments
      const { error: genError } = await supabase.rpc("generate_loan_installments", {
        loan_uuid: loanId,
      });

      if (genError) throw genError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.loans.all });
    },
  });
}

export function useCancelLoan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (loanId: string) => {
      const { error } = await supabase
        .from("loans")
        .update({
          status: "cancelled",
          updated_at: new Date().toISOString(),
        })
        .eq("id", loanId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.loans.all });
    },
  });
}

export function useMarkInstallmentPaid() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ installmentId, method }: { installmentId: string; method: "payroll" | "manual"; payrollRunId?: string }) => {
      const { error } = await supabase
        .from("loan_installments")
        .update({
          status: "paid",
          paid_at: new Date().toISOString(),
          paid_method: method,
        })
        .eq("id", installmentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.loans.all });
    },
  });
}

export function useMarkInstallmentsPaidByPayroll() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ installmentIds, payrollRunId }: { installmentIds: string[]; payrollRunId: string }) => {
      const { error } = await supabase
        .from("loan_installments")
        .update({
          status: "paid",
          paid_at: new Date().toISOString(),
          paid_method: "payroll",
          paid_in_payroll_run_id: payrollRunId,
        })
        .in("id", installmentIds);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.loans.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.loans.installmentsDue });
    },
  });
}

export function useDeleteLoan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (loanId: string) => {
      const { error } = await supabase
        .from("loans")
        .delete()
        .eq("id", loanId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.loans.all });
    },
  });
}

interface AdHocPaymentParams {
  loanId: string;
  amount: number;
  rescheduleOption: "reduce_duration" | "reduce_amount" | "apply_next";
}

export function useMakeAdHocPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ loanId, amount, rescheduleOption }: AdHocPaymentParams) => {
      // Get loan and installments
      const { data: loan, error: loanError } = await supabase
        .from("loans")
        .select("*, loan_installments(*)")
        .eq("id", loanId)
        .single();

      if (loanError) throw loanError;

      const dueInstallments = (loan.loan_installments || [])
        .filter((i: any) => i.status === "due")
        .sort((a: any, b: any) => a.installment_number - b.installment_number);

      if (dueInstallments.length === 0) {
        throw new Error("No due installments found");
      }

      if (rescheduleOption === "apply_next") {
        // Mark installments as paid until amount is exhausted
        let remaining = amount;
        const toMark: string[] = [];
        
        for (const inst of dueInstallments) {
          if (remaining >= inst.amount) {
            toMark.push(inst.id);
            remaining -= inst.amount;
          } else {
            break;
          }
        }

        if (toMark.length > 0) {
          const { error } = await supabase
            .from("loan_installments")
            .update({
              status: "paid",
              paid_at: new Date().toISOString(),
              paid_method: "manual",
            })
            .in("id", toMark);

          if (error) throw error;
        }
      } else if (rescheduleOption === "reduce_duration") {
        // Keep same installment amount, reduce number of installments
        const currentInstallmentAmount = loan.installment_amount || dueInstallments[0]?.amount || 0;
        const currentOutstanding = dueInstallments.reduce((sum: number, i: any) => sum + i.amount, 0);
        const newBalance = currentOutstanding - amount;
        const newInstallmentCount = Math.ceil(newBalance / currentInstallmentAmount);
        
        // Mark excess installments as paid (from the end)
        const installmentsToRemove = dueInstallments.length - newInstallmentCount;
        if (installmentsToRemove > 0) {
          const toRemove = dueInstallments.slice(-installmentsToRemove).map((i: any) => i.id);
          await supabase
            .from("loan_installments")
            .delete()
            .in("id", toRemove);
        }

        // Update loan duration
        const paidCount = (loan.loan_installments || []).filter((i: any) => i.status === "paid").length;
        await supabase
          .from("loans")
          .update({ 
            duration_months: paidCount + newInstallmentCount,
            updated_at: new Date().toISOString(),
          })
          .eq("id", loanId);

      } else if (rescheduleOption === "reduce_amount") {
        // Keep same duration, reduce installment amount
        const currentOutstanding = dueInstallments.reduce((sum: number, i: any) => sum + i.amount, 0);
        const newBalance = currentOutstanding - amount;
        const newInstallmentAmount = newBalance / dueInstallments.length;

        // Update all due installments with new amount
        for (const inst of dueInstallments) {
          await supabase
            .from("loan_installments")
            .update({ 
              amount: Math.round(newInstallmentAmount * 100) / 100,
              original_amount: inst.original_amount || inst.amount,
            })
            .eq("id", inst.id);
        }

        // Update loan installment_amount
        await supabase
          .from("loans")
          .update({ 
            installment_amount: Math.round(newInstallmentAmount * 100) / 100,
            updated_at: new Date().toISOString(),
          })
          .eq("id", loanId);
      }

      // Check if loan is fully paid
      const { data: updatedLoan } = await supabase
        .from("loans")
        .select("*, loan_installments(*)")
        .eq("id", loanId)
        .single();

      if (updatedLoan) {
        const stillDue = (updatedLoan.loan_installments || []).filter((i: any) => i.status === "due");
        if (stillDue.length === 0) {
          await supabase
            .from("loans")
            .update({ status: "closed", updated_at: new Date().toISOString() })
            .eq("id", loanId);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.loans.all });
    },
  });
}
