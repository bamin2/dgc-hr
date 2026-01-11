import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AllowanceTemplate } from '@/data/payrollTemplates';
import { queryKeys } from '@/lib/queryKeys';
import { queryPresets } from '@/lib/queryOptions';

export function useAllowanceTemplates() {
  return useQuery({
    queryKey: queryKeys.templates.allowance.all,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('allowance_templates')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as AllowanceTemplate[];
    },
    ...queryPresets.referenceData,  // Templates rarely change
  });
}

export function useAllowanceTemplatesByLocation(workLocationId: string) {
  return useQuery({
    queryKey: queryKeys.templates.allowance.byLocation(workLocationId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('allowance_templates')
        .select('*')
        .eq('work_location_id', workLocationId)
        .order('name');
      
      if (error) throw error;
      return data as AllowanceTemplate[];
    },
    enabled: !!workLocationId,
  });
}

export function useActiveAllowanceTemplates() {
  return useQuery({
    queryKey: queryKeys.templates.allowance.active,
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

export function useActiveAllowanceTemplatesByLocation(workLocationId: string | null) {
  return useQuery({
    queryKey: queryKeys.templates.allowance.activeByLocation(workLocationId || ''),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('allowance_templates')
        .select('*')
        .eq('is_active', true)
        .eq('work_location_id', workLocationId!)
        .order('name');
      
      if (error) throw error;
      return data as AllowanceTemplate[];
    },
    enabled: !!workLocationId,
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
      queryClient.invalidateQueries({ queryKey: queryKeys.templates.allowance.all });
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
      queryClient.invalidateQueries({ queryKey: queryKeys.templates.allowance.all });
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
      queryClient.invalidateQueries({ queryKey: queryKeys.templates.allowance.all });
    },
  });
}
