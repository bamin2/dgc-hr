import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TablesInsert, TablesUpdate } from "@/integrations/supabase/types";
import { queryKeys } from "@/lib/queryKeys";
import { 
  fetchEmployeesBase, 
  fetchEmployeeBase, 
  EMPLOYEE_SELECT_QUERY,
  mapDbEmployeeToEmployee 
} from "./employee";

// Re-export types for backwards compatibility
export type { Employee, DbEmployeeBase as DbEmployee } from "./employee";
export { mapDbEmployeeToEmployee } from "./employee";

// Fetch functions using shared core
async function fetchEmployees() {
  return fetchEmployeesBase(mapDbEmployeeToEmployee, EMPLOYEE_SELECT_QUERY);
}

async function fetchEmployee(id: string) {
  return fetchEmployeeBase(id, mapDbEmployeeToEmployee, EMPLOYEE_SELECT_QUERY);
}

async function fetchDepartments() {
  const { data, error } = await supabase
    .from("departments")
    .select("id, name")
    .order("name");

  if (error) {
    console.error("Error fetching departments:", error);
    throw error;
  }

  return data;
}

async function fetchPositions() {
  const { data, error } = await supabase
    .from("positions")
    .select("id, title, department_id, job_description")
    .order("title");

  if (error) {
    console.error("Error fetching positions:", error);
    throw error;
  }

  return data;
}

export function useEmployees() {
  return useQuery({
    queryKey: queryKeys.employees.all,
    queryFn: fetchEmployees,
  });
}

export function useEmployee(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.employees.detail(id!),
    queryFn: () => fetchEmployee(id!),
    enabled: !!id,
  });
}

export function useDepartments() {
  return useQuery({
    queryKey: queryKeys.departments.all,
    queryFn: fetchDepartments,
  });
}

export function usePositions() {
  return useQuery({
    queryKey: queryKeys.positions.all,
    queryFn: fetchPositions,
  });
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (employee: TablesInsert<"employees">) => {
      const { data, error } = await supabase
        .from("employees")
        .insert(employee)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.teamMembers.all });
    },
  });
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...employee
    }: TablesUpdate<"employees"> & { id: string }) => {
      const { data, error } = await supabase
        .from("employees")
        .update(employee)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.teamMembers.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.teamMembers.detail(variables.id) });
    },
  });
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("employees").delete().eq("id", id);

      if (error) throw error;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.teamMembers.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.teamMembers.detail(id) });
    },
  });
}
