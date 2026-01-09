import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { queryKeys } from '@/lib/queryKeys';
import type { LeaveBalance, LeaveBalanceSummary } from '@/types/leave';

// Re-export types for backward compatibility
export type { LeaveBalance, LeaveBalanceSummary };

export function useLeaveBalances(employeeId?: string, year?: number) {
  const currentYear = year || new Date().getFullYear();

  return useQuery({
    queryKey: [...queryKeys.leave.balances.all, employeeId, currentYear],
    queryFn: async () => {
      let query = supabase
        .from('leave_balances')
        .select(`
          *,
          leave_type:leave_types (
            id,
            name,
            color,
            is_paid
          )
        `)
        .eq('year', currentYear);

      if (employeeId) {
        query = query.eq('employee_id', employeeId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as LeaveBalance[];
    },
    enabled: !!employeeId,
  });
}

export function useMyLeaveBalances(year?: number) {
  const currentYear = year || new Date().getFullYear();

  return useQuery({
    queryKey: [...queryKeys.leave.balances.all, 'my', currentYear],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: profile } = await supabase
        .from('profiles')
        .select('employee_id')
        .eq('id', user.id)
        .single();

      if (!profile?.employee_id) {
        return [];
      }

      const { data, error } = await supabase
        .from('leave_balances')
        .select(`
          *,
          leave_type:leave_types (
            id,
            name,
            color,
            is_paid
          )
        `)
        .eq('employee_id', profile.employee_id)
        .eq('year', currentYear);

      if (error) throw error;
      return data as LeaveBalance[];
    },
  });
}

export function useLeaveBalanceSummary(employeeId?: string, year?: number) {
  const { data: balances, ...rest } = useLeaveBalances(employeeId, year);

  const summary: LeaveBalanceSummary[] = balances?.map((balance) => ({
    leaveTypeId: balance.leave_type_id,
    leaveTypeName: balance.leave_type?.name || 'Unknown',
    color: balance.leave_type?.color || '#3b82f6',
    total: balance.total_days,
    used: balance.used_days,
    pending: balance.pending_days,
    remaining: balance.total_days - balance.used_days - balance.pending_days,
  })) || [];

  return { data: summary, ...rest };
}

export function useCreateLeaveBalance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (balance: Omit<LeaveBalance, 'id' | 'created_at' | 'updated_at' | 'leave_type'>) => {
      const { data, error } = await supabase
        .from('leave_balances')
        .insert(balance)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leave.balances.all });
      toast.success('Leave balance created successfully');
    },
    onError: (error) => {
      toast.error(`Failed to create leave balance: ${error.message}`);
    },
  });
}

export function useUpdateLeaveBalance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<LeaveBalance> & { id: string }) => {
      const { data, error } = await supabase
        .from('leave_balances')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leave.balances.all });
      toast.success('Leave balance updated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to update leave balance: ${error.message}`);
    },
  });
}

export function useBulkCreateLeaveBalances() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (balances: Omit<LeaveBalance, 'id' | 'created_at' | 'updated_at' | 'leave_type'>[]) => {
      const { data, error } = await supabase
        .from('leave_balances')
        .insert(balances)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leave.balances.all });
      toast.success('Leave balances created successfully');
    },
    onError: (error) => {
      toast.error(`Failed to create leave balances: ${error.message}`);
    },
  });
}
