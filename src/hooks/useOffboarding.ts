import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

// Type aliases from database
type OffboardingRecord = Database["public"]["Tables"]["offboarding_records"]["Row"];
type OffboardingRecordInsert = Database["public"]["Tables"]["offboarding_records"]["Insert"];
type ExitInterview = Database["public"]["Tables"]["exit_interviews"]["Row"];
type ExitInterviewInsert = Database["public"]["Tables"]["exit_interviews"]["Insert"];
type OffboardingAsset = Database["public"]["Tables"]["offboarding_assets"]["Row"];
type OffboardingAssetInsert = Database["public"]["Tables"]["offboarding_assets"]["Insert"];
type OffboardingAccessSystem = Database["public"]["Tables"]["offboarding_access_systems"]["Row"];
type OffboardingAccessSystemInsert = Database["public"]["Tables"]["offboarding_access_systems"]["Insert"];

export type OffboardingStatus = Database["public"]["Enums"]["offboarding_status"];
export type DepartureReason = Database["public"]["Enums"]["departure_reason"];
export type NoticePeriodStatus = Database["public"]["Enums"]["notice_period_status"];
export type InterviewFormat = Database["public"]["Enums"]["interview_format"];
export type AssetType = Database["public"]["Enums"]["asset_type"];
export type AssetCondition = Database["public"]["Enums"]["asset_condition"];
export type AccessSystemType = Database["public"]["Enums"]["access_system_type"];
export type AccessStatus = Database["public"]["Enums"]["access_status"];

export type { 
  OffboardingRecord, 
  OffboardingRecordInsert, 
  ExitInterview, 
  ExitInterviewInsert,
  OffboardingAsset,
  OffboardingAssetInsert,
  OffboardingAccessSystem,
  OffboardingAccessSystemInsert 
};

// Extended record with relations
export interface OffboardingRecordWithRelations extends OffboardingRecord {
  employee?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    department?: { name: string } | null;
    position?: { title: string } | null;
  };
  exit_interview?: ExitInterview | null;
  assets?: OffboardingAsset[];
  access_systems?: OffboardingAccessSystem[];
}

// Offboarding Records Hook
export function useOffboardingRecords() {
  return useQuery({
    queryKey: ["offboarding-records"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("offboarding_records")
        .select(`
          *,
          employee:employees!offboarding_records_employee_id_fkey(
            id,
            first_name,
            last_name,
            email,
            department:departments(name),
            position:positions(title)
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as unknown as OffboardingRecordWithRelations[];
    },
  });
}

// Single Offboarding Record Hook
export function useOffboardingRecord(id: string | undefined) {
  return useQuery({
    queryKey: ["offboarding-record", id],
    queryFn: async () => {
      if (!id) return null;

      const { data: record, error: recordError } = await supabase
        .from("offboarding_records")
        .select(`
          *,
          employee:employees!offboarding_records_employee_id_fkey(
            id,
            first_name,
            last_name,
            email,
            department:departments(name),
            position:positions(title)
          )
        `)
        .eq("id", id)
        .single();

      if (recordError) throw recordError;

      // Fetch related data
      const [interviewResult, assetsResult, accessSystemsResult] = await Promise.all([
        supabase.from("exit_interviews").select("*").eq("offboarding_record_id", id).maybeSingle(),
        supabase.from("offboarding_assets").select("*").eq("offboarding_record_id", id).order("created_at"),
        supabase.from("offboarding_access_systems").select("*").eq("offboarding_record_id", id).order("created_at"),
      ]);

      return {
        ...record,
        exit_interview: interviewResult.data,
        assets: assetsResult.data || [],
        access_systems: accessSystemsResult.data || [],
      } as unknown as OffboardingRecordWithRelations;
    },
    enabled: !!id,
  });
}

// Create complete offboarding record with all related data
interface CreateOffboardingData {
  record: Omit<OffboardingRecordInsert, "id" | "created_at" | "updated_at">;
  interview: Omit<ExitInterviewInsert, "id" | "offboarding_record_id" | "created_at" | "updated_at">;
  assets: Omit<OffboardingAssetInsert, "id" | "offboarding_record_id" | "created_at" | "updated_at">[];
  accessSystems: Omit<OffboardingAccessSystemInsert, "id" | "offboarding_record_id" | "created_at" | "updated_at">[];
}

export function useCreateOffboarding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateOffboardingData) => {
      // Create the main offboarding record
      const { data: record, error: recordError } = await supabase
        .from("offboarding_records")
        .insert(data.record)
        .select()
        .single();

      if (recordError) throw recordError;

      // Create exit interview
      const { error: interviewError } = await supabase
        .from("exit_interviews")
        .insert({
          ...data.interview,
          offboarding_record_id: record.id,
        });

      if (interviewError) throw interviewError;

      // Create assets
      if (data.assets.length > 0) {
        const { error: assetsError } = await supabase
          .from("offboarding_assets")
          .insert(
            data.assets.map((asset) => ({
              ...asset,
              offboarding_record_id: record.id,
            }))
          );

        if (assetsError) throw assetsError;
      }

      // Create access systems
      if (data.accessSystems.length > 0) {
        const { error: systemsError } = await supabase
          .from("offboarding_access_systems")
          .insert(
            data.accessSystems.map((system) => ({
              ...system,
              offboarding_record_id: record.id,
            }))
          );

        if (systemsError) throw systemsError;
      }

      return record;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offboarding-records"] });
    },
  });
}

// Update offboarding record
export function useUpdateOffboardingRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<OffboardingRecord> & { id: string }) => {
      const { data, error } = await supabase
        .from("offboarding_records")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["offboarding-records"] });
      queryClient.invalidateQueries({ queryKey: ["offboarding-record", data.id] });
    },
  });
}

// Delete offboarding record
export function useDeleteOffboardingRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("offboarding_records").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offboarding-records"] });
    },
  });
}

// Update exit interview
export function useUpdateExitInterview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ExitInterview> & { id: string }) => {
      const { data, error } = await supabase
        .from("exit_interviews")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["offboarding-records"] });
      queryClient.invalidateQueries({ queryKey: ["offboarding-record"] });
    },
  });
}

// Update asset
export function useUpdateOffboardingAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<OffboardingAsset> & { id: string }) => {
      const { data, error } = await supabase
        .from("offboarding_assets")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offboarding-record"] });
    },
  });
}

// Update access system
export function useUpdateOffboardingAccessSystem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<OffboardingAccessSystem> & { id: string }) => {
      const { data, error } = await supabase
        .from("offboarding_access_systems")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offboarding-record"] });
    },
  });
}

// Default assets for new offboarding
export const defaultOffboardingAssets: Omit<OffboardingAssetInsert, "id" | "offboarding_record_id" | "created_at" | "updated_at">[] = [
  { name: "Laptop", type: "hardware", serial_number: "", condition: "pending", notes: "" },
  { name: "Mobile Phone", type: "hardware", serial_number: "", condition: "pending", notes: "" },
  { name: "Access Card", type: "keycard", serial_number: "", condition: "pending", notes: "" },
  { name: "Parking Pass", type: "keycard", serial_number: "", condition: "pending", notes: "" },
  { name: "Company Credit Card", type: "other", serial_number: "", condition: "pending", notes: "" },
  { name: "Office Keys", type: "other", serial_number: "", condition: "pending", notes: "" },
  { name: "Documents/Files", type: "documents", serial_number: "", condition: "pending", notes: "" },
];

// Default access systems for new offboarding
export const defaultOffboardingAccessSystems: Omit<OffboardingAccessSystemInsert, "id" | "offboarding_record_id" | "created_at" | "updated_at">[] = [
  { name: "Corporate Email", type: "email", access_level: "Standard", revocation_date: null, status: "scheduled" },
  { name: "Google Workspace", type: "cloud", access_level: "Standard", revocation_date: null, status: "scheduled" },
  { name: "Slack", type: "cloud", access_level: "Standard", revocation_date: null, status: "scheduled" },
  { name: "GitHub", type: "cloud", access_level: "Developer", revocation_date: null, status: "scheduled" },
  { name: "AWS Console", type: "cloud", access_level: "Developer", revocation_date: null, status: "scheduled" },
  { name: "CRM (Salesforce)", type: "internal", access_level: "Standard", revocation_date: null, status: "scheduled" },
  { name: "HR Portal", type: "internal", access_level: "Employee", revocation_date: null, status: "scheduled" },
  { name: "VPN Access", type: "internal", access_level: "Standard", revocation_date: null, status: "scheduled" },
  { name: "Building Access", type: "physical", access_level: "Standard", revocation_date: null, status: "scheduled" },
];

// Departure reasons for dropdowns
export const departureReasonOptions: { value: DepartureReason; label: string }[] = [
  { value: "resignation", label: "Resignation" },
  { value: "termination", label: "Termination" },
  { value: "retirement", label: "Retirement" },
  { value: "end_of_contract", label: "End of Contract" },
  { value: "other", label: "Other" },
];

// Notice period statuses for dropdowns
export const noticePeriodStatusOptions: { value: NoticePeriodStatus; label: string }[] = [
  { value: "serving", label: "Serving Notice Period" },
  { value: "waived", label: "Notice Period Waived" },
  { value: "garden_leave", label: "Garden Leave" },
];

// Interview formats for dropdowns
export const interviewFormatOptions: { value: InterviewFormat; label: string; description: string }[] = [
  { value: "in_person", label: "In-person", description: "Face-to-face meeting at the office" },
  { value: "video", label: "Video Call", description: "Remote meeting via video conferencing" },
  { value: "written", label: "Written Questionnaire", description: "Employee completes a form independently" },
];

// Asset conditions for dropdowns
export const assetConditionOptions: { value: AssetCondition; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "good", label: "Returned (Good)" },
  { value: "damaged", label: "Returned (Damaged)" },
  { value: "missing", label: "Missing" },
];
