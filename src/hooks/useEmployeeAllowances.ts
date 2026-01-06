import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { EmployeeAllowance } from '@/data/payrollTemplates';

export function useEmployeeAllowances(employeeId?: string) {
  return useQuery({
    queryKey: ['employee-allowances', employeeId],
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

export function useAssignAllowances() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ employeeId, allowances }: { employeeId: string; allowances: AllowanceInput[] }) => {
      // First, delete existing allowances for this employee
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
    },
    onSuccess: (_, { employeeId }) => {
      queryClient.invalidateQueries({ queryKey: ['employee-allowances', employeeId] });
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
      return data;
    },
    onSuccess: (_, { employee_id }) => {
      queryClient.invalidateQueries({ queryKey: ['employee-allowances', employee_id] });
    },
  });
}

export function useRemoveEmployeeAllowance() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, employeeId }: { id: string; employeeId: string }) => {
      const { error } = await supabase
        .from('employee_allowances')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return employeeId;
    },
    onSuccess: (employeeId) => {
      queryClient.invalidateQueries({ queryKey: ['employee-allowances', employeeId] });
    },
  });
}
