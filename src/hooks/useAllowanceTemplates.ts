import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AllowanceTemplate } from '@/data/payrollTemplates';

export function useAllowanceTemplates() {
  return useQuery({
    queryKey: ['allowance-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('allowance_templates')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as AllowanceTemplate[];
    },
  });
}

export function useActiveAllowanceTemplates() {
  return useQuery({
    queryKey: ['allowance-templates', 'active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('allowance_templates')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data as AllowanceTemplate[];
    },
  });
}

export function useCreateAllowanceTemplate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (template: Omit<AllowanceTemplate, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('allowance_templates')
        .insert(template)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allowance-templates'] });
    },
  });
}

export function useUpdateAllowanceTemplate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...template }: Partial<AllowanceTemplate> & { id: string }) => {
      const { data, error } = await supabase
        .from('allowance_templates')
        .update(template)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allowance-templates'] });
    },
  });
}

export function useDeleteAllowanceTemplate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('allowance_templates')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allowance-templates'] });
    },
  });
}
