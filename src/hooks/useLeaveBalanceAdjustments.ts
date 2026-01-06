import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
      queryClient.invalidateQueries({ queryKey: ['leave-balances'] });
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
      // Fetch all leave balances with employee and leave type info
      const { data: balances, error } = await supabase
        .from('leave_balances')
        .select(`
          *,
          employee:employees!leave_balances_employee_id_fkey(
            id, 
            first_name, 
            last_name, 
            avatar_url,
            department:departments(name)
          ),
          leave_type:leave_types!leave_balances_leave_type_id_fkey(id, name, color)
        `)
        .eq('year', year);

      if (error) throw error;

      // Group by employee
      const employeeMap = new Map<string, AllEmployeeBalance>();

      balances?.forEach((balance: any) => {
        const empId = balance.employee?.id;
        if (!empId) return;

        if (!employeeMap.has(empId)) {
          employeeMap.set(empId, {
            employee_id: empId,
            employee_name: `${balance.employee.first_name} ${balance.employee.last_name}`,
            employee_avatar: balance.employee.avatar_url,
            department: balance.employee.department?.name || null,
            balances: [],
          });
        }

        const emp = employeeMap.get(empId)!;
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
