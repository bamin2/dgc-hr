import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PayrollRun } from "@/data/payroll";

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

interface PayrollRecordInsert {
  payroll_run_id: string;
  employee_id: string;
  employee_name: string;
  department: string;
  base_salary: number;
  overtime: number;
  bonuses: number;
  tax_deduction: number;
  insurance_deduction: number;
  other_deduction: number;
  net_pay: number;
  status: string;
  paid_date: string;
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
    queryKey: ["payroll-runs"],
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
  records: PayrollRecordInsert[];
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

      // Insert all payroll records for this run
      if (params.records.length > 0) {
        const recordsWithRunId = params.records.map((r) => ({
          ...r,
          payroll_run_id: newRun.id,
        }));

        const { error: recordsError } = await supabase
          .from("payroll_records")
          .insert(recordsWithRunId);

        if (recordsError) {
          console.error("Error inserting payroll records:", recordsError);
        }
      }

      return transformDbRun(newRun);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payroll-runs"] });
    },
  });
}
