import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { EmployeeDeduction } from '@/data/payrollTemplates';
import { createDeductionSnapshot, CompensationComponent } from './useSalaryHistory';
import { Json } from '@/integrations/supabase/types';
import { queryKeys } from '@/lib/queryKeys';

export function useEmployeeDeductions(employeeId?: string) {
  return useQuery({
    queryKey: queryKeys.compensation.deductions.byEmployee(employeeId || ''),
    queryFn: async () => {
      let query = supabase
        .from('employee_deductions')
        .select(`
          *,
          deduction_template:deduction_templates(*)
        `);
      
      if (employeeId) {
        query = query.eq('employee_id', employeeId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as EmployeeDeduction[];
    },
    enabled: !!employeeId,
  });
}

interface DeductionInput {
  templateId?: string;
  customName?: string;
  customAmount?: number;
}

async function fetchCurrentDeductions(employeeId: string): Promise<CompensationComponent[]> {
  const { data } = await supabase
    .from('employee_deductions')
    .select(`*, deduction_template:deduction_templates(name, amount)`)
    .eq('employee_id', employeeId);
  
  return createDeductionSnapshot(data || []);
}

async function logDeductionChange(
  employeeId: string,
  previousDeductions: CompensationComponent[],
  newDeductions: CompensationComponent[],
  reason?: string
) {
  const { data: userData } = await supabase.auth.getUser();
  
  await supabase.from('salary_history').insert({
    employee_id: employeeId,
    previous_salary: null,
    new_salary: null,
    change_type: 'deduction_change',
    reason: reason || 'Deductions updated',
    effective_date: new Date().toISOString().split('T')[0],
    changed_by: userData?.user?.id || null,
    previous_allowances: null,
    new_allowances: null,
    previous_deductions: previousDeductions as unknown as Json,
    new_deductions: newDeductions as unknown as Json,
  });
}

export function useAssignDeductions() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ employeeId, deductions, reason }: { employeeId: string; deductions: DeductionInput[]; reason?: string }) => {
      // Fetch current deductions before changes
      const previousDeductions = await fetchCurrentDeductions(employeeId);
      
      // Delete existing deductions for this employee
      await supabase
        .from('employee_deductions')
        .delete()
        .eq('employee_id', employeeId);
      
      // Then insert the new ones
      if (deductions.length > 0) {
        const { error } = await supabase
          .from('employee_deductions')
          .insert(
            deductions.map(d => ({
              employee_id: employeeId,
              deduction_template_id: d.templateId || null,
              custom_name: d.customName || null,
              custom_amount: d.customAmount || null,
            }))
          );
        
        if (error) throw error;
      }
      
      // Fetch new deductions after changes
      const newDeductions = await fetchCurrentDeductions(employeeId);
      
      // Log the change to salary history
      if (previousDeductions.length > 0 || newDeductions.length > 0) {
        await logDeductionChange(employeeId, previousDeductions, newDeductions, reason);
      }
    },
    onSuccess: (_, { employeeId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.compensation.deductions.byEmployee(employeeId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.compensation.salaryHistory(employeeId) });
    },
  });
}

export function useAddEmployeeDeduction() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (deduction: {
      employee_id: string;
      deduction_template_id?: string;
      custom_name?: string;
      custom_amount?: number;
    }) => {
      // Fetch current deductions before changes
      const previousDeductions = await fetchCurrentDeductions(deduction.employee_id);
      
      const { data, error } = await supabase
        .from('employee_deductions')
        .insert({
          employee_id: deduction.employee_id,
          deduction_template_id: deduction.deduction_template_id || null,
          custom_name: deduction.custom_name || null,
          custom_amount: deduction.custom_amount || null,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Fetch new deductions after changes
      const newDeductions = await fetchCurrentDeductions(deduction.employee_id);
      
      // Log the change
      await logDeductionChange(deduction.employee_id, previousDeductions, newDeductions, 'Added deduction');
      
      return data;
    },
    onSuccess: (_, { employee_id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.compensation.deductions.byEmployee(employee_id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.compensation.salaryHistory(employee_id) });
    },
  });
}

export function useRemoveEmployeeDeduction() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, employeeId }: { id: string; employeeId: string }) => {
      // Fetch current deductions before changes
      const previousDeductions = await fetchCurrentDeductions(employeeId);
      
      const { error } = await supabase
        .from('employee_deductions')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Fetch new deductions after changes
      const newDeductions = await fetchCurrentDeductions(employeeId);
      
      // Log the change
      await logDeductionChange(employeeId, previousDeductions, newDeductions, 'Removed deduction');
      
      return employeeId;
    },
    onSuccess: (employeeId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.compensation.deductions.byEmployee(employeeId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.compensation.salaryHistory(employeeId) });
    },
  });
}
