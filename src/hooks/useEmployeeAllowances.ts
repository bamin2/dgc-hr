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

export function useAssignAllowances() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ employeeId, allowanceTemplateIds }: { employeeId: string; allowanceTemplateIds: string[] }) => {
      // First, delete existing allowances for this employee
      await supabase
        .from('employee_allowances')
        .delete()
        .eq('employee_id', employeeId);
      
      // Then insert the new ones
      if (allowanceTemplateIds.length > 0) {
        const { error } = await supabase
          .from('employee_allowances')
          .insert(
            allowanceTemplateIds.map(templateId => ({
              employee_id: employeeId,
              allowance_template_id: templateId,
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
      allowance_template_id: string;
      custom_amount?: number;
    }) => {
      const { data, error } = await supabase
        .from('employee_allowances')
        .insert(allowance)
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
