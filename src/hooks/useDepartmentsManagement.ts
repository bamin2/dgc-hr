import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Department {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  employeeCount: number;
}

interface DepartmentInput {
  name: string;
  description?: string | null;
}

async function fetchDepartmentsWithCounts(): Promise<Department[]> {
  const { data: departments, error: deptError } = await supabase
    .from('departments')
    .select('*')
    .order('name');

  if (deptError) throw deptError;

  // Get employee counts per department
  const { data: employees, error: empError } = await supabase
    .from('employees')
    .select('department_id');

  if (empError) throw empError;

  const countMap = new Map<string, number>();
  employees?.forEach(emp => {
    if (emp.department_id) {
      countMap.set(emp.department_id, (countMap.get(emp.department_id) || 0) + 1);
    }
  });

  return (departments || []).map(dept => ({
    ...dept,
    employeeCount: countMap.get(dept.id) || 0,
  }));
}

export function useDepartmentsManagement() {
  return useQuery({
    queryKey: ['departments-management'],
    queryFn: fetchDepartmentsWithCounts,
  });
}

export function useCreateDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: DepartmentInput) => {
      const { data, error } = await supabase
        .from('departments')
        .insert({ name: input.name, description: input.description })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments-management'] });
      queryClient.invalidateQueries({ queryKey: ['departments'] });
    },
  });
}

export function useUpdateDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...input }: DepartmentInput & { id: string }) => {
      const { data, error } = await supabase
        .from('departments')
        .update({ name: input.name, description: input.description })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments-management'] });
      queryClient.invalidateQueries({ queryKey: ['departments'] });
    },
  });
}

export function useDeleteDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // Check if any employees are assigned to this department
      const { data: employees, error: checkError } = await supabase
        .from('employees')
        .select('id')
        .eq('department_id', id)
        .limit(1);

      if (checkError) throw checkError;

      if (employees && employees.length > 0) {
        throw new Error('Cannot delete department with assigned employees. Please reassign employees first.');
      }

      const { error } = await supabase
        .from('departments')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments-management'] });
      queryClient.invalidateQueries({ queryKey: ['departments'] });
    },
  });
}
