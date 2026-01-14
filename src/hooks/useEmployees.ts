import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type EmployeeStatus = 'active' | 'inactive' | 'on_leave' | 'terminated';
export type WorkerType = 'employee' | 'contractor';
export type EmploymentType = 'full_time' | 'part_time' | 'contract';
export type PayFrequency = 'week' | 'biweek' | 'month';

export interface Employee {
  id: string;
  employee_code: string | null;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  department_id: string | null;
  position_id: string | null;
  manager_id: string | null;
  status: EmployeeStatus;
  join_date: string | null;
  location: string | null;
  salary: number | null;
  address: string | null;
  date_of_birth: string | null;
  gender: string | null;
  nationality: string | null;
  emergency_contact_name: string | null;
  emergency_contact_relationship: string | null;
  emergency_contact_phone: string | null;
  created_at: string;
  updated_at: string;
  user_id: string | null;
  preferred_name: string | null;
  worker_type: WorkerType | null;
  country: string | null;
  employment_type: EmploymentType | null;
  pay_frequency: PayFrequency | null;
  work_location: string | null;
  work_location_id: string | null;
  tax_exemption_status: string | null;
  send_offer_letter: boolean | null;
  offer_letter_template: string | null;
  import_batch_id: string | null;
  second_name: string | null;
  full_name: string | null;
  gosi_registered_salary: number | null;
  is_subject_to_gosi: boolean | null;
  bank_name: string | null;
  bank_account_number: string | null;
  iban: string | null;
  passport_number: string | null;
  cpr_number: string | null;
  salary_currency_code: string | null;
  department?: { id: string; name: string } | null;
  position?: { id: string; title: string } | null;
  manager?: { id: string; first_name: string; last_name: string; full_name: string } | null;
}

// ORIGINAL: Full employee query (for employee management pages)
export function useEmployees() {
  return useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employees")
        .select(`
          *,
          department:departments!employees_department_id_fkey(id, name),
          position:positions!employees_position_id_fkey(id, title),
          manager:employees!employees_manager_id_fkey(id, first_name, last_name, full_name)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Employee[];
    },
    staleTime: 1000 * 60 * 2, // 2 minutes (database is optimized now!)
  });
}

// NEW: Lightweight version for dropdowns, selects, and references
export function useEmployeesLight() {
  return useQuery({
    queryKey: ["employees", "light"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employees")
        .select("id, first_name, last_name, full_name, avatar_url, employee_code")
        .eq("status", "active")
        .order("full_name");

      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes (dropdown data changes rarely)
  });
}

// NEW: Filtered employee list (for filtered views)
export function useEmployeesList(options?: {
  status?: EmployeeStatus;
  department?: string;
  workLocation?: string;
  limit?: number;
  select?: string;
}) {
  return useQuery({
    queryKey: ["employees", "list", options],
    queryFn: async () => {
      let query = supabase
        .from("employees")
        .select(options?.select || `
          *,
          department:departments!employees_department_id_fkey(id, name),
          position:positions!employees_position_id_fkey(id, title)
        `);

      if (options?.status) {
        query = query.eq("status", options.status);
      }
      if (options?.department) {
        query = query.eq("department_id", options.department);
      }
      if (options?.workLocation) {
        query = query.eq("work_location_id", options.workLocation);
      }
      if (options?.limit) {
        query = query.limit(options.limit);
      }

      query = query.order("full_name");

      const { data, error } = await query;
      if (error) throw error;
      return data as Employee[];
    },
    staleTime: 1000 * 60 * 2,
  });
}

// Single employee query
export function useEmployee(id: string | undefined) {
  return useQuery({
    queryKey: ["employee", id],
    queryFn: async () => {
      if (!id) throw new Error("Employee ID is required");
      
      const { data, error } = await supabase
        .from("employees")
        .select(`
          *,
          department:departments!employees_department_id_fkey(id, name),
          position:positions!employees_position_id_fkey(id, title),
          manager:employees!employees_manager_id_fkey(id, first_name, last_name, full_name)
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as Employee;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 2,
  });
}

// Update employee mutation
export function useUpdateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Employee> }) => {
      const { data, error } = await supabase
        .from("employees")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      queryClient.invalidateQueries({ queryKey: ["employee", data.id] });
      toast.success("Employee updated successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to update employee", {
        description: error.message,
      });
    },
  });
}

// Create employee mutation
export function useCreateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (employee: Partial<Employee>) => {
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
      toast.success("Employee created successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to create employee", {
        description: error.message,
      });
    },
  });
}

// Delete employee mutation
export function useDeleteEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("employees")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast.success("Employee deleted successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to delete employee", {
        description: error.message,
      });
    },
  });
}

// Departments query - for dropdowns/filters
export function useDepartments() {
  return useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("departments")
        .select("id, name")
        .order("name");

      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 5,
  });
}

// Positions query - for dropdowns/filters
export function usePositions() {
  return useQuery({
    queryKey: ["positions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("positions")
        .select("id, title")
        .order("title");

      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 5,
  });
}
