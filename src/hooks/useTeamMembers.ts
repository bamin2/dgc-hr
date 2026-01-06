import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Database, Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

// Types from database enums
export type WorkerType = Database["public"]["Enums"]["worker_type"];
export type EmploymentType = Database["public"]["Enums"]["employment_type"];
export type PayFrequency = Database["public"]["Enums"]["pay_frequency"];
export type TeamMemberStatus = 'active' | 'draft' | 'absent' | 'onboarding' | 'offboarding' | 'dismissed';

// UI-compatible TeamMember interface
export interface TeamMember {
  id: string;
  firstName: string;
  lastName: string;
  preferredName?: string;
  email: string;
  avatar?: string;
  workerType: WorkerType;
  country?: string;
  startDate: string;
  department: string;
  departmentId?: string;
  jobTitle: string;
  positionId?: string;
  employmentType: EmploymentType;
  status: TeamMemberStatus;
  managerId?: string;
  managerName?: string;
  workLocation?: string;
  salary?: number;
  payFrequency: PayFrequency;
  taxExemptionStatus?: string;
  sendOfferLetter?: boolean;
  offerLetterTemplate?: string;
}

// Database employee with relations
type DbTeamMember = Tables<"employees"> & {
  department?: { id: string; name: string } | null;
  position?: { id: string; title: string } | null;
  manager?: { id: string; first_name: string; last_name: string } | { id: string; first_name: string; last_name: string }[] | null;
};

// Map employee status to team member status
function mapEmployeeStatusToTeamStatus(status: string): TeamMemberStatus {
  switch (status) {
    case 'active': return 'active';
    case 'on_leave': return 'absent';
    case 'on_boarding': return 'onboarding';
    case 'terminated': return 'dismissed';
    case 'probation': return 'active';
    default: return 'active';
  }
}

// Map database record to UI format
export function mapDbToTeamMember(db: DbTeamMember): TeamMember {
  const manager = Array.isArray(db.manager) ? db.manager[0] : db.manager;
  
  return {
    id: db.id,
    firstName: db.first_name,
    lastName: db.last_name,
    preferredName: db.preferred_name || undefined,
    email: db.email,
    avatar: db.avatar_url || undefined,
    workerType: (db.worker_type as WorkerType) || 'employee',
    country: db.country || undefined,
    startDate: db.join_date || new Date().toISOString().split("T")[0],
    department: db.department?.name || "Unknown",
    departmentId: db.department_id || undefined,
    jobTitle: db.position?.title || "Unknown",
    positionId: db.position_id || undefined,
    employmentType: (db.employment_type as EmploymentType) || 'full_time',
    status: mapEmployeeStatusToTeamStatus(db.status),
    managerId: db.manager_id || undefined,
    managerName: manager ? `${manager.first_name} ${manager.last_name}` : undefined,
    workLocation: db.work_location || db.location || undefined,
    salary: db.salary ? Number(db.salary) : undefined,
    payFrequency: (db.pay_frequency as PayFrequency) || 'month',
    taxExemptionStatus: db.tax_exemption_status || undefined,
    sendOfferLetter: db.send_offer_letter || false,
    offerLetterTemplate: db.offer_letter_template || undefined,
  };
}

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

// Fetch functions
async function fetchTeamMembers(): Promise<TeamMember[]> {
  const { data, error } = await supabase
    .from("employees")
    .select(`
      *,
      department:departments!employees_department_id_fkey(id, name),
      position:positions!employees_position_id_fkey(id, title),
      manager:employees!manager_id(id, first_name, last_name)
    `)
    .order("first_name");

  if (error) {
    console.error("Error fetching team members:", error);
    throw error;
  }

  return (data as DbTeamMember[]).map(mapDbToTeamMember);
}

async function fetchTeamMember(id: string): Promise<TeamMember | null> {
  const { data, error } = await supabase
    .from("employees")
    .select(`
      *,
      department:departments!employees_department_id_fkey(id, name),
      position:positions!employees_position_id_fkey(id, title),
      manager:employees!manager_id(id, first_name, last_name)
    `)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Error fetching team member:", error);
    throw error;
  }

  return data ? mapDbToTeamMember(data as DbTeamMember) : null;
}

// Hooks
export function useTeamMembers() {
  return useQuery({
    queryKey: ["team-members"],
    queryFn: fetchTeamMembers,
  });
}

export function useTeamMember(id: string | undefined) {
  return useQuery({
    queryKey: ["team-member", id],
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
      queryClient.invalidateQueries({ queryKey: ["team-members"] });
      queryClient.invalidateQueries({ queryKey: ["employees"] });
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
      queryClient.invalidateQueries({ queryKey: ["team-members"] });
      queryClient.invalidateQueries({ queryKey: ["team-member", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      queryClient.invalidateQueries({ queryKey: ["employee", variables.id] });
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
      queryClient.invalidateQueries({ queryKey: ["team-members"] });
      queryClient.invalidateQueries({ queryKey: ["team-member", id] });
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      queryClient.invalidateQueries({ queryKey: ["employee", id] });
    },
  });
}
