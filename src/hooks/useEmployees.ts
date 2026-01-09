import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type DbEmployee = Tables<"employees"> & {
  department?: { id: string; name: string } | null;
  position?: { id: string; title: string } | null;
  manager?: { id: string; first_name: string; last_name: string } | { id: string; first_name: string; last_name: string }[] | null;
  work_location?: { id: string; name: string; country: string | null } | null;
};

// UI-compatible Employee interface
export interface Employee {
  id: string;
  firstName: string;
  secondName?: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  avatar: string;
  department: string;
  departmentId?: string;
  position: string;
  positionId?: string;
  status: "active" | "on_leave" | "on_boarding" | "probation" | "terminated";
  joinDate: string;
  employeeId: string;
  manager?: string;
  managerId?: string;
  location?: string;
  workLocationId?: string;
  workLocationName?: string;
  workLocationCountry?: string;
  salary?: number;
  address?: string;
  dateOfBirth?: string;
  gender?: string;
  nationality?: string;
  isSubjectToGosi?: boolean;
  gosiRegisteredSalary?: number;
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  bankName?: string;
  bankAccountNumber?: string;
  iban?: string;
}

// Map database record to UI format
export function mapDbEmployeeToEmployee(db: DbEmployee): Employee {
  const firstName = db.first_name;
  const lastName = db.last_name;
  const secondName = (db as any).second_name || undefined;
  const fullName = (db as any).full_name || `${firstName} ${lastName}`.trim();
  
  return {
    id: db.id,
    firstName,
    secondName,
    lastName,
    fullName,
    email: db.email,
    phone: db.phone || "",
    avatar: db.avatar_url || "",
    department: db.department?.name || "Unknown",
    departmentId: db.department_id || undefined,
    position: db.position?.title || "Unknown",
    positionId: db.position_id || undefined,
    status: db.status as Employee["status"],
    joinDate: db.join_date || new Date().toISOString().split("T")[0],
    employeeId: db.employee_code || db.id.slice(0, 8).toUpperCase(),
    manager: (() => {
      if (!db.manager) return undefined;
      const mgr = Array.isArray(db.manager) ? db.manager[0] : db.manager;
      return mgr ? `${mgr.first_name} ${mgr.last_name}` : undefined;
    })(),
    managerId: db.manager_id || undefined,
    location: db.location || undefined,
    workLocationId: db.work_location_id || undefined,
    workLocationName: db.work_location?.name || undefined,
    workLocationCountry: db.work_location?.country || undefined,
    salary: db.salary ? Number(db.salary) : undefined,
    address: db.address || undefined,
    dateOfBirth: db.date_of_birth || undefined,
    gender: db.gender || undefined,
    nationality: db.nationality || undefined,
    isSubjectToGosi: db.is_subject_to_gosi || false,
    gosiRegisteredSalary: db.gosi_registered_salary ? Number(db.gosi_registered_salary) : undefined,
    emergencyContact:
      db.emergency_contact_name && db.emergency_contact_phone
        ? {
            name: db.emergency_contact_name,
            relationship: db.emergency_contact_relationship || "",
            phone: db.emergency_contact_phone,
          }
        : undefined,
    bankName: (db as any).bank_name || undefined,
    bankAccountNumber: (db as any).bank_account_number || undefined,
    iban: (db as any).iban || undefined,
  };
}

async function fetchEmployees(): Promise<Employee[]> {
  const { data, error } = await supabase
    .from("employees")
    .select(
      `
      *,
      department:departments!employees_department_id_fkey(id, name),
      position:positions!employees_position_id_fkey(id, title),
      manager:employees!manager_id(id, first_name, last_name),
      work_location:work_locations!employees_work_location_id_fkey(id, name, country)
    `
    )
    .order("first_name");

  if (error) {
    console.error("Error fetching employees:", error);
    throw error;
  }

  return (data as DbEmployee[]).map(mapDbEmployeeToEmployee);
}

async function fetchEmployee(id: string): Promise<Employee | null> {
  const { data, error } = await supabase
    .from("employees")
    .select(
      `
      *,
      department:departments!employees_department_id_fkey(id, name),
      position:positions!employees_position_id_fkey(id, title),
      manager:employees!manager_id(id, first_name, last_name),
      work_location:work_locations!employees_work_location_id_fkey(id, name, country)
    `
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Error fetching employee:", error);
    throw error;
  }

  return data ? mapDbEmployeeToEmployee(data as DbEmployee) : null;
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
    queryKey: ["employees"],
    queryFn: fetchEmployees,
  });
}

export function useEmployee(id: string | undefined) {
  return useQuery({
    queryKey: ["employee", id],
    queryFn: () => fetchEmployee(id!),
    enabled: !!id,
  });
}

export function useDepartments() {
  return useQuery({
    queryKey: ["departments"],
    queryFn: fetchDepartments,
  });
}

export function usePositions() {
  return useQuery({
    queryKey: ["positions"],
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
      queryClient.invalidateQueries({ queryKey: ["employees"] });
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
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      queryClient.invalidateQueries({ queryKey: ["employee", variables.id] });
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
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      queryClient.invalidateQueries({ queryKey: ["employee", id] });
    },
  });
}
