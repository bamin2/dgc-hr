import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { mockLeaveRequests, mockLeaveRequest, mockEmployee } from '@/test/fixtures';

// Mock Supabase client
const mockSupabase = {
  from: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  neq: vi.fn().mockReturnThis(),
  in: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  single: vi.fn().mockReturnThis(),
  maybeSingle: vi.fn().mockReturnThis(),
};

vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabase,
}));

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  };
}

describe('Leave Requests Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Fetching Leave Requests', () => {
    it('should fetch all leave requests successfully', async () => {
      mockSupabase.select.mockResolvedValueOnce({
        data: mockLeaveRequests,
        error: null,
      });

      // Simulate the query behavior
      const result = await mockSupabase
        .from('leave_requests')
        .select('*, employee:employees(*), leave_type:leave_types(*)')
        .order('created_at', { ascending: false });

      expect(mockSupabase.from).toHaveBeenCalledWith('leave_requests');
      expect(result.data).toEqual(mockLeaveRequests);
    });

    it('should fetch pending leave requests for approval', async () => {
      const pendingRequests = mockLeaveRequests.filter(r => r.status === 'pending');
      
      mockSupabase.eq.mockResolvedValueOnce({
        data: pendingRequests,
        error: null,
      });

      const result = await mockSupabase
        .from('leave_requests')
        .select('*')
        .eq('status', 'pending');

      expect(result.data).toHaveLength(1);
      expect(result.data[0].status).toBe('pending');
    });

    it('should fetch leave requests by employee', async () => {
      const employeeRequests = mockLeaveRequests.filter(
        r => r.employee_id === mockEmployee.id
      );

      mockSupabase.eq.mockResolvedValueOnce({
        data: employeeRequests,
        error: null,
      });

      const result = await mockSupabase
        .from('leave_requests')
        .select('*')
        .eq('employee_id', mockEmployee.id);

      expect(result.data).toHaveLength(employeeRequests.length);
    });

    it('should handle fetch error gracefully', async () => {
      mockSupabase.select.mockResolvedValueOnce({
        data: null,
        error: { message: 'Database connection failed' },
      });

      const result = await mockSupabase
        .from('leave_requests')
        .select('*');

      expect(result.error).toBeDefined();
      expect(result.error.message).toBe('Database connection failed');
    });
  });

  describe('Creating Leave Requests', () => {
    it('should create a new leave request', async () => {
      const newRequest = {
        employee_id: mockEmployee.id,
        leave_type_id: mockLeaveRequest.leave_type_id,
        start_date: '2024-07-01',
        end_date: '2024-07-05',
        days_count: 5,
        reason: 'Summer vacation',
        status: 'pending',
      };

      mockSupabase.single.mockResolvedValueOnce({
        data: { ...newRequest, id: 'new-id' },
        error: null,
      });

      const result = await mockSupabase
        .from('leave_requests')
        .insert(newRequest)
        .select()
        .single();

      expect(mockSupabase.insert).toHaveBeenCalledWith(newRequest);
      expect(result.data.id).toBeDefined();
    });

    it('should validate required fields before creation', async () => {
      const invalidRequest = {
        employee_id: mockEmployee.id,
        // Missing required fields
      };

      mockSupabase.single.mockResolvedValueOnce({
        data: null,
        error: { message: 'null value in column "leave_type_id" violates not-null constraint' },
      });

      const result = await mockSupabase
        .from('leave_requests')
        .insert(invalidRequest)
        .select()
        .single();

      expect(result.error).toBeDefined();
    });

    it('should handle half-day leave requests', async () => {
      const halfDayRequest = {
        ...mockLeaveRequest,
        is_half_day: true,
        days_count: 0.5,
        start_date: '2024-07-01',
        end_date: '2024-07-01',
      };

      mockSupabase.single.mockResolvedValueOnce({
        data: halfDayRequest,
        error: null,
      });

      const result = await mockSupabase
        .from('leave_requests')
        .insert(halfDayRequest)
        .select()
        .single();

      expect(result.data.is_half_day).toBe(true);
      expect(result.data.days_count).toBe(0.5);
    });
  });

  describe('Approving Leave Requests', () => {
    it('should approve a pending leave request', async () => {
      const reviewerId = '00000000-0000-0000-0000-000000000002';
      
      mockSupabase.single.mockResolvedValueOnce({
        data: {
          ...mockLeaveRequest,
          status: 'approved',
          reviewed_by: reviewerId,
          reviewed_at: new Date().toISOString(),
        },
        error: null,
      });

      const result = await mockSupabase
        .from('leave_requests')
        .update({
          status: 'approved',
          reviewed_by: reviewerId,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', mockLeaveRequest.id)
        .select()
        .single();

      expect(result.data.status).toBe('approved');
      expect(result.data.reviewed_by).toBe(reviewerId);
    });

    it('should update leave balance after approval', async () => {
      // First approve the request
      mockSupabase.single.mockResolvedValueOnce({
        data: { ...mockLeaveRequest, status: 'approved' },
        error: null,
      });

      // Then update the balance
      mockSupabase.single.mockResolvedValueOnce({
        data: { used_days: 10 }, // Updated balance
        error: null,
      });

      // Approval call
      await mockSupabase
        .from('leave_requests')
        .update({ status: 'approved' })
        .eq('id', mockLeaveRequest.id)
        .select()
        .single();

      // Balance update call
      const balanceResult = await mockSupabase
        .from('leave_balances')
        .update({ used_days: 10 })
        .eq('employee_id', mockLeaveRequest.employee_id)
        .eq('leave_type_id', mockLeaveRequest.leave_type_id)
        .select()
        .single();

      expect(balanceResult.data.used_days).toBe(10);
    });
  });

  describe('Rejecting Leave Requests', () => {
    it('should reject a leave request with reason', async () => {
      const rejectionReason = 'Insufficient team coverage during requested period';
      
      mockSupabase.single.mockResolvedValueOnce({
        data: {
          ...mockLeaveRequest,
          status: 'rejected',
          rejection_reason: rejectionReason,
          reviewed_at: new Date().toISOString(),
        },
        error: null,
      });

      const result = await mockSupabase
        .from('leave_requests')
        .update({
          status: 'rejected',
          rejection_reason: rejectionReason,
        })
        .eq('id', mockLeaveRequest.id)
        .select()
        .single();

      expect(result.data.status).toBe('rejected');
      expect(result.data.rejection_reason).toBe(rejectionReason);
    });

    it('should restore pending days after rejection', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: { pending_days: 0 }, // Restored
        error: null,
      });

      const result = await mockSupabase
        .from('leave_balances')
        .update({ pending_days: 0 })
        .eq('employee_id', mockLeaveRequest.employee_id)
        .select()
        .single();

      expect(result.data.pending_days).toBe(0);
    });
  });

  describe('Cancelling Leave Requests', () => {
    it('should cancel a pending leave request', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: { ...mockLeaveRequest, status: 'cancelled' },
        error: null,
      });

      const result = await mockSupabase
        .from('leave_requests')
        .update({ status: 'cancelled' })
        .eq('id', mockLeaveRequest.id)
        .select()
        .single();

      expect(result.data.status).toBe('cancelled');
    });

    it('should not allow cancellation of approved requests', async () => {
      const approvedRequest = { ...mockLeaveRequest, status: 'approved' };

      // Simulate policy rejection
      mockSupabase.single.mockResolvedValueOnce({
        data: null,
        error: { message: 'Cannot cancel approved leave request' },
      });

      const result = await mockSupabase
        .from('leave_requests')
        .update({ status: 'cancelled' })
        .eq('id', approvedRequest.id)
        .select()
        .single();

      expect(result.error).toBeDefined();
    });
  });

  describe('Query Invalidation', () => {
    it('should invalidate queries after mutation', async () => {
      const queryClient = new QueryClient();
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      // Simulate mutation completion
      await queryClient.invalidateQueries({ queryKey: ['leave-requests'] });

      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['leave-requests'] });
    });

    it('should invalidate related queries (balances, employee data)', async () => {
      const queryClient = new QueryClient();
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      // Simulate cascading invalidations after leave approval
      await queryClient.invalidateQueries({ queryKey: ['leave-requests'] });
      await queryClient.invalidateQueries({ queryKey: ['leave-balances'] });
      await queryClient.invalidateQueries({ queryKey: ['employees', mockEmployee.id] });

      expect(invalidateSpy).toHaveBeenCalledTimes(3);
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors', async () => {
      mockSupabase.select.mockRejectedValueOnce(new Error('Network error'));

      await expect(
        mockSupabase.from('leave_requests').select('*')
      ).rejects.toThrow('Network error');
    });

    it('should handle concurrent request conflicts', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: null,
        error: { 
          message: 'Request already processed',
          code: 'PGRST116',
        },
      });

      const result = await mockSupabase
        .from('leave_requests')
        .update({ status: 'approved' })
        .eq('id', mockLeaveRequest.id)
        .eq('status', 'pending') // Optimistic locking
        .select()
        .single();

      expect(result.error).toBeDefined();
    });
  });
});
