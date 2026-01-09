import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { EmployeeAllowance } from '@/data/payrollTemplates';
import { createAllowanceSnapshot, CompensationComponent } from './useSalaryHistory';
import { Json } from '@/integrations/supabase/types';
import { queryKeys } from '@/lib/queryKeys';

export function useEmployeeAllowances(employeeId?: string) {
  return useQuery({
    queryKey: queryKeys.compensation.allowances.byEmployee(employeeId || ''),
    queryFn: async () => {
      let query = supabase
        .from('employee_allowances')
        .select(`
          *,
          allowance_template:allowance_templates(*)
        `);
      
      if (employeeId) {
        query = query.eq('employee_id', employeeId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as EmployeeAllowance[];
    },
    enabled: !!employeeId,
  });
}

interface AllowanceInput {
  templateId?: string;
  customName?: string;
  customAmount?: number;
}

async function fetchCurrentAllowances(employeeId: string): Promise<CompensationComponent[]> {
  const { data } = await supabase
    .from('employee_allowances')
    .select(`*, allowance_template:allowance_templates(name, amount)`)
    .eq('employee_id', employeeId);
  
  return createAllowanceSnapshot(data || []);
}

async function logAllowanceChange(
  employeeId: string,
  previousAllowances: CompensationComponent[],
  newAllowances: CompensationComponent[],
  reason?: string
) {
  const { data: userData } = await supabase.auth.getUser();
  
  await supabase.from('salary_history').insert({
    employee_id: employeeId,
    previous_salary: null,
    new_salary: null,
    change_type: 'allowance_change',
    reason: reason || 'Allowances updated',
    effective_date: new Date().toISOString().split('T')[0],
    changed_by: userData?.user?.id || null,
    previous_allowances: previousAllowances as unknown as Json,
    new_allowances: newAllowances as unknown as Json,
    previous_deductions: null,
    new_deductions: null,
  });
}

export function useAssignAllowances() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ employeeId, allowances, reason }: { employeeId: string; allowances: AllowanceInput[]; reason?: string }) => {
      // Fetch current allowances before changes
      const previousAllowances = await fetchCurrentAllowances(employeeId);
      
      // Delete existing allowances for this employee
      await supabase
        .from('employee_allowances')
        .delete()
        .eq('employee_id', employeeId);
      
      // Then insert the new ones
      if (allowances.length > 0) {
        const { error } = await supabase
          .from('employee_allowances')
          .insert(
            allowances.map(a => ({
              employee_id: employeeId,
              allowance_template_id: a.templateId || null,
              custom_name: a.customName || null,
              custom_amount: a.customAmount || null,
            }))
          );
        
        if (error) throw error;
      }
      
      // Fetch new allowances after changes
      const newAllowances = await fetchCurrentAllowances(employeeId);
      
      // Log the change to salary history
      if (previousAllowances.length > 0 || newAllowances.length > 0) {
        await logAllowanceChange(employeeId, previousAllowances, newAllowances, reason);
      }
    },
    onSuccess: (_, { employeeId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.compensation.allowances.byEmployee(employeeId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.compensation.salaryHistory(employeeId) });
    },
  });
}

export function useAddEmployeeAllowance() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (allowance: {
      employee_id: string;
      allowance_template_id?: string;
      custom_name?: string;
      custom_amount?: number;
    }) => {
      // Fetch current allowances before changes
      const previousAllowances = await fetchCurrentAllowances(allowance.employee_id);
      
      const { data, error } = await supabase
        .from('employee_allowances')
        .insert({
          employee_id: allowance.employee_id,
          allowance_template_id: allowance.allowance_template_id || null,
          custom_name: allowance.custom_name || null,
          custom_amount: allowance.custom_amount || null,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Fetch new allowances after changes
      const newAllowances = await fetchCurrentAllowances(allowance.employee_id);
      
      // Log the change
      await logAllowanceChange(allowance.employee_id, previousAllowances, newAllowances, 'Added allowance');
      
      return data;
    },
    onSuccess: (_, { employee_id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.compensation.allowances.byEmployee(employee_id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.compensation.salaryHistory(employee_id) });
    },
  });
}

export function useRemoveEmployeeAllowance() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, employeeId }: { id: string; employeeId: string }) => {
      // Fetch current allowances before changes
      const previousAllowances = await fetchCurrentAllowances(employeeId);
      
      const { error } = await supabase
        .from('employee_allowances')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Fetch new allowances after changes
      const newAllowances = await fetchCurrentAllowances(employeeId);
      
      // Log the change
      await logAllowanceChange(employeeId, previousAllowances, newAllowances, 'Removed allowance');
      
      return employeeId;
    },
    onSuccess: (employeeId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.compensation.allowances.byEmployee(employeeId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.compensation.salaryHistory(employeeId) });
    },
  });
}
