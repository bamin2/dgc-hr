import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { EmployeeDeduction } from '@/data/payrollTemplates';

export function useEmployeeDeductions(employeeId?: string) {
  return useQuery({
    queryKey: ['employee-deductions', employeeId],
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

export function useAssignDeductions() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ employeeId, deductions }: { employeeId: string; deductions: DeductionInput[] }) => {
      // First, delete existing deductions for this employee
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
    },
    onSuccess: (_, { employeeId }) => {
      queryClient.invalidateQueries({ queryKey: ['employee-deductions', employeeId] });
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
      return data;
    },
    onSuccess: (_, { employee_id }) => {
      queryClient.invalidateQueries({ queryKey: ['employee-deductions', employee_id] });
    },
  });
}

export function useRemoveEmployeeDeduction() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, employeeId }: { id: string; employeeId: string }) => {
      const { error } = await supabase
        .from('employee_deductions')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return employeeId;
    },
    onSuccess: (employeeId) => {
      queryClient.invalidateQueries({ queryKey: ['employee-deductions', employeeId] });
    },
  });
}
