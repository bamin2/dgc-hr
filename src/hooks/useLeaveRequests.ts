import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type LeaveRequestStatus = 'pending' | 'approved' | 'rejected';

export interface LeaveRequest {
  id: string;
  employee_id: string;
  leave_type_id: string;
  start_date: string;
  end_date: string;
  days_count: number;
  is_half_day: boolean;
  reason: string | null;
  status: LeaveRequestStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
  employee?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    avatar_url: string | null;
    department?: {
      id: string;
      name: string;
    } | null;
  };
  leave_type?: {
    id: string;
    name: string;
    color: string | null;
    is_paid: boolean;
  };
  reviewer?: {
    id: string;
    first_name: string;
    last_name: string;
  } | null;
}

interface UseLeaveRequestsOptions {
  status?: LeaveRequestStatus;
  employeeId?: string;
}

export function useLeaveRequests(options: UseLeaveRequestsOptions = {}) {
  const { status, employeeId } = options;

  return useQuery({
    queryKey: ['leave-requests', { status, employeeId }],
    queryFn: async () => {
      let query = supabase
        .from('leave_requests')
        .select(`
          *,
          employee:employees!leave_requests_employee_id_fkey (
            id,
            first_name,
            last_name,
            email,
            avatar_url,
            department:departments!employees_department_id_fkey (
              id,
              name
            )
          ),
          leave_type:leave_types (
            id,
            name,
            color,
            is_paid
          ),
          reviewer:employees!leave_requests_reviewed_by_fkey (
            id,
            first_name,
            last_name
          )
        `)
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }
      if (employeeId) {
        query = query.eq('employee_id', employeeId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as LeaveRequest[];
    },
  });
}

export function usePendingLeaveRequests() {
  return useLeaveRequests({ status: 'pending' });
}

export function useLeaveRequest(id: string) {
  return useQuery({
    queryKey: ['leave-request', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leave_requests')
        .select(`
          *,
          employee:employees!leave_requests_employee_id_fkey (
            id,
            first_name,
            last_name,
            email,
            avatar_url,
            department:departments!employees_department_id_fkey (
              id,
              name
            )
          ),
          leave_type:leave_types (
            id,
            name,
            color,
            is_paid
          ),
          reviewer:employees!leave_requests_reviewed_by_fkey (
            id,
            first_name,
            last_name
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as LeaveRequest;
    },
    enabled: !!id,
  });
}

export function useCreateLeaveRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: {
      employee_id: string;
      leave_type_id: string;
      start_date: string;
      end_date: string;
      days_count: number;
      is_half_day?: boolean;
      reason?: string;
    }) => {
      const { data, error } = await supabase
        .from('leave_requests')
        .insert({
          ...request,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;
      
      // Send email notification (fire and forget)
      supabase.functions.invoke('send-email', {
        body: { type: 'leave_request_submitted', leaveRequestId: data.id }
      }).catch(console.error);
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-requests'] });
      queryClient.invalidateQueries({ queryKey: ['leave-balances'] });
      
      // Invalidate notifications after a short delay to allow the edge function to complete
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
        queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
      }, 1500);
    },
    onError: (error) => {
      toast.error(`Failed to submit leave request: ${error.message}`);
    },
  });
}

export function useApproveLeaveRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, reviewerId }: { id: string; reviewerId: string }) => {
      const { data, error } = await supabase
        .from('leave_requests')
        .update({
          status: 'approved',
          reviewed_by: reviewerId,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      // Send email notification
      supabase.functions.invoke('send-email', {
        body: { type: 'leave_request_approved', leaveRequestId: id }
      }).catch(console.error);
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-requests'] });
      queryClient.invalidateQueries({ queryKey: ['leave-balances'] });
      toast.success('Leave request approved');
    },
    onError: (error) => {
      toast.error(`Failed to approve leave request: ${error.message}`);
    },
  });
}

export function useRejectLeaveRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id, 
      reviewerId, 
      rejectionReason 
    }: { 
      id: string; 
      reviewerId: string; 
      rejectionReason: string;
    }) => {
      const { data, error } = await supabase
        .from('leave_requests')
        .update({
          status: 'rejected',
          reviewed_by: reviewerId,
          reviewed_at: new Date().toISOString(),
          rejection_reason: rejectionReason,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      // Send email notification
      supabase.functions.invoke('send-email', {
        body: { type: 'leave_request_rejected', leaveRequestId: id }
      }).catch(console.error);
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-requests'] });
      queryClient.invalidateQueries({ queryKey: ['leave-balances'] });
      toast.success('Leave request rejected');
    },
    onError: (error) => {
      toast.error(`Failed to reject leave request: ${error.message}`);
    },
  });
}

export function useDeleteLeaveRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('leave_requests')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-requests'] });
      queryClient.invalidateQueries({ queryKey: ['leave-balances'] });
      toast.success('Leave request deleted');
    },
    onError: (error) => {
      toast.error(`Failed to delete leave request: ${error.message}`);
    },
  });
}

export function useUpdateLeaveRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<LeaveRequest> & { id: string }) => {
      const { data, error } = await supabase
        .from('leave_requests')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-requests'] });
      toast.success('Leave request updated');
    },
    onError: (error) => {
      toast.error(`Failed to update leave request: ${error.message}`);
    },
  });
}
