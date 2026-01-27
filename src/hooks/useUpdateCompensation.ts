import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { queryKeys } from '@/lib/queryKeys';
import { CompensationComponent, createAllowanceSnapshot, createDeductionSnapshot } from './useSalaryHistory';
import { Json } from '@/integrations/supabase/types';

interface AllowanceInput {
  templateId?: string | null;
  customName?: string | null;
  customAmount?: number | null;
}

interface DeductionInput {
  templateId?: string | null;
  customName?: string | null;
  customAmount?: number | null;
}

export interface UpdateCompensationInput {
  employeeId: string;
  previousSalary: number;
  newSalary: number;
  previousGosiSalary: number | null;
  newGosiSalary: number | null;
  previousAllowances: CompensationComponent[];
  newAllowances: AllowanceInput[];
  previousDeductions: CompensationComponent[];
  newDeductions: DeductionInput[];
  reason?: string;
}

export function useUpdateCompensation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (input: UpdateCompensationInput) => {
      const { data: userData } = await supabase.auth.getUser();
      
      // 1. Update employee salary
      const { error: empError } = await supabase
        .from('employees')
        .update({
          salary: input.newSalary,
          gosi_registered_salary: input.newGosiSalary,
        })
        .eq('id', input.employeeId);
      
      if (empError) throw empError;
      
      // 2. Replace allowances - delete existing
      const { error: deleteAllowError } = await supabase
        .from('employee_allowances')
        .delete()
        .eq('employee_id', input.employeeId);
      
      if (deleteAllowError) throw deleteAllowError;
      
      // Insert new allowances
      if (input.newAllowances.length > 0) {
        const { error: insertAllowError } = await supabase
          .from('employee_allowances')
          .insert(
            input.newAllowances.map(a => ({
              employee_id: input.employeeId,
              allowance_template_id: a.templateId || null,
              custom_name: a.customName || null,
              custom_amount: a.customAmount || null,
            }))
          );
        
        if (insertAllowError) throw insertAllowError;
      }
      
      // 3. Replace deductions - delete existing
      const { error: deleteDeductError } = await supabase
        .from('employee_deductions')
        .delete()
        .eq('employee_id', input.employeeId);
      
      if (deleteDeductError) throw deleteDeductError;
      
      // Insert new deductions
      if (input.newDeductions.length > 0) {
        const { error: insertDeductError } = await supabase
          .from('employee_deductions')
          .insert(
            input.newDeductions.map(d => ({
              employee_id: input.employeeId,
              deduction_template_id: d.templateId || null,
              custom_name: d.customName || null,
              custom_amount: d.customAmount || null,
            }))
          );
        
        if (insertDeductError) throw insertDeductError;
      }
      
      // 4. Fetch the new allowances/deductions to create accurate snapshots
      const { data: newAllowanceData } = await supabase
        .from('employee_allowances')
        .select(`*, allowance_template:allowance_templates(name, amount)`)
        .eq('employee_id', input.employeeId);
      
      const { data: newDeductionData } = await supabase
        .from('employee_deductions')
        .select(`*, deduction_template:deduction_templates(name, amount)`)
        .eq('employee_id', input.employeeId);
      
      const newAllowancesSnapshot = createAllowanceSnapshot(newAllowanceData || []);
      const newDeductionsSnapshot = createDeductionSnapshot(newDeductionData || []);
      
      // 5. Create salary history record
      const { error: historyError } = await supabase
        .from('salary_history')
        .insert({
          employee_id: input.employeeId,
          previous_salary: input.previousSalary,
          new_salary: input.newSalary,
          change_type: 'compensation_update',
          reason: input.reason || 'Compensation updated',
          effective_date: new Date().toISOString().split('T')[0],
          changed_by: userData?.user?.id || null,
          previous_allowances: input.previousAllowances as unknown as Json,
          new_allowances: newAllowancesSnapshot as unknown as Json,
          previous_deductions: input.previousDeductions as unknown as Json,
          new_deductions: newDeductionsSnapshot as unknown as Json,
        });
      
      if (historyError) throw historyError;
      
      return { success: true };
    },
    onSuccess: (_, variables) => {
      // Invalidate all related queries
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.employees.detail(variables.employeeId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.compensation.allowances.byEmployee(variables.employeeId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.compensation.deductions.byEmployee(variables.employeeId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.compensation.salaryHistory(variables.employeeId) 
      });
      // Also invalidate the employees list for consistency
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.employees.all 
      });
    },
  });
}
