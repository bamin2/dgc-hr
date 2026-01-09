import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PayrollRunStatus } from "@/components/payroll/PayrollRunStatusBadge";
import { PayrollRunData } from "@/components/payroll/PayrollRunCard";
import { queryKeys } from "@/lib/queryKeys";

// Database types
interface DbPayrollRun {
  id: string;
  pay_period_start: string;
  pay_period_end: string;
  total_amount: number | null;
  employee_count: number;
  status: string;
  processed_date: string | null;
  created_at: string;
  location_id: string | null;
  created_by: string | null;
}

// Transform database format to app format
const transformDbRun = (run: DbPayrollRun): PayrollRunData => ({
  id: run.id,
  payPeriodStart: run.pay_period_start,
  payPeriodEnd: run.pay_period_end,
  totalAmount: run.total_amount ? Number(run.total_amount) : null,
  employeeCount: run.employee_count,
  status: (run.status as PayrollRunStatus) || 'draft',
  createdAt: run.created_at,
});

// Fetch payroll runs for a specific location
export function usePayrollRunsByLocation(locationId: string | null) {
  return useQuery({
    queryKey: queryKeys.payroll.runs.byLocationV2(locationId || ''),
    queryFn: async () => {
      if (!locationId) return [];

      const { data, error } = await supabase
        .from("payroll_runs")
        .select("*")
        .eq("location_id", locationId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching payroll runs:", error);
        throw error;
      }

      return (data || []).map(transformDbRun);
    },
    enabled: !!locationId,
  });
}

// Get draft counts per location
export function useDraftCountsByLocation() {
  return useQuery({
    queryKey: queryKeys.payroll.draftCounts,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payroll_runs")
        .select("location_id")
        .eq("status", "draft");

      if (error) {
        console.error("Error fetching draft counts:", error);
        return {};
      }

      const counts: Record<string, number> = {};
      (data || []).forEach((run) => {
        if (run.location_id) {
          counts[run.location_id] = (counts[run.location_id] || 0) + 1;
        }
      });
      return counts;
    },
  });
}

// Check if a draft exists for a specific location and period
export function useCheckExistingDraft(
  locationId: string | null,
  periodStart: string | null,
  periodEnd: string | null
) {
  return useQuery({
    queryKey: queryKeys.payroll.draftCheck(locationId || '', periodStart || '', periodEnd || ''),
    queryFn: async () => {
      if (!locationId || !periodStart || !periodEnd) return null;

      const { data, error } = await supabase
        .from("payroll_runs")
        .select("*")
        .eq("location_id", locationId)
        .eq("pay_period_start", periodStart)
        .eq("pay_period_end", periodEnd)
        .eq("status", "draft")
        .maybeSingle();

      if (error) {
        console.error("Error checking existing draft:", error);
        return null;
      }

      return data ? transformDbRun(data) : null;
    },
    enabled: !!locationId && !!periodStart && !!periodEnd,
  });
}

// Create a new payroll run
interface CreatePayrollRunParams {
  locationId: string;
  payPeriodStart: string;
  payPeriodEnd: string;
}

export function useCreatePayrollRun() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: CreatePayrollRunParams) => {
      const { data: userData } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from("payroll_runs")
        .insert({
          location_id: params.locationId,
          pay_period_start: params.payPeriodStart,
          pay_period_end: params.payPeriodEnd,
          status: "draft",
          employee_count: 0,
          total_amount: 0,
          created_by: userData?.user?.id || null,
        })
        .select()
        .single();

      if (error) throw error;
      return transformDbRun(data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payroll.runs.byLocationV2(variables.locationId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.payroll.draftCounts });
    },
  });
}

// Update payroll run status
interface UpdatePayrollRunParams {
  runId: string;
  status?: PayrollRunStatus;
  totalAmount?: number;
  employeeCount?: number;
}

export function useUpdatePayrollRun() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: UpdatePayrollRunParams) => {
      const updates: Record<string, unknown> = {};
      if (params.status) updates.status = params.status;
      if (params.totalAmount !== undefined) updates.total_amount = params.totalAmount;
      if (params.employeeCount !== undefined) updates.employee_count = params.employeeCount;
      if (params.status === 'finalized') updates.processed_date = new Date().toISOString().split('T')[0];

      const { data, error } = await supabase
        .from("payroll_runs")
        .update(updates)
        .eq("id", params.runId)
        .select()
        .single();

      if (error) throw error;
      return transformDbRun(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll-runs-v2'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.payroll.draftCounts });
    },
  });
}

// Delete a draft payroll run
export function useDeletePayrollRun() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (runId: string) => {
      // First check if it's a draft
      const { data: run, error: fetchError } = await supabase
        .from("payroll_runs")
        .select("status, location_id")
        .eq("id", runId)
        .single();

      if (fetchError) throw fetchError;

      if (run?.status !== "draft") {
        throw new Error("Only draft payroll runs can be deleted");
      }

      // Delete related records first (cascade should handle this, but being explicit)
      await supabase.from("payroll_run_adjustments").delete().eq("payroll_run_id", runId);
      await supabase.from("payroll_run_employees").delete().eq("payroll_run_id", runId);

      // Delete the run
      const { error } = await supabase
        .from("payroll_runs")
        .delete()
        .eq("id", runId);

      if (error) throw error;
      
      return run.location_id;
    },
    onSuccess: (locationId) => {
      queryClient.invalidateQueries({ queryKey: ["payroll-runs-v2", locationId] });
      queryClient.invalidateQueries({ queryKey: ["payroll-draft-counts"] });
    },
  });
}

// Issue payslips - mark run as payslips_issued
export function useIssuePayslips() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ runId, sendEmails = false }: { runId: string; sendEmails?: boolean }) => {
      const { data, error } = await supabase
        .from("payroll_runs")
        .update({ status: "payslips_issued" })
        .eq("id", runId)
        .eq("status", "finalized") // Only allow if currently finalized
        .select()
        .single();

      if (error) throw error;

      // Send payslip emails if requested
      if (sendEmails) {
        try {
          await supabase.functions.invoke('send-payslip', {
            body: { payrollRunId: runId }
          });
        } catch (emailError) {
          console.error('Error sending payslip emails:', emailError);
          // Don't throw - payslips are still issued, just email failed
        }
      }

      return transformDbRun(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll-runs-v2'] });
    },
  });
}

// Get a single payroll run
export function usePayrollRun(runId: string | null) {
  return useQuery({
    queryKey: queryKeys.payroll.runs.single(runId || ''),
    queryFn: async () => {
      if (!runId) return null;

      const { data, error } = await supabase
        .from("payroll_runs")
        .select("*")
        .eq("id", runId)
        .single();

      if (error) throw error;
      return transformDbRun(data);
    },
    enabled: !!runId,
  });
}
