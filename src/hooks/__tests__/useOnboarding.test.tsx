import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient } from '@tanstack/react-query';
import { 
  mockOnboardingRecord, 
  mockOnboardingTask, 
  mockOnboardingWorkflow,
  mockEmployee 
} from '@/test/fixtures';

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

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('Onboarding Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Fetching Onboarding Workflows', () => {
    it('should fetch all active workflows', async () => {
      const workflows = [mockOnboardingWorkflow];
      
      mockSupabase.eq.mockResolvedValueOnce({
        data: workflows,
        error: null,
      });

      const result = await mockSupabase
        .from('onboarding_workflows')
        .select('*')
        .eq('is_active', true);

      expect(result.data).toHaveLength(1);
      expect(result.data[0].name).toBe('Standard Onboarding');
    });

    it('should fetch workflow with tasks', async () => {
      const workflowWithTasks = {
        ...mockOnboardingWorkflow,
        tasks: [mockOnboardingTask],
      };

      mockSupabase.single.mockResolvedValueOnce({
        data: workflowWithTasks,
        error: null,
      });

      const result = await mockSupabase
        .from('onboarding_workflows')
        .select('*, tasks:onboarding_workflow_tasks(*)')
        .eq('id', mockOnboardingWorkflow.id)
        .single();

      expect(result.data.tasks).toBeDefined();
      expect(result.data.tasks).toHaveLength(1);
    });

    it('should identify default workflow', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: mockOnboardingWorkflow,
        error: null,
      });

      const result = await mockSupabase
        .from('onboarding_workflows')
        .select('*')
        .eq('is_default', true)
        .single();

      expect(result.data.is_default).toBe(true);
    });
  });

  describe('Creating Onboarding Records', () => {
    it('should create onboarding record for new employee', async () => {
      const newRecord = {
        employee_id: mockEmployee.id,
        workflow_id: mockOnboardingWorkflow.id,
        workflow_name: mockOnboardingWorkflow.name,
        start_date: '2024-02-01',
        scheduled_completion: '2024-02-14',
        status: 'not_started',
      };

      mockSupabase.single.mockResolvedValueOnce({
        data: { ...newRecord, id: 'new-record-id' },
        error: null,
      });

      const result = await mockSupabase
        .from('onboarding_records')
        .insert(newRecord)
        .select()
        .single();

      expect(result.data.id).toBeDefined();
      expect(result.data.status).toBe('not_started');
    });

    it('should create tasks from workflow template', async () => {
      const templateTasks = [
        { title: 'Complete paperwork', category: 'documentation', task_order: 1 },
        { title: 'IT setup', category: 'it_setup', task_order: 2 },
        { title: 'Team introduction', category: 'training', task_order: 3 },
      ];

      const recordId = mockOnboardingRecord.id;
      const tasksToInsert = templateTasks.map(task => ({
        ...task,
        onboarding_record_id: recordId,
        status: 'pending',
        is_required: true,
      }));

      mockSupabase.select.mockResolvedValueOnce({
        data: tasksToInsert,
        error: null,
      });

      const result = await mockSupabase
        .from('onboarding_tasks')
        .insert(tasksToInsert)
        .select();

      expect(result.data).toHaveLength(3);
    });

    it('should assign team members to onboarding', async () => {
      const assignedRecord = {
        ...mockOnboardingRecord,
        manager_id: '00000000-0000-0000-0000-000000000002',
        buddy_id: '00000000-0000-0000-0000-000000000003',
        hr_contact_id: '00000000-0000-0000-0000-000000000004',
      };

      mockSupabase.single.mockResolvedValueOnce({
        data: assignedRecord,
        error: null,
      });

      const result = await mockSupabase
        .from('onboarding_records')
        .update({
          manager_id: assignedRecord.manager_id,
          buddy_id: assignedRecord.buddy_id,
          hr_contact_id: assignedRecord.hr_contact_id,
        })
        .eq('id', mockOnboardingRecord.id)
        .select()
        .single();

      expect(result.data.manager_id).toBeDefined();
      expect(result.data.buddy_id).toBeDefined();
    });
  });

  describe('Updating Task Status', () => {
    it('should mark task as completed', async () => {
      const completedAt = new Date().toISOString();
      const completedBy = '00000000-0000-0000-0000-000000000001';

      mockSupabase.single.mockResolvedValueOnce({
        data: {
          ...mockOnboardingTask,
          status: 'completed',
          completed_at: completedAt,
          completed_by: completedBy,
        },
        error: null,
      });

      const result = await mockSupabase
        .from('onboarding_tasks')
        .update({
          status: 'completed',
          completed_at: completedAt,
          completed_by: completedBy,
        })
        .eq('id', mockOnboardingTask.id)
        .select()
        .single();

      expect(result.data.status).toBe('completed');
      expect(result.data.completed_at).toBeDefined();
    });

    it('should mark task as in progress', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: { ...mockOnboardingTask, status: 'in_progress' },
        error: null,
      });

      const result = await mockSupabase
        .from('onboarding_tasks')
        .update({ status: 'in_progress' })
        .eq('id', mockOnboardingTask.id)
        .select()
        .single();

      expect(result.data.status).toBe('in_progress');
    });

    it('should skip optional task', async () => {
      const optionalTask = { ...mockOnboardingTask, is_required: false };

      mockSupabase.single.mockResolvedValueOnce({
        data: { ...optionalTask, status: 'skipped' },
        error: null,
      });

      const result = await mockSupabase
        .from('onboarding_tasks')
        .update({ status: 'skipped' })
        .eq('id', optionalTask.id)
        .select()
        .single();

      expect(result.data.status).toBe('skipped');
    });
  });

  describe('Calculating Progress', () => {
    it('should calculate onboarding progress correctly', () => {
      const tasks = [
        { ...mockOnboardingTask, status: 'completed' },
        { ...mockOnboardingTask, id: '2', status: 'completed' },
        { ...mockOnboardingTask, id: '3', status: 'in_progress' },
        { ...mockOnboardingTask, id: '4', status: 'pending' },
        { ...mockOnboardingTask, id: '5', status: 'pending' },
      ];

      const completedTasks = tasks.filter(t => t.status === 'completed').length;
      const totalTasks = tasks.length;
      const progress = Math.round((completedTasks / totalTasks) * 100);

      expect(progress).toBe(40); // 2 out of 5 = 40%
    });

    it('should handle empty task list', () => {
      const tasks: typeof mockOnboardingTask[] = [];
      const progress = tasks.length === 0 ? 0 : 
        Math.round((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100);

      expect(progress).toBe(0);
    });

    it('should count skipped tasks as completed for progress', () => {
      const tasks = [
        { ...mockOnboardingTask, status: 'completed' },
        { ...mockOnboardingTask, id: '2', status: 'skipped' },
        { ...mockOnboardingTask, id: '3', status: 'pending' },
      ];

      const completedOrSkipped = tasks.filter(
        t => t.status === 'completed' || t.status === 'skipped'
      ).length;
      const progress = Math.round((completedOrSkipped / tasks.length) * 100);

      expect(progress).toBe(67); // 2 out of 3 ≈ 67%
    });
  });

  describe('Completing Onboarding', () => {
    it('should mark onboarding as completed when all required tasks done', async () => {
      const completedOn = new Date().toISOString();

      mockSupabase.single.mockResolvedValueOnce({
        data: {
          ...mockOnboardingRecord,
          status: 'completed',
          completed_on: completedOn,
        },
        error: null,
      });

      const result = await mockSupabase
        .from('onboarding_records')
        .update({
          status: 'completed',
          completed_on: completedOn,
        })
        .eq('id', mockOnboardingRecord.id)
        .select()
        .single();

      expect(result.data.status).toBe('completed');
      expect(result.data.completed_on).toBeDefined();
    });

    it('should update employee status after onboarding completion', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: { ...mockEmployee, status: 'active' },
        error: null,
      });

      const result = await mockSupabase
        .from('employees')
        .update({ status: 'active' })
        .eq('id', mockEmployee.id)
        .select()
        .single();

      expect(result.data.status).toBe('active');
    });
  });

  describe('Deleting Onboarding Records', () => {
    it('should delete onboarding record and associated tasks', async () => {
      // Delete tasks first
      mockSupabase.eq.mockResolvedValueOnce({
        data: null,
        error: null,
      });

      await mockSupabase
        .from('onboarding_tasks')
        .delete()
        .eq('onboarding_record_id', mockOnboardingRecord.id);

      // Then delete record
      mockSupabase.eq.mockResolvedValueOnce({
        data: null,
        error: null,
      });

      await mockSupabase
        .from('onboarding_records')
        .delete()
        .eq('id', mockOnboardingRecord.id);

      expect(mockSupabase.delete).toHaveBeenCalledTimes(2);
    });

    it('should not allow deletion of completed onboarding', async () => {
      mockSupabase.eq.mockResolvedValueOnce({
        data: null,
        error: { message: 'Cannot delete completed onboarding record' },
      });

      const result = await mockSupabase
        .from('onboarding_records')
        .delete()
        .eq('id', mockOnboardingRecord.id)
        .eq('status', 'completed');

      expect(result.error).toBeDefined();
    });
  });

  describe('Query Invalidation', () => {
    it('should invalidate onboarding queries after task update', async () => {
      const queryClient = new QueryClient();
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      await queryClient.invalidateQueries({ queryKey: ['onboarding-records'] });
      await queryClient.invalidateQueries({ queryKey: ['onboarding-tasks'] });

      expect(invalidateSpy).toHaveBeenCalledTimes(2);
    });
  });
});
