import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Params {
  payPeriodStart: string;
  payPeriodEnd: string;
  locationId: string;
  excludeRunId?: string | null;
}

export interface AlreadyPaidEntry {
  employeeId: string;
  payPeriodStart: string;
  payPeriodEnd: string;
}

/**
 * Returns the set of employee IDs that already have a finalized
 * (or payslip-issued) payroll run overlapping the given period
 * for the given location.
 *
 * Used to prevent duplicate payroll runs for the same employee
 * in the same period.
 */
export function useEmployeesAlreadyPaidInPeriod({
  payPeriodStart,
  payPeriodEnd,
  locationId,
  excludeRunId,
}: Params) {
  return useQuery({
    queryKey: [
      "employees-already-paid",
      locationId,
      payPeriodStart,
      payPeriodEnd,
      excludeRunId ?? null,
    ],
    enabled: !!payPeriodStart && !!payPeriodEnd && !!locationId,
    queryFn: async (): Promise<{
      ids: Set<string>;
      entries: AlreadyPaidEntry[];
    }> => {
      let runsQuery = supabase
        .from("payroll_runs")
        .select("id, status, pay_period_start, pay_period_end, location_id")
        .eq("location_id", locationId)
        .in("status", ["finalized", "payslips_issued"])
        // Overlap test: run.start <= period.end AND run.end >= period.start
        .lte("pay_period_start", payPeriodEnd)
        .gte("pay_period_end", payPeriodStart);

      if (excludeRunId) {
        runsQuery = runsQuery.neq("id", excludeRunId);
      }

      const { data: runs, error: runsError } = await runsQuery;
      if (runsError) throw runsError;

      const runs_ = runs || [];
      const runIds = runs_.map((r) => r.id);
      if (runIds.length === 0) {
        return { ids: new Set(), entries: [] };
      }

      const { data: rows, error } = await supabase
        .from("payroll_run_employees")
        .select("employee_id, payroll_run_id")
        .in("payroll_run_id", runIds);

      if (error) throw error;

      const runById = new Map(runs_.map((r) => [r.id, r]));
      const ids = new Set<string>();
      const entries: AlreadyPaidEntry[] = [];

      (rows || []).forEach((row) => {
        const empId = row.employee_id as string;
        if (!empId || ids.has(empId)) return;
        const run = runById.get(row.payroll_run_id as string);
        if (!run) return;
        ids.add(empId);
        entries.push({
          employeeId: empId,
          payPeriodStart: run.pay_period_start as string,
          payPeriodEnd: run.pay_period_end as string,
        });
      });

      return { ids, entries };
    },
  });
}
