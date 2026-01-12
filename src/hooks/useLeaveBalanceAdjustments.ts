import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { queryKeys } from '@/lib/queryKeys';

export interface LeaveBalanceAdjustment {
  id: string;
  leave_balance_id: string;
  employee_id: string;
  leave_type_id: string;
  adjustment_days: number;
  adjustment_type: 'manual' | 'carryover' | 'expiry' | 'correction';
  reason: string | null;
  adjusted_by: string | null;
  created_at: string;
  // Joined fields
  employee?: {
    id: string;
    first_name: string;
    last_name: string;
    avatar_url: string | null;
  };
  leave_type?: {
    id: string;
    name: string;
    color: string | null;
  };
  adjuster?: {
    id: string;
    first_name: string | null;
    last_name: string | null;
  };
}

export interface CreateAdjustmentInput {
  leave_balance_id: string;
  employee_id: string;
  leave_type_id: string;
  adjustment_days: number;
  adjustment_type: 'manual' | 'carryover' | 'expiry' | 'correction';
  reason?: string;
}

export function useLeaveBalanceAdjustments(employeeId?: string) {
  return useQuery({
    queryKey: ['leave-balance-adjustments', employeeId],
    queryFn: async () => {
      let query = supabase
        .from('leave_balance_adjustments')
        .select(`
          *,
          employee:employees!leave_balance_adjustments_employee_id_fkey(id, first_name, last_name, avatar_url),
          leave_type:leave_types!leave_balance_adjustments_leave_type_id_fkey(id, name, color),
          adjuster:profiles!leave_balance_adjustments_adjusted_by_fkey(id, first_name, last_name)
        `)
        .order('created_at', { ascending: false });

      if (employeeId) {
        query = query.eq('employee_id', employeeId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as LeaveBalanceAdjustment[];
    },
  });
}

export function useCreateLeaveBalanceAdjustment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateAdjustmentInput) => {
      // Get current user ID
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('leave_balance_adjustments')
        .insert([{
          ...input,
          adjusted_by: user?.id,
        }])
        .select()
        .single();

      if (error) throw error;

      // Update the leave_balance total_days
      const { data: currentBalance } = await supabase
        .from('leave_balances')
        .select('total_days')
        .eq('id', input.leave_balance_id)
        .single();

      if (currentBalance) {
        await supabase
          .from('leave_balances')
          .update({
            total_days: (currentBalance.total_days || 0) + input.adjustment_days,
          })
          .eq('id', input.leave_balance_id);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-balance-adjustments'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.leave.balances.all });
      queryClient.invalidateQueries({ queryKey: ['all-employee-balances'] });
      toast.success('Balance adjustment created successfully');
    },
    onError: (error) => {
      toast.error(`Failed to create adjustment: ${error.message}`);
    },
  });
}

export interface AllEmployeeBalance {
  employee_id: string;
  employee_name: string;
  employee_avatar: string | null;
  department: string | null;
  balances: {
    leave_type_id: string;
    leave_type_name: string;
    leave_type_color: string | null;
    balance_id: string;
    total_days: number;
    used_days: number;
    pending_days: number;
    remaining_days: number;
  }[];
}

export function useAllEmployeeBalances(year: number = new Date().getFullYear()) {
  return useQuery({
    queryKey: ['all-employee-balances', year],
    queryFn: async () => {
      // First fetch all employees
      const { data: employees, error: empError } = await supabase
        .from('employees')
        .select(`
          id,
          first_name,
          last_name,
          avatar_url,
          department:departments!employees_department_id_fkey(name)
        `)
        .eq('status', 'active');

      if (empError) throw empError;

      // Then fetch leave balances for the year
      const { data: balances, error } = await supabase
        .from('leave_balances')
        .select(`
          *,
          leave_type:leave_types!leave_balances_leave_type_id_fkey(id, name, color)
        `)
        .eq('year', year);

      if (error) throw error;

      // Build employee map from employees list first
      const employeeMap = new Map<string, AllEmployeeBalance>();

      employees?.forEach((emp: any) => {
        employeeMap.set(emp.id, {
          employee_id: emp.id,
          employee_name: `${emp.first_name} ${emp.last_name}`,
          employee_avatar: emp.avatar_url,
          department: emp.department?.name || null,
          balances: [],
        });
      });

      // Add balances to their respective employees
      balances?.forEach((balance: any) => {
        const emp = employeeMap.get(balance.employee_id);
        if (!emp) return;

        emp.balances.push({
          leave_type_id: balance.leave_type?.id,
          leave_type_name: balance.leave_type?.name || 'Unknown',
          leave_type_color: balance.leave_type?.color,
          balance_id: balance.id,
          total_days: balance.total_days || 0,
          used_days: balance.used_days || 0,
          pending_days: balance.pending_days || 0,
          remaining_days: (balance.total_days || 0) - (balance.used_days || 0) - (balance.pending_days || 0),
        });
      });

      return Array.from(employeeMap.values());
    },
  });
}

export interface CreateLeaveBalanceInput {
  employee_id: string;
  leave_type_id: string;
  year: number;
  total_days: number;
}

export function useCreateLeaveBalance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateLeaveBalanceInput) => {
      const { data, error } = await supabase
        .from('leave_balances')
        .insert([{
          employee_id: input.employee_id,
          leave_type_id: input.leave_type_id,
          year: input.year,
          total_days: input.total_days,
          used_days: 0,
          pending_days: 0,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-employee-balances'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.leave.balances.all });
      toast.success('Leave balance assigned successfully');
    },
    onError: (error) => {
      toast.error(`Failed to assign balance: ${error.message}`);
    },
  });
}

export interface BulkInitializeResult {
  created: number;
  skipped: number;
}

export function useBulkInitializeBalances() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ year }: { year: number }): Promise<BulkInitializeResult> => {
      // Fetch all active employees
      const { data: employees, error: empError } = await supabase
        .from('employees')
        .select('id')
        .eq('status', 'active');

      if (empError) throw empError;

      // Fetch all active leave types (including those without max_days_per_year)
      const { data: leaveTypes, error: ltError } = await supabase
        .from('leave_types')
        .select('id, max_days_per_year')
        .eq('is_active', true);

      if (ltError) throw ltError;

      // Fetch existing balances for this year
      const { data: existingBalances, error: balError } = await supabase
        .from('leave_balances')
        .select('employee_id, leave_type_id')
        .eq('year', year);

      if (balError) throw balError;

      // Create a set of existing balance keys
      const existingSet = new Set(
        existingBalances?.map(b => `${b.employee_id}-${b.leave_type_id}`) || []
      );

      // Build list of balances to create
      const toCreate: {
        employee_id: string;
        leave_type_id: string;
        year: number;
        total_days: number;
        used_days: number;
        pending_days: number;
      }[] = [];

      for (const emp of employees || []) {
        for (const lt of leaveTypes || []) {
          const key = `${emp.id}-${lt.id}`;
          if (!existingSet.has(key)) {
            toCreate.push({
              employee_id: emp.id,
              leave_type_id: lt.id,
              year,
              total_days: lt.max_days_per_year || 0, // Use 0 for leave types without max_days_per_year
              used_days: 0,
              pending_days: 0,
            });
          }
        }
      }

      if (toCreate.length > 0) {
        const { error: insertError } = await supabase
          .from('leave_balances')
          .insert(toCreate);

        if (insertError) throw insertError;
      }

      const totalPossible = (employees?.length || 0) * (leaveTypes?.length || 0);
      return {
        created: toCreate.length,
        skipped: totalPossible - toCreate.length,
      };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['all-employee-balances'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.leave.balances.all });
      toast.success(`Initialized ${result.created} leave balances`);
    },
    onError: (error) => {
      toast.error(`Failed to initialize balances: ${error.message}`);
    },
  });
}