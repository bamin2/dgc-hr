import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { LoanInstallment } from "./useLoans";

export interface LoanWithInstallmentsData {
  id: string;
  employee_id: string;
  principal_amount: number;
  installment_amount: number | null;
  start_date: string;
  status: "requested" | "approved" | "rejected" | "active" | "closed" | "cancelled";
  notes: string | null;
  created_at: string;
  loan_installments: LoanInstallment[];
}

export function useEmployeeLoansWithInstallments(employeeId: string | undefined) {
  return useQuery({
    queryKey: ['employee-loans-with-installments', employeeId],
    queryFn: async (): Promise<LoanWithInstallmentsData[]> => {
      if (!employeeId) return [];

      const { data, error } = await supabase
        .from('loans')
        .select(`
          id,
          employee_id,
          principal_amount,
          installment_amount,
          start_date,
          status,
          notes,
          created_at,
          loan_installments (
            id,
            loan_id,
            installment_number,
            due_date,
            amount,
            status,
            paid_at,
            paid_method,
            paid_in_payroll_run_id,
            created_at
          )
        `)
        .eq('employee_id', employeeId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return (data || []) as LoanWithInstallmentsData[];
    },
    enabled: !!employeeId,
  });
}
