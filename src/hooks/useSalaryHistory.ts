import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type SalaryChangeType = 'initial' | 'adjustment' | 'promotion' | 'annual_review' | 'correction' | 'bulk_update';

export interface SalaryHistoryRecord {
  id: string;
  employeeId: string;
  previousSalary: number | null;
  newSalary: number;
  changeType: SalaryChangeType;
  reason: string | null;
  effectiveDate: string;
  changedBy: string | null;
  changedByName?: string;
  createdAt: string;
}

interface DbSalaryHistory {
  id: string;
  employee_id: string;
  previous_salary: number | null;
  new_salary: number;
  change_type: string;
  reason: string | null;
  effective_date: string;
  changed_by: string | null;
  created_at: string;
}

const mapDbToSalaryHistory = (db: DbSalaryHistory): SalaryHistoryRecord => ({
  id: db.id,
  employeeId: db.employee_id,
  previousSalary: db.previous_salary,
  newSalary: db.new_salary,
  changeType: db.change_type as SalaryChangeType,
  reason: db.reason,
  effectiveDate: db.effective_date,
  changedBy: db.changed_by,
  createdAt: db.created_at,
});

async function fetchSalaryHistory(employeeId: string): Promise<SalaryHistoryRecord[]> {
  const { data, error } = await supabase
    .from('salary_history')
    .select('*')
    .eq('employee_id', employeeId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []).map(mapDbToSalaryHistory);
}

export function useSalaryHistory(employeeId: string | undefined) {
  return useQuery({
    queryKey: ['salary-history', employeeId],
    queryFn: () => fetchSalaryHistory(employeeId!),
    enabled: !!employeeId,
  });
}

interface AddSalaryHistoryInput {
  employeeId: string;
  previousSalary: number | null;
  newSalary: number;
  changeType: SalaryChangeType;
  reason?: string;
  effectiveDate?: string;
}

export function useAddSalaryHistory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: AddSalaryHistoryInput) => {
      const { data: userData } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('salary_history')
        .insert({
          employee_id: input.employeeId,
          previous_salary: input.previousSalary,
          new_salary: input.newSalary,
          change_type: input.changeType,
          reason: input.reason || null,
          effective_date: input.effectiveDate || new Date().toISOString().split('T')[0],
          changed_by: userData?.user?.id || null,
        })
        .select()
        .single();

      if (error) throw error;
      return mapDbToSalaryHistory(data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['salary-history', variables.employeeId] });
    },
  });
}

// Bulk add salary history for multiple employees
export function useBulkAddSalaryHistory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (inputs: AddSalaryHistoryInput[]) => {
      const { data: userData } = await supabase.auth.getUser();
      
      const records = inputs.map(input => ({
        employee_id: input.employeeId,
        previous_salary: input.previousSalary,
        new_salary: input.newSalary,
        change_type: input.changeType,
        reason: input.reason || null,
        effective_date: input.effectiveDate || new Date().toISOString().split('T')[0],
        changed_by: userData?.user?.id || null,
      }));

      const { data, error } = await supabase
        .from('salary_history')
        .insert(records)
        .select();

      if (error) throw error;
      return (data || []).map(mapDbToSalaryHistory);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salary-history'] });
    },
  });
}
