import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface InstallmentDueForPayroll {
  id: string;
  loanId: string;
  employeeId: string;
  employeeName: string;
  installmentNumber: number;
  dueDate: string;
  amount: number;
  deductFromPayroll: boolean;
  loanNotes: string | null;
  principalAmount: number;
  totalInstallments: number;
}

interface UseLoanInstallmentsDueForPayrollParams {
  payPeriodStart: string;
  payPeriodEnd: string;
  employeeIds: string[];
}

export function useLoanInstallmentsDueForPayroll({
  payPeriodStart,
  payPeriodEnd,
  employeeIds,
}: UseLoanInstallmentsDueForPayrollParams) {
  return useQuery({
    queryKey: ["loan-installments-due", payPeriodStart, payPeriodEnd, employeeIds],
    queryFn: async () => {
      if (!employeeIds.length || !payPeriodStart || !payPeriodEnd) {
        return { payrollDeductions: [], nonPayrollInstallments: [] };
      }

      // Get all due installments for the pay period
      const { data: installments, error } = await supabase
        .from("loan_installments")
        .select(`
          id,
          loan_id,
          installment_number,
          due_date,
          amount,
          status,
          loan:loans(
            id,
            employee_id,
            principal_amount,
            duration_months,
            deduct_from_payroll,
            notes,
            status,
            employee:employees(id, first_name, last_name, full_name)
          )
        `)
        .gte("due_date", payPeriodStart)
        .lte("due_date", payPeriodEnd)
        .eq("status", "due");

      if (error) throw error;

      // Filter by employee IDs and active loans
      const filteredInstallments = (installments || []).filter((inst) => {
        const loan = inst.loan as any;
        return (
          loan &&
          loan.status === "active" &&
          employeeIds.includes(loan.employee_id)
        );
      });

      // Map to our interface
      const mapped: InstallmentDueForPayroll[] = filteredInstallments.map((inst) => {
        const loan = inst.loan as any;
        const employee = loan.employee;
        const employeeName = employee?.full_name || 
          `${employee?.first_name || ""} ${employee?.last_name || ""}`.trim();

        return {
          id: inst.id,
          loanId: loan.id,
          employeeId: loan.employee_id,
          employeeName,
          installmentNumber: inst.installment_number,
          dueDate: inst.due_date,
          amount: Number(inst.amount),
          deductFromPayroll: loan.deduct_from_payroll,
          loanNotes: loan.notes,
          principalAmount: Number(loan.principal_amount),
          totalInstallments: loan.duration_months || 0,
        };
      });

      // Split into two groups
      const payrollDeductions = mapped.filter((i) => i.deductFromPayroll);
      const nonPayrollInstallments = mapped.filter((i) => !i.deductFromPayroll);

      return { payrollDeductions, nonPayrollInstallments };
    },
    enabled: employeeIds.length > 0 && !!payPeriodStart && !!payPeriodEnd,
  });
}
