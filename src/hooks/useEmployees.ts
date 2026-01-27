import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { queryKeys } from "@/lib/queryKeys";
import { queryPresets } from "@/lib/queryOptions";
import { 
  fetchEmployeesBase, 
  fetchEmployeeBase, 
  EMPLOYEE_SELECT_QUERY,
  mapDbEmployeeToEmployee,
  useCreateEmployeeMutation,
  useUpdateEmployeeMutation,
  useDeleteEmployeeMutation,
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
    placeholderData: keepPreviousData,  // Prevent blank state on filter changes
    ...queryPresets.userData,
  });
}

export function useEmployee(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.employees.detail(id || 'none'),
    queryFn: () => fetchEmployee(id!),
    enabled: !!id && id.length > 0,
  });
}

export function useDepartments() {
  return useQuery({
    queryKey: queryKeys.departments.all,
    queryFn: fetchDepartments,
    ...queryPresets.referenceData,  // Departments rarely change
  });
}

export function usePositions() {
  return useQuery({
    queryKey: queryKeys.positions.all,
    queryFn: fetchPositions,
    ...queryPresets.referenceData,  // Positions rarely change
  });
}

// Re-export shared mutations with legacy names for backwards compatibility
export { useCreateEmployeeMutation as useCreateEmployee };
export { useUpdateEmployeeMutation as useUpdateEmployee };
export { useDeleteEmployeeMutation as useDeleteEmployee };
