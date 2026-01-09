import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TablesUpdate } from "@/integrations/supabase/types";
import { queryKeys } from "@/lib/queryKeys";
import { 
  fetchEmployeesBase, 
  fetchEmployeeBase, 
  EMPLOYEE_SELECT_QUERY,
  mapDbToTeamMember,
  TeamMember,
  WorkerType,
  EmploymentType,
  PayFrequency,
  TeamMemberStatus,
} from "./employee";

// Re-export types for backwards compatibility
export type { TeamMember, WorkerType, EmploymentType, PayFrequency, TeamMemberStatus };
export { mapDbToTeamMember };

// Static data exports (replaces team.ts)
export const departments = [
  'Engineering',
  'Design',
  'Marketing',
  'Sales',
  'Human Resources',
  'Finance',
  'Operations',
  'Customer Support',
];

export const jobTitles = [
  'Software Engineer',
  'Senior Software Engineer',
  'Product Designer',
  'UX Designer',
  'Marketing Manager',
  'Sales Representative',
  'HR Coordinator',
  'Financial Analyst',
  'Operations Manager',
  'Customer Support Specialist',
];

export const workLocations = [
  'Remote',
  'New York Office',
  'San Francisco Office',
  'London Office',
  'Singapore Office',
];

export const countries = [
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵' },
];

export const offerTemplates = [
  { id: 'standard', name: 'Standard Offer Letter' },
  { id: 'executive', name: 'Executive Offer Letter' },
  { id: 'contractor', name: 'Contractor Agreement' },
  { id: 'internship', name: 'Internship Offer' },
];

// Fetch functions using shared core
async function fetchTeamMembers(): Promise<TeamMember[]> {
  return fetchEmployeesBase(mapDbToTeamMember, EMPLOYEE_SELECT_QUERY);
}

async function fetchTeamMember(id: string): Promise<TeamMember | null> {
  return fetchEmployeeBase(id, mapDbToTeamMember, EMPLOYEE_SELECT_QUERY);
}

// Hooks
export function useTeamMembers() {
  return useQuery({
    queryKey: queryKeys.teamMembers.all,
    queryFn: fetchTeamMembers,
  });
}

export function useTeamMember(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.teamMembers.detail(id!),
    queryFn: () => fetchTeamMember(id!),
    enabled: !!id,
  });
}

export function useCreateTeamMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      first_name: string;
      last_name: string;
      email: string;
      preferred_name?: string;
      worker_type?: WorkerType;
      country?: string;
      join_date?: string;
      department_id?: string;
      position_id?: string;
      employment_type?: EmploymentType;
      manager_id?: string;
      work_location?: string;
      salary?: number;
      pay_frequency?: PayFrequency;
      tax_exemption_status?: string;
      send_offer_letter?: boolean;
      offer_letter_template?: string;
    }) => {
      const { data: result, error } = await supabase
        .from("employees")
        .insert({
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          preferred_name: data.preferred_name,
          worker_type: data.worker_type || 'employee',
          country: data.country,
          join_date: data.join_date,
          department_id: data.department_id,
          position_id: data.position_id,
          employment_type: data.employment_type || 'full_time',
          manager_id: data.manager_id,
          work_location: data.work_location,
          salary: data.salary,
          pay_frequency: data.pay_frequency || 'month',
          tax_exemption_status: data.tax_exemption_status,
          send_offer_letter: data.send_offer_letter,
          offer_letter_template: data.offer_letter_template,
          status: 'on_boarding',
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teamMembers.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.all });
    },
  });
}

export function useUpdateTeamMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: TablesUpdate<"employees"> & { id: string }) => {
      const { data: result, error } = await supabase
        .from("employees")
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teamMembers.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.teamMembers.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.detail(variables.id) });
    },
  });
}

export function useDeleteTeamMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("employees")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teamMembers.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.teamMembers.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.detail(id) });
    },
  });
}
