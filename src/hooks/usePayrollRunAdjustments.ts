import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PayrollRunAdjustment {
  id: string;
  employeeId: string;
  type: "earning" | "deduction";
  name: string;
  amount: number;
  notes: string | null;
}

export function usePayrollRunAdjustments(runId: string | null) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["payroll-run-adjustments", runId],
    queryFn: async () => {
      if (!runId) return [];

      const { data, error } = await supabase
        .from("payroll_run_adjustments")
        .select("*")
        .eq("payroll_run_id", runId);

      if (error) throw error;

      return (data || []).map((row): PayrollRunAdjustment => ({
        id: row.id,
        employeeId: row.employee_id,
        type: row.type as "earning" | "deduction",
        name: row.name,
        amount: Number(row.amount),
        notes: row.notes,
      }));
    },
    enabled: !!runId,
  });

  const addMutation = useMutation({
    mutationFn: async (params: Omit<PayrollRunAdjustment, "id">) => {
      if (!runId) throw new Error("No run ID");

      const { error } = await supabase.from("payroll_run_adjustments").insert({
        payroll_run_id: runId,
        employee_id: params.employeeId,
        type: params.type,
        name: params.name,
        amount: params.amount,
        notes: params.notes,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payroll-run-adjustments", runId] });
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (adjustmentId: string) => {
      const { error } = await supabase
        .from("payroll_run_adjustments")
        .delete()
        .eq("id", adjustmentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payroll-run-adjustments", runId] });
    },
  });

  return {
    ...query,
    addAdjustment: addMutation.mutateAsync,
    removeAdjustment: removeMutation.mutateAsync,
  };
}
