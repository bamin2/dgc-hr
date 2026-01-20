import { useQuery } from "@tanstack/react-query";
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
  useCreateEmployeeMutation,
  useUpdateEmployeeMutation,
  useDeleteEmployeeMutation,
} from "./employee";

// Re-export types for backwards compatibility
export type { TeamMember, WorkerType, EmploymentType, PayFrequency, TeamMemberStatus };
export { mapDbToTeamMember };

// Re-export static data from data layer (backwards compatibility)
export { departments, jobTitles, workLocations } from "@/data/organization";
export { offerTemplates } from "@/data/hiring";

// Re-export countries from existing data layer
export { countries } from "@/data/countries";

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

// Re-export shared mutations with legacy names for backwards compatibility
export { useCreateEmployeeMutation as useCreateTeamMember };
export { useUpdateEmployeeMutation as useUpdateTeamMember };
export { useDeleteEmployeeMutation as useDeleteTeamMember };
