import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { DeductionTemplate } from '@/data/payrollTemplates';
import { queryKeys } from '@/lib/queryKeys';

export function useDeductionTemplates() {
  return useQuery({
    queryKey: queryKeys.templates.deduction.all,
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

export function useDeductionTemplatesByLocation(workLocationId: string) {
  return useQuery({
    queryKey: queryKeys.templates.deduction.byLocation(workLocationId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deduction_templates')
        .select('*')
        .eq('work_location_id', workLocationId)
        .order('name');
      
      if (error) throw error;
      return data as DeductionTemplate[];
    },
    enabled: !!workLocationId,
  });
}

export function useActiveDeductionTemplates() {
  return useQuery({
    queryKey: queryKeys.templates.deduction.active,
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

export function useActiveDeductionTemplatesByLocation(workLocationId: string | null) {
  return useQuery({
    queryKey: queryKeys.templates.deduction.activeByLocation(workLocationId || ''),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deduction_templates')
        .select('*')
        .eq('is_active', true)
        .eq('work_location_id', workLocationId!)
        .order('name');
      
      if (error) throw error;
      return data as DeductionTemplate[];
    },
    enabled: !!workLocationId,
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
      queryClient.invalidateQueries({ queryKey: queryKeys.templates.deduction.all });
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
      queryClient.invalidateQueries({ queryKey: queryKeys.templates.deduction.all });
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
      queryClient.invalidateQueries({ queryKey: queryKeys.templates.deduction.all });
    },
  });
}
