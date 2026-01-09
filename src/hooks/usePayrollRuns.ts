import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PayrollRun } from "@/data/payroll";
import { queryKeys } from "@/lib/queryKeys";

interface DbPayrollRun {
  id: string;
  pay_period_start: string;
  pay_period_end: string;
  total_amount: number;
  employee_count: number;
  status: string;
  processed_date: string;
  created_at: string;
}

interface PayrollEmployeeInsert {
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

// Transform database format to app format
const transformDbRun = (run: DbPayrollRun): PayrollRun => ({
  id: run.id,
  payPeriod: {
    startDate: run.pay_period_start,
    endDate: run.pay_period_end,
  },
  totalAmount: Number(run.total_amount),
  employeeCount: run.employee_count,
  status: run.status as 'completed' | 'processing' | 'scheduled',
  processedDate: run.processed_date,
});

export function usePayrollRuns() {
  return useQuery({
    queryKey: queryKeys.payroll.runs.all,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payroll_runs")
        .select("*")
        .order("processed_date", { ascending: false });

      if (error) {
        console.error("Error fetching payroll runs:", error);
        return [];
      }

      return (data || []).map(transformDbRun);
    },
  });
}

interface AddPayrollRunParams {
  payPeriodStart: string;
  payPeriodEnd: string;
  totalAmount: number;
  employeeCount: number;
  records: PayrollEmployeeInsert[];
}

export function useAddPayrollRun() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: AddPayrollRunParams) => {
      // Insert the payroll run
      const { data: newRun, error: runError } = await supabase
        .from("payroll_runs")
        .insert({
          pay_period_start: params.payPeriodStart,
          pay_period_end: params.payPeriodEnd,
          total_amount: params.totalAmount,
          employee_count: params.employeeCount,
          status: "completed",
          processed_date: new Date().toISOString().split("T")[0],
        })
        .select()
        .single();

      if (runError) {
        throw runError;
      }

      // Insert all payroll employee records for this run
      if (params.records.length > 0) {
        const recordsWithRunId = params.records.map((r) => ({
          ...r,
          payroll_run_id: newRun.id,
        }));

        const { error: recordsError } = await supabase
          .from("payroll_run_employees")
          .insert(recordsWithRunId);

        if (recordsError) {
          console.error("Error inserting payroll run employees:", recordsError);
          throw recordsError;
        }
      }

      return transformDbRun(newRun);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payroll.runs.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.payroll.dashboardRuns });
    },
  });
}
