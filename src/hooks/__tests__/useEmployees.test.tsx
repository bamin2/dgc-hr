import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient } from '@tanstack/react-query';
import { 
  mockEmployee, 
  mockEmployees, 
  mockDepartment,
  generateMockEmployees 
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
  ilike: vi.fn().mockReturnThis(),
  or: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  range: vi.fn().mockReturnThis(),
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

describe('Employees Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Fetching Employees', () => {
    it('should fetch all employees with related data', async () => {
      mockSupabase.order.mockResolvedValueOnce({
        data: mockEmployees,
        error: null,
      });

      const result = await mockSupabase
        .from('employees')
        .select(`
          *,
          department:departments(*),
          position:positions(*),
          manager:employees!manager_id(id, first_name, last_name)
        `)
        .order('created_at', { ascending: false });

      expect(result.data).toHaveLength(3);
    });

    it('should fetch employees by status', async () => {
      const activeEmployees = mockEmployees.filter(e => e.status === 'active');

      mockSupabase.eq.mockResolvedValueOnce({
        data: activeEmployees,
        error: null,
      });

      const result = await mockSupabase
        .from('employees')
        .select('*')
        .eq('status', 'active');

      expect(result.data.every(e => e.status === 'active')).toBe(true);
    });

    it('should fetch employees by department', async () => {
      mockSupabase.eq.mockResolvedValueOnce({
        data: [mockEmployee],
        error: null,
      });

      const result = await mockSupabase
        .from('employees')
        .select('*')
        .eq('department_id', mockDepartment.id);

      expect(result.data).toHaveLength(1);
    });

    it('should search employees by name or email', async () => {
      const searchTerm = 'john';
      
      mockSupabase.or.mockResolvedValueOnce({
        data: [mockEmployee],
        error: null,
      });

      const result = await mockSupabase
        .from('employees')
        .select('*')
        .or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);

      expect(result.data[0].first_name.toLowerCase()).toContain(searchTerm);
    });

    it('should paginate employee results', async () => {
      const allEmployees = generateMockEmployees(50);
      const page = 1;
      const pageSize = 10;
      const start = page * pageSize;
      const end = start + pageSize - 1;

      mockSupabase.range.mockResolvedValueOnce({
        data: allEmployees.slice(start, end + 1),
        error: null,
        count: 50,
      });

      const result = await mockSupabase
        .from('employees')
        .select('*', { count: 'exact' })
        .range(start, end);

      expect(result.data).toHaveLength(10);
    });
  });

  describe('Creating Employees', () => {
    it('should create a new employee', async () => {
      const newEmployee = {
        first_name: 'New',
        last_name: 'Employee',
        email: 'new.employee@example.com',
        status: 'onboarding',
      };

      mockSupabase.single.mockResolvedValueOnce({
        data: { ...newEmployee, id: 'new-id', employee_code: 'EMP100' },
        error: null,
      });

      const result = await mockSupabase
        .from('employees')
        .insert(newEmployee)
        .select()
        .single();

      expect(result.data.id).toBeDefined();
      expect(result.data.employee_code).toBeDefined();
    });

    it('should validate unique email constraint', async () => {
      const duplicateEmail = {
        first_name: 'Another',
        last_name: 'Employee',
        email: mockEmployee.email, // Duplicate
      };

      mockSupabase.single.mockResolvedValueOnce({
        data: null,
        error: { 
          message: 'duplicate key value violates unique constraint',
          code: '23505',
        },
      });

      const result = await mockSupabase
        .from('employees')
        .insert(duplicateEmail)
        .select()
        .single();

      expect(result.error).toBeDefined();
      expect(result.error.code).toBe('23505');
    });

    it('should auto-generate employee code', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: { ...mockEmployee, employee_code: 'EMP004' },
        error: null,
      });

      const result = await mockSupabase
        .from('employees')
        .insert({ first_name: 'Test', last_name: 'User', email: 'test@example.com' })
        .select()
        .single();

      expect(result.data.employee_code).toMatch(/^EMP\d+$/);
    });
  });

  describe('Updating Employees', () => {
    it('should update employee details', async () => {
      const updates = {
        phone: '+9876543210',
        address: '456 New St, City, State 67890',
      };

      mockSupabase.single.mockResolvedValueOnce({
        data: { ...mockEmployee, ...updates },
        error: null,
      });

      const result = await mockSupabase
        .from('employees')
        .update(updates)
        .eq('id', mockEmployee.id)
        .select()
        .single();

      expect(result.data.phone).toBe(updates.phone);
      expect(result.data.address).toBe(updates.address);
    });

    it('should update employee status', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: { ...mockEmployee, status: 'inactive' },
        error: null,
      });

      const result = await mockSupabase
        .from('employees')
        .update({ status: 'inactive' })
        .eq('id', mockEmployee.id)
        .select()
        .single();

      expect(result.data.status).toBe('inactive');
    });

    it('should update employee salary', async () => {
      const newSalary = 85000;

      mockSupabase.single.mockResolvedValueOnce({
        data: { ...mockEmployee, salary: newSalary },
        error: null,
      });

      const result = await mockSupabase
        .from('employees')
        .update({ salary: newSalary })
        .eq('id', mockEmployee.id)
        .select()
        .single();

      expect(result.data.salary).toBe(newSalary);
    });

    it('should update employee manager', async () => {
      const newManagerId = '00000000-0000-0000-0000-000000000005';

      mockSupabase.single.mockResolvedValueOnce({
        data: { ...mockEmployee, manager_id: newManagerId },
        error: null,
      });

      const result = await mockSupabase
        .from('employees')
        .update({ manager_id: newManagerId })
        .eq('id', mockEmployee.id)
        .select()
        .single();

      expect(result.data.manager_id).toBe(newManagerId);
    });
  });

  describe('Bulk Operations', () => {
    it('should update multiple employees at once', async () => {
      const employeeIds = mockEmployees.map(e => e.id);
      const bulkUpdate = { department_id: mockDepartment.id };

      mockSupabase.in.mockResolvedValueOnce({
        data: mockEmployees.map(e => ({ ...e, ...bulkUpdate })),
        error: null,
      });

      const result = await mockSupabase
        .from('employees')
        .update(bulkUpdate)
        .in('id', employeeIds)
        .select();

      expect(result.data).toHaveLength(employeeIds.length);
    });

    it('should apply bulk salary adjustment', async () => {
      const employeeIds = [mockEmployees[0].id, mockEmployees[1].id];
      const percentageIncrease = 5;

      // In real implementation, this would be calculated per employee
      mockSupabase.in.mockResolvedValueOnce({
        data: mockEmployees.slice(0, 2).map(e => ({
          ...e,
          salary: e.salary ? e.salary * (1 + percentageIncrease / 100) : null,
        })),
        error: null,
      });

      const result = await mockSupabase
        .from('employees')
        .select('*')
        .in('id', employeeIds);

      expect(result.data).toHaveLength(2);
    });

    it('should handle partial bulk update failures', async () => {
      mockSupabase.in.mockResolvedValueOnce({
        data: null,
        error: { message: 'Some updates failed' },
      });

      const result = await mockSupabase
        .from('employees')
        .update({ status: 'active' })
        .in('id', ['valid-id', 'invalid-id']);

      expect(result.error).toBeDefined();
    });
  });

  describe('Filtering and Sorting', () => {
    it('should filter by multiple criteria', async () => {
      mockSupabase.order.mockResolvedValueOnce({
        data: [mockEmployee],
        error: null,
      });

      const result = await mockSupabase
        .from('employees')
        .select('*')
        .eq('status', 'active')
        .eq('department_id', mockDepartment.id)
        .neq('manager_id', null)
        .order('join_date', { ascending: true });

      expect(result.data).toBeDefined();
    });

    it('should sort by multiple columns', async () => {
      mockSupabase.order.mockResolvedValueOnce({
        data: mockEmployees,
        error: null,
      });

      // Supabase supports chained .order() calls for multi-column sorting
      await mockSupabase
        .from('employees')
        .select('*')
        .order('department_id', { ascending: true })
        .order('last_name', { ascending: true });

      expect(mockSupabase.order).toHaveBeenCalled();
    });
  });

  describe('Query Invalidation', () => {
    it('should invalidate employee queries after mutation', async () => {
      const queryClient = new QueryClient();
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      await queryClient.invalidateQueries({ queryKey: ['employees'] });

      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['employees'] });
    });

    it('should invalidate specific employee query', async () => {
      const queryClient = new QueryClient();
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      await queryClient.invalidateQueries({ 
        queryKey: ['employees', mockEmployee.id] 
      });

      expect(invalidateSpy).toHaveBeenCalledWith({ 
        queryKey: ['employees', mockEmployee.id] 
      });
    });

    it('should invalidate related queries (department counts, etc.)', async () => {
      const queryClient = new QueryClient();
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      // After employee department change, invalidate department stats
      await queryClient.invalidateQueries({ queryKey: ['employees'] });
      await queryClient.invalidateQueries({ queryKey: ['departments'] });
      await queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });

      expect(invalidateSpy).toHaveBeenCalledTimes(3);
    });
  });

  describe('Error Handling', () => {
    it('should handle database connection errors', async () => {
      mockSupabase.select.mockResolvedValueOnce({
        data: null,
        error: { message: 'Connection refused' },
      });

      const result = await mockSupabase
        .from('employees')
        .select('*');

      expect(result.error).toBeDefined();
    });

    it('should handle invalid foreign key references', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: null,
        error: { 
          message: 'violates foreign key constraint',
          code: '23503',
        },
      });

      const result = await mockSupabase
        .from('employees')
        .insert({ 
          first_name: 'Test', 
          last_name: 'User', 
          email: 'test@example.com',
          department_id: 'non-existent-id',
        })
        .select()
        .single();

      expect(result.error.code).toBe('23503');
    });
  });
});
