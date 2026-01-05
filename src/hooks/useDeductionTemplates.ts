import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { DeductionTemplate } from '@/data/payrollTemplates';

export function useDeductionTemplates() {
  return useQuery({
    queryKey: ['deduction-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deduction_templates')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as DeductionTemplate[];
    },
  });
}

export function useActiveDeductionTemplates() {
  return useQuery({
    queryKey: ['deduction-templates', 'active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deduction_templates')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data as DeductionTemplate[];
    },
  });
}

export function useCreateDeductionTemplate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (template: Omit<DeductionTemplate, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('deduction_templates')
        .insert(template)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deduction-templates'] });
    },
  });
}

export function useUpdateDeductionTemplate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...template }: Partial<DeductionTemplate> & { id: string }) => {
      const { data, error } = await supabase
        .from('deduction_templates')
        .update(template)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deduction-templates'] });
    },
  });
}

export function useDeleteDeductionTemplate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('deduction_templates')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deduction-templates'] });
    },
  });
}
