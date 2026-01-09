import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";

export type SalaryChangeType = 'initial' | 'adjustment' | 'promotion' | 'annual_review' | 'correction' | 'bulk_update' | 'allowance_change' | 'deduction_change' | 'compensation_update';

export interface CompensationComponent {
  name: string;
  amount: number;
  templateId?: string | null;
}

export interface SalaryHistoryRecord {
  id: string;
  employeeId: string;
  previousSalary: number | null;
  newSalary: number | null;
  changeType: SalaryChangeType;
  reason: string | null;
  effectiveDate: string;
  changedBy: string | null;
  changedByName?: string;
  createdAt: string;
  previousAllowances?: CompensationComponent[] | null;
  newAllowances?: CompensationComponent[] | null;
  previousDeductions?: CompensationComponent[] | null;
  newDeductions?: CompensationComponent[] | null;
}

interface DbSalaryHistory {
  id: string;
  employee_id: string;
  previous_salary: number | null;
  new_salary: number | null;
  change_type: string;
  reason: string | null;
  effective_date: string;
  changed_by: string | null;
  created_at: string;
  previous_allowances: Json | null;
  new_allowances: Json | null;
  previous_deductions: Json | null;
  new_deductions: Json | null;
}

const parseJsonToComponents = (json: Json | null): CompensationComponent[] | null => {
  if (!json || !Array.isArray(json)) return null;
  return json as unknown as CompensationComponent[];
};

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
  previousAllowances: parseJsonToComponents(db.previous_allowances),
  newAllowances: parseJsonToComponents(db.new_allowances),
  previousDeductions: parseJsonToComponents(db.previous_deductions),
  newDeductions: parseJsonToComponents(db.new_deductions),
});

async function fetchSalaryHistory(employeeId: string): Promise<SalaryHistoryRecord[]> {
  const { data, error } = await supabase
    .from('salary_history')
    .select('*')
    .eq('employee_id', employeeId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []).map((d: any) => mapDbToSalaryHistory(d as DbSalaryHistory));
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
  previousSalary?: number | null;
  newSalary?: number | null;
  changeType: SalaryChangeType;
  reason?: string;
  effectiveDate?: string;
  previousAllowances?: CompensationComponent[];
  newAllowances?: CompensationComponent[];
  previousDeductions?: CompensationComponent[];
  newDeductions?: CompensationComponent[];
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
          previous_salary: input.previousSalary ?? null,
          new_salary: input.newSalary ?? null,
          change_type: input.changeType,
          reason: input.reason || null,
          effective_date: input.effectiveDate || new Date().toISOString().split('T')[0],
          changed_by: userData?.user?.id || null,
          previous_allowances: input.previousAllowances ? (input.previousAllowances as unknown as Json) : null,
          new_allowances: input.newAllowances ? (input.newAllowances as unknown as Json) : null,
          previous_deductions: input.previousDeductions ? (input.previousDeductions as unknown as Json) : null,
          new_deductions: input.newDeductions ? (input.newDeductions as unknown as Json) : null,
        })
        .select()
        .single();

      if (error) throw error;
      return mapDbToSalaryHistory(data as unknown as DbSalaryHistory);
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
        previous_salary: input.previousSalary ?? null,
        new_salary: input.newSalary ?? null,
        change_type: input.changeType,
        reason: input.reason || null,
        effective_date: input.effectiveDate || new Date().toISOString().split('T')[0],
        changed_by: userData?.user?.id || null,
        previous_allowances: input.previousAllowances ? (input.previousAllowances as unknown as Json) : null,
        new_allowances: input.newAllowances ? (input.newAllowances as unknown as Json) : null,
        previous_deductions: input.previousDeductions ? (input.previousDeductions as unknown as Json) : null,
        new_deductions: input.newDeductions ? (input.newDeductions as unknown as Json) : null,
      }));

      const { data, error } = await supabase
        .from('salary_history')
        .insert(records)
        .select();

      if (error) throw error;
      return (data || []).map((d: any) => mapDbToSalaryHistory(d as DbSalaryHistory));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salary-history'] });
    },
  });
}

// Helper to create compensation component snapshots from allowances/deductions
export function createAllowanceSnapshot(
  allowances: Array<{
    custom_name?: string | null;
    custom_amount?: number | null;
    allowance_template?: { name: string; amount: number } | null;
    allowance_template_id?: string | null;
  }>
): CompensationComponent[] {
  return allowances.map(a => {
    const template = a.allowance_template;
    return {
      name: a.custom_name || template?.name || 'Unknown',
      amount: a.custom_amount ?? template?.amount ?? 0,
      templateId: a.allowance_template_id,
    };
  });
}

export function createDeductionSnapshot(
  deductions: Array<{
    custom_name?: string | null;
    custom_amount?: number | null;
    deduction_template?: { name: string; amount: number } | null;
    deduction_template_id?: string | null;
  }>
): CompensationComponent[] {
  return deductions.map(d => {
    const template = d.deduction_template;
    return {
      name: d.custom_name || template?.name || 'Unknown',
      amount: d.custom_amount ?? template?.amount ?? 0,
      templateId: d.deduction_template_id,
    };
  });
}
