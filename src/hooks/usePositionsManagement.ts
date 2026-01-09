import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { queryKeys } from '@/lib/queryKeys';
import type { Position, PositionInput } from '@/types/organization';

// Re-export types for backward compatibility
export type { Position, PositionInput };

async function fetchPositionsWithCounts(): Promise<Position[]> {
  const { data: positions, error: posError } = await supabase
    .from('positions')
    .select(`
      *,
      departments:department_id (name)
    `)
    .order('title');

  if (posError) throw posError;

  const { data: employees, error: empError } = await supabase
    .from('employees')
    .select('position_id');

  if (empError) throw empError;

  const countMap = new Map<string, number>();
  employees?.forEach(emp => {
    if (emp.position_id) {
      countMap.set(emp.position_id, (countMap.get(emp.position_id) || 0) + 1);
    }
  });

  return (positions || []).map(pos => ({
    id: pos.id,
    title: pos.title,
    department_id: pos.department_id,
    department_name: (pos.departments as { name: string } | null)?.name || null,
    level: pos.level,
    job_description: pos.job_description,
    created_at: pos.created_at,
    employeeCount: countMap.get(pos.id) || 0,
  }));
}

export function usePositionsManagement() {
  return useQuery({
    queryKey: queryKeys.organizations.positions,
    queryFn: fetchPositionsWithCounts,
  });
}

export function useCreatePosition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: PositionInput) => {
      const { data, error } = await supabase
        .from('positions')
        .insert({
          title: input.title,
          department_id: input.department_id || null,
          level: input.level ?? 1,
          job_description: input.job_description || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.organizations.positions });
      queryClient.invalidateQueries({ queryKey: queryKeys.positions.all });
    },
  });
}

export function useUpdatePosition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...input }: PositionInput & { id: string }) => {
      const { data, error } = await supabase
        .from('positions')
        .update({
          title: input.title,
          department_id: input.department_id || null,
          level: input.level ?? 1,
          job_description: input.job_description || null,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.organizations.positions });
      queryClient.invalidateQueries({ queryKey: queryKeys.positions.all });
    },
  });
}

export function useDeletePosition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data: employees, error: checkError } = await supabase
        .from('employees')
        .select('id')
        .eq('position_id', id)
        .limit(1);

      if (checkError) throw checkError;

      if (employees && employees.length > 0) {
        throw new Error('Cannot delete position with assigned employees. Please reassign employees first.');
      }

      const { error } = await supabase
        .from('positions')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.organizations.positions });
      queryClient.invalidateQueries({ queryKey: queryKeys.positions.all });
    },
  });
}
