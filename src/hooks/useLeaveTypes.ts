import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Json } from '@/integrations/supabase/types';
import { queryKeys } from '@/lib/queryKeys';

export interface SalaryDeductionTier {
  from_days: number;
  to_days: number;
  deduction_percentage: number;
}

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
  // Salary deduction settings
  has_salary_deduction: boolean | null;
  salary_deduction_tiers: SalaryDeductionTier[] | null;
}

function parseLeaveType(data: any): LeaveType {
  return {
    ...data,
    salary_deduction_tiers: Array.isArray(data.salary_deduction_tiers) 
      ? data.salary_deduction_tiers as SalaryDeductionTier[]
      : [],
  };
}

export function useLeaveTypes() {
  return useQuery({
    queryKey: queryKeys.leave.types,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leave_types')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return (data || []).map(parseLeaveType);
    },
  });
}

export function useAllLeaveTypes() {
  return useQuery({
    queryKey: [...queryKeys.leave.types, 'all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leave_types')
        .select('*')
        .order('name');

      if (error) throw error;
      return (data || []).map(parseLeaveType);
    },
  });
}

export function useCreateLeaveType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (leaveType: Omit<LeaveType, 'id' | 'created_at' | 'updated_at'>) => {
      const payload = {
        ...leaveType,
        salary_deduction_tiers: (leaveType.salary_deduction_tiers || []) as unknown as Json,
      };
      const { data, error } = await supabase
        .from('leave_types')
        .insert([payload])
        .select()
        .single();

      if (error) throw error;
      return parseLeaveType(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leave.types });
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
      const payload = {
        ...updates,
        salary_deduction_tiers: (updates.salary_deduction_tiers || []) as unknown as Json,
      };
      const { data, error } = await supabase
        .from('leave_types')
        .update(payload)
        .eq('id', id)
        .select()
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('Leave type not found or update failed');
      return parseLeaveType(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leave.types });
      toast.success('Leave type updated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to update leave type: ${error.message}`);
    },
  });
}
