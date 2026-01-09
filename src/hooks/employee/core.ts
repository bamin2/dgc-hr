import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

// Shared database employee type with all possible relations
export type DbEmployeeBase = Tables<"employees"> & {
  department?: { id: string; name: string } | null;
  position?: { id: string; title: string } | null;
  manager?: { id: string; first_name: string; last_name: string } | { id: string; first_name: string; last_name: string }[] | null;
  work_location?: { id: string; name: string; country: string | null } | null;
};

// Shared select query for employee relations
export const EMPLOYEE_SELECT_QUERY = `
  *,
  department:departments!employees_department_id_fkey(id, name),
  position:positions!employees_position_id_fkey(id, title),
  manager:employees!manager_id(id, first_name, last_name),
  work_location:work_locations!employees_work_location_id_fkey(id, name, country)
`;

// Minimal select query without work_location
export const EMPLOYEE_SELECT_QUERY_MINIMAL = `
  *,
  department:departments!employees_department_id_fkey(id, name),
  position:positions!employees_position_id_fkey(id, title),
  manager:employees!manager_id(id, first_name, last_name)
`;

// Shared fetch function for all employees
export async function fetchEmployeesBase<T>(
  mapper: (db: DbEmployeeBase) => T,
  selectQuery: string = EMPLOYEE_SELECT_QUERY
): Promise<T[]> {
  const { data, error } = await supabase
    .from("employees")
    .select(selectQuery)
    .order("first_name");

  if (error) {
    console.error("Error fetching employees:", error);
    throw error;
  }

  if (!data) return [];
  
  return (data as unknown as DbEmployeeBase[]).map(mapper);
}

// Shared fetch function for single employee
export async function fetchEmployeeBase<T>(
  id: string,
  mapper: (db: DbEmployeeBase) => T,
  selectQuery: string = EMPLOYEE_SELECT_QUERY
): Promise<T | null> {
  const { data, error } = await supabase
    .from("employees")
    .select(selectQuery)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Error fetching employee:", error);
    throw error;
  }

  return data ? mapper(data as unknown as DbEmployeeBase) : null;
}

// Helper to extract manager name from the nested relation
export function extractManagerName(
  manager: DbEmployeeBase['manager']
): string | undefined {
  if (!manager) return undefined;
  const mgr = Array.isArray(manager) ? manager[0] : manager;
  return mgr ? `${mgr.first_name} ${mgr.last_name}` : undefined;
}
