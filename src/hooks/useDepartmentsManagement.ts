import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { queryKeys } from '@/lib/queryKeys';

interface Department {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  manager_id: string | null;
  manager_name: string | null;
  manager_avatar: string | null;
  employeeCount: number;
}

interface DepartmentInput {
  name: string;
  description?: string | null;
  manager_id?: string | null;
}

async function fetchDepartmentsWithCounts(): Promise<Department[]> {
  const { data: departments, error: deptError } = await supabase
    .from('departments')
    .select(`
      *,
      manager:manager_id (
        id,
        first_name,
        last_name,
        avatar_url
      )
    `)
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

  return (departments || []).map(dept => {
    const manager = dept.manager as { id: string; first_name: string; last_name: string; avatar_url: string | null } | null;
    return {
      id: dept.id,
      name: dept.name,
      description: dept.description,
      created_at: dept.created_at,
      manager_id: dept.manager_id,
      manager_name: manager ? `${manager.first_name} ${manager.last_name}` : null,
      manager_avatar: manager?.avatar_url || null,
      employeeCount: countMap.get(dept.id) || 0,
    };
  });
}

export function useDepartmentsManagement() {
  return useQuery({
    queryKey: queryKeys.organizations.departments,
    queryFn: fetchDepartmentsWithCounts,
  });
}

export function useCreateDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: DepartmentInput) => {
      const { data, error } = await supabase
        .from('departments')
        .insert({ 
          name: input.name, 
          description: input.description,
          manager_id: input.manager_id || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.organizations.departments });
      queryClient.invalidateQueries({ queryKey: queryKeys.departments.all });
    },
  });
}

export function useUpdateDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...input }: DepartmentInput & { id: string }) => {
      const { data, error } = await supabase
        .from('departments')
        .update({ 
          name: input.name, 
          description: input.description,
          manager_id: input.manager_id || null,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.organizations.departments });
      queryClient.invalidateQueries({ queryKey: queryKeys.departments.all });
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
      queryClient.invalidateQueries({ queryKey: queryKeys.organizations.departments });
      queryClient.invalidateQueries({ queryKey: queryKeys.departments.all });
    },
  });
}
