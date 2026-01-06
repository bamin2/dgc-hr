import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface LeaveType {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  max_days_per_year: number | null;
  is_paid: boolean;
  requires_approval: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Policy settings
  count_weekends: boolean | null;
  requires_document: boolean | null;
  document_required_after_days: number | null;
  visible_to_employees: boolean | null;
  allow_carryover: boolean | null;
  max_carryover_days: number | null;
  min_days_notice: number | null;
  max_consecutive_days: number | null;
}

export function useLeaveTypes() {
  return useQuery({
    queryKey: ['leave-types'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leave_types')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return data as LeaveType[];
    },
  });
}

export function useAllLeaveTypes() {
  return useQuery({
    queryKey: ['leave-types', 'all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leave_types')
        .select('*')
        .order('name');

      if (error) throw error;
      return data as LeaveType[];
    },
  });
}

export function useCreateLeaveType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (leaveType: Omit<LeaveType, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('leave_types')
        .insert([leaveType])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-types'] });
      toast.success('Leave type created successfully');
    },
    onError: (error) => {
      toast.error(`Failed to create leave type: ${error.message}`);
    },
  });
}

export function useUpdateLeaveType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<LeaveType> & { id: string }) => {
      const { data, error } = await supabase
        .from('leave_types')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-types'] });
      toast.success('Leave type updated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to update leave type: ${error.message}`);
    },
  });
}
