import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type OfferStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired' | 'archived';
export type OfferVersionStatus = 'draft' | 'sent' | 'superseded' | 'accepted' | 'rejected' | 'expired';

export interface OfferVersion {
  id: string;
  offer_id: string;
  version_number: number;
  status: OfferVersionStatus;
  effective_date: string | null;
  sent_at: string | null;
  superseded_at: string | null;
  accepted_at: string | null;
  rejected_at: string | null;
  remarks_internal: string | null;
  change_reason: string | null;
  work_location_id: string | null;
  department_id: string | null;
  position_id: string | null;
  manager_employee_id: string | null;
  start_date: string | null;
  offer_expiry_date: string | null;
  currency_code: string;
  basic_salary: number;
  housing_allowance: number;
  transport_allowance: number;
  other_allowances: number;
  deductions_fixed: number;
  gross_pay_total: number;
  deductions_total: number;
  net_pay_estimate: number;
  employer_gosi_amount: number;
  is_subject_to_gosi: boolean;
  gosi_employee_amount: number;
  other_deductions: number;
  template_id: string | null;
  created_by: string | null;
  created_at: string;
  // Joined data
  work_location?: { id: string; name: string } | null;
  department?: { id: string; name: string } | null;
  position?: { id: string; title: string; job_description?: string | null } | null;
  manager?: { id: string; first_name: string; last_name: string } | null;
  template?: { id: string; template_name: string } | null;
}

export interface Offer {
  id: string;
  offer_code: string;
  candidate_id: string;
  status: OfferStatus;
  current_version_id: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  candidate?: {
    id: string;
    candidate_code: string;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string | null;
    nationality?: string | null;
  } | null;
  current_version?: OfferVersion | null;
  versions?: OfferVersion[];
}

export interface OfferVersionFormData {
  work_location_id?: string;
  department_id?: string;
  position_id?: string;
  manager_employee_id?: string;
  start_date?: string;
  offer_expiry_date?: string | null;
  currency_code?: string;
  basic_salary?: number;
  housing_allowance?: number;
  transport_allowance?: number;
  other_allowances?: number;
  deductions_fixed?: number;
  deductions_total?: number;
  employer_gosi_amount?: number;
  is_subject_to_gosi?: boolean;
  gosi_employee_amount?: number;
  other_deductions?: number;
  template_id?: string;
  remarks_internal?: string;
  change_reason?: string;
  // Note: gross_pay_total and net_pay_estimate are GENERATED columns and should NOT be included in updates
}

export interface Candidate {
  id: string;
  candidate_code: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string | null;
  nationality?: string | null;
}

interface OfferFilters {
  status?: OfferStatus | 'all';
  candidateId?: string;
  search?: string;
}

export function useOffers(filters?: OfferFilters) {
  return useQuery({
    queryKey: ["offers", filters],
    queryFn: async () => {
      let query = supabase
        .from("offers")
        .select(`
          *,
          candidate:candidates(id, candidate_code, first_name, last_name, email),
          current_version:offer_versions!offers_current_version_id_fkey(
            id, version_number, status, gross_pay_total, currency_code, sent_at, accepted_at
          )
        `)
        .order("created_at", { ascending: false });

      if (filters?.status && filters.status !== 'all') {
        query = query.eq("status", filters.status);
      }
      if (filters?.candidateId) {
        query = query.eq("candidate_id", filters.candidateId);
      }
      if (filters?.search) {
        query = query.or(`offer_code.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Offer[];
    },
  });
}

export function useOffer(id: string | undefined) {
  return useQuery({
    queryKey: ["offer", id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from("offers")
        .select(`
          *,
          candidate:candidates(id, candidate_code, first_name, last_name, email, phone, nationality),
          current_version:offer_versions!offers_current_version_id_fkey(
            *,
            work_location:work_locations(id, name),
            department:departments(id, name),
            position:positions(id, title, job_description),
            manager:employees!offer_versions_manager_employee_id_fkey(id, first_name, last_name),
            template:offer_letter_templates(id, template_name)
          ),
          versions:offer_versions!offer_versions_offer_id_fkey(
            *,
            work_location:work_locations(id, name),
            department:departments(id, name),
            position:positions(id, title, job_description),
            manager:employees!offer_versions_manager_employee_id_fkey(id, first_name, last_name),
            template:offer_letter_templates(id, template_name)
          )
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      
      // Sort versions by version_number descending
      const result = data as unknown as Offer;
      if (result?.versions && Array.isArray(result.versions)) {
        result.versions.sort((a: OfferVersion, b: OfferVersion) => b.version_number - a.version_number);
      }
      
      return result;
    },
    enabled: !!id,
  });
}

export interface AllowanceEntryData {
  id: string;
  templateId?: string;
  customName?: string;
  amount: number;
  isCustom: boolean;
  isPercentage?: boolean;
  percentageOf?: string;
}

export interface DeductionEntryData {
  id: string;
  templateId?: string;
  customName?: string;
  amount: number;
  isCustom: boolean;
  isPercentage?: boolean;
  percentageOf?: string;
}

export interface CreateOfferData {
  candidateId: string;
  work_location_id: string;
  department_id: string;
  position_id: string;
  manager_employee_id?: string;
  start_date: string;
  currency_code: string;
  basic_salary: number;
  housing_allowance: number;
  transport_allowance: number;
  other_allowances: number;
  deductions_fixed: number;
  is_subject_to_gosi?: boolean;
  gosi_employee_amount?: number;
  gosi_employer_amount?: number;
  allowances?: AllowanceEntryData[];
  deductions?: DeductionEntryData[];
}

export function useCreateOfferWithDetails() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateOfferData) => {
      // Calculate totals
      const grossTotal = data.basic_salary + data.housing_allowance + 
        data.transport_allowance + data.other_allowances;
      
      // Use provided GOSI amounts or fallback to default calculation
      const gosiEmployeeAmount = data.gosi_employee_amount ?? (data.is_subject_to_gosi ? data.basic_salary * 0.0975 : 0);
      const gosiEmployerAmount = data.gosi_employer_amount ?? (data.is_subject_to_gosi ? data.basic_salary * 0.1175 : 0);
      
      const deductionsTotal = data.deductions_fixed + gosiEmployeeAmount;
      const netPayEstimate = grossTotal - deductionsTotal;

      // Create offer
      const { data: offer, error: offerError } = await supabase
        .from("offers")
        .insert({
          candidate_id: data.candidateId,
          offer_code: '', // Will be auto-generated
        })
        .select()
        .single();

      if (offerError) throw offerError;

      // Create first version with all details
      // Note: gross_pay_total and net_pay_estimate are generated columns calculated by the database
      const { data: version, error: versionError } = await supabase
        .from("offer_versions")
        .insert({
          offer_id: offer.id,
          version_number: 1,
          status: 'draft',
          work_location_id: data.work_location_id,
          department_id: data.department_id,
          position_id: data.position_id,
          manager_employee_id: data.manager_employee_id || null,
          start_date: data.start_date,
          currency_code: data.currency_code,
          basic_salary: data.basic_salary,
          housing_allowance: data.housing_allowance,
          transport_allowance: data.transport_allowance,
          other_allowances: data.other_allowances,
          deductions_fixed: data.deductions_fixed,
          deductions_total: deductionsTotal,
          employer_gosi_amount: gosiEmployerAmount,
        })
        .select()
        .single();

      if (versionError) throw versionError;

      // Update offer with current version
      const { error: updateError } = await supabase
        .from("offers")
        .update({ current_version_id: version.id })
        .eq("id", offer.id);

      if (updateError) throw updateError;

      // Update candidate status
      await supabase
        .from("candidates")
        .update({ status: 'in_process' })
        .eq("id", data.candidateId);

      return offer;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offers"] });
      queryClient.invalidateQueries({ queryKey: ["candidates"] });
      toast.success("Offer created successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to create offer: ${error.message}`);
    },
  });
}

// Keep old hook for backward compatibility but mark as deprecated
export function useCreateOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (candidateId: string) => {
      // Create offer
      const { data: offer, error: offerError } = await supabase
        .from("offers")
        .insert({
          candidate_id: candidateId,
          offer_code: '', // Will be auto-generated
        })
        .select()
        .single();

      if (offerError) throw offerError;

      // Create first version with empty data
      const { data: version, error: versionError } = await supabase
        .from("offer_versions")
        .insert({
          offer_id: offer.id,
          version_number: 1,
          status: 'draft',
          currency_code: 'SAR',
          basic_salary: 0,
          housing_allowance: 0,
          transport_allowance: 0,
          other_allowances: 0,
          deductions_fixed: 0,
          deductions_total: 0,
          employer_gosi_amount: 0,
        })
        .select()
        .single();

      if (versionError) throw versionError;

      // Update offer with current version
      const { error: updateError } = await supabase
        .from("offers")
        .update({ current_version_id: version.id })
        .eq("id", offer.id);

      if (updateError) throw updateError;

      // Update candidate status
      await supabase
        .from("candidates")
        .update({ status: 'in_process' })
        .eq("id", candidateId);

      return offer;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offers"] });
      queryClient.invalidateQueries({ queryKey: ["candidates"] });
      toast.success("Offer created successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to create offer: ${error.message}`);
    },
  });
}

export function useUpdateOfferVersion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ versionId, data }: { versionId: string; data: Partial<OfferVersionFormData> }) => {
      const { data: result, error } = await supabase
        .from("offer_versions")
        .update(data)
        .eq("id", versionId)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["offers"] });
      queryClient.invalidateQueries({ queryKey: ["offer", result.offer_id] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to update offer: ${error.message}`);
    },
  });
}

export function useCreateOfferVersionFromEdit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      offerId,
      previousVersionId,
      data,
    }: {
      offerId: string;
      previousVersionId: string;
      data: Partial<OfferVersionFormData>;
    }) => {
      // Get the previous version to get version_number
      const { data: previousVersion, error: prevError } = await supabase
        .from("offer_versions")
        .select("version_number")
        .eq("id", previousVersionId)
        .single();

      if (prevError) throw prevError;

      // Mark previous version as superseded
      const { error: updateError } = await supabase
        .from("offer_versions")
        .update({
          status: "superseded" as OfferVersionStatus,
        })
        .eq("id", previousVersionId);

      if (updateError) throw updateError;

      // Create new version with incremented version_number
      const { data: newVersion, error: createError } = await supabase
        .from("offer_versions")
        .insert({
          ...data,
          offer_id: offerId,
          version_number: (previousVersion?.version_number || 0) + 1,
          status: "draft" as OfferVersionStatus,
        })
        .select()
        .single();

      if (createError) throw createError;

      // Update offer's current_version_id
      const { error: offerError } = await supabase
        .from("offers")
        .update({ current_version_id: newVersion.id })
        .eq("id", offerId);

      if (offerError) throw offerError;

      return newVersion;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["offers"] });
      queryClient.invalidateQueries({ queryKey: ["offer", result.offer_id] });
      toast.success("New version created");
    },
    onError: (error: Error) => {
      toast.error(`Failed to create new version: ${error.message}`);
    },
  });
}

export function useCreateOfferVersion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ offerId, copyFromVersionId, changeReason }: { 
      offerId: string; 
      copyFromVersionId: string;
      changeReason?: string;
    }) => {
      // Get the version to copy from
      const { data: sourceVersion, error: sourceError } = await supabase
        .from("offer_versions")
        .select("*")
        .eq("id", copyFromVersionId)
        .single();

      if (sourceError) throw sourceError;

      // Mark current version as superseded
      await supabase
        .from("offer_versions")
        .update({ 
          status: 'superseded' as OfferVersionStatus,
          superseded_at: new Date().toISOString()
        })
        .eq("id", copyFromVersionId);

      // Create new version
      const { data: newVersion, error: createError } = await supabase
        .from("offer_versions")
        .insert({
          offer_id: offerId,
          version_number: sourceVersion.version_number + 1,
          status: 'draft',
          work_location_id: sourceVersion.work_location_id,
          department_id: sourceVersion.department_id,
          position_id: sourceVersion.position_id,
          manager_employee_id: sourceVersion.manager_employee_id,
          start_date: sourceVersion.start_date,
          currency_code: sourceVersion.currency_code,
          basic_salary: sourceVersion.basic_salary,
          housing_allowance: sourceVersion.housing_allowance,
          transport_allowance: sourceVersion.transport_allowance,
          other_allowances: sourceVersion.other_allowances,
          deductions_fixed: sourceVersion.deductions_fixed,
          deductions_total: sourceVersion.deductions_total,
          employer_gosi_amount: sourceVersion.employer_gosi_amount,
          template_id: sourceVersion.template_id,
          change_reason: changeReason,
        })
        .select()
        .single();

      if (createError) throw createError;

      // Update offer with new current version
      await supabase
        .from("offers")
        .update({ 
          current_version_id: newVersion.id,
          status: 'draft' // Reset to draft for new version
        })
        .eq("id", offerId);

      return newVersion;
    },
    onSuccess: (_, { offerId }) => {
      queryClient.invalidateQueries({ queryKey: ["offers"] });
      queryClient.invalidateQueries({ queryKey: ["offer", offerId] });
      toast.success("New offer version created");
    },
    onError: (error: Error) => {
      toast.error(`Failed to create offer version: ${error.message}`);
    },
  });
}

export function useMarkOfferAccepted() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ offerId, versionId, candidateId }: { 
      offerId: string; 
      versionId: string;
      candidateId: string;
    }) => {
      // Mark version as accepted
      await supabase
        .from("offer_versions")
        .update({ 
          status: 'accepted' as OfferVersionStatus,
          accepted_at: new Date().toISOString()
        })
        .eq("id", versionId);

      // Update offer status
      await supabase
        .from("offers")
        .update({ status: 'accepted' as OfferStatus })
        .eq("id", offerId);

      // Update candidate status
      await supabase
        .from("candidates")
        .update({ status: 'offer_accepted' })
        .eq("id", candidateId);

      return { offerId, versionId };
    },
    onSuccess: (_, { offerId }) => {
      queryClient.invalidateQueries({ queryKey: ["offers"] });
      queryClient.invalidateQueries({ queryKey: ["offer", offerId] });
      queryClient.invalidateQueries({ queryKey: ["candidates"] });
      toast.success("Offer marked as accepted");
    },
    onError: (error: Error) => {
      toast.error(`Failed to mark offer as accepted: ${error.message}`);
    },
  });
}

export function useMarkOfferRejected() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ offerId, versionId, candidateId }: { 
      offerId: string; 
      versionId: string;
      candidateId: string;
    }) => {
      // Mark version as rejected
      await supabase
        .from("offer_versions")
        .update({ 
          status: 'rejected' as OfferVersionStatus,
          rejected_at: new Date().toISOString()
        })
        .eq("id", versionId);

      // Update offer status
      await supabase
        .from("offers")
        .update({ status: 'rejected' as OfferStatus })
        .eq("id", offerId);

      // Update candidate status
      await supabase
        .from("candidates")
        .update({ status: 'offer_rejected' })
        .eq("id", candidateId);

      return { offerId, versionId };
    },
    onSuccess: (_, { offerId }) => {
      queryClient.invalidateQueries({ queryKey: ["offers"] });
      queryClient.invalidateQueries({ queryKey: ["offer", offerId] });
      queryClient.invalidateQueries({ queryKey: ["candidates"] });
      toast.success("Offer marked as rejected");
    },
    onError: (error: Error) => {
      toast.error(`Failed to mark offer as rejected: ${error.message}`);
    },
  });
}

// Alias hooks for better naming
export function useReviseOffer() {
  return useCreateOfferVersion();
}

export function useSendOfferLetter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      versionId, 
      templateId, 
      senderEmployeeId 
    }: { 
      versionId: string; 
      templateId: string;
      senderEmployeeId?: string;
    }) => {
      // Call the edge function to send the offer letter email
      const { data, error } = await supabase.functions.invoke('send-offer-letter', {
        body: {
          offer_version_id: versionId,
          template_id: templateId,
          sender_employee_id: senderEmployeeId
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offers"] });
      queryClient.invalidateQueries({ queryKey: ["candidates"] });
      toast.success("Offer letter sent successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to send offer letter: ${error.message}`);
    },
  });
}

export function useAcceptOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (versionId: string) => {
      // Get version and offer details
      const { data: version, error: versionError } = await supabase
        .from("offer_versions")
        .select(`
          *,
          offer:offers(id, candidate_id)
        `)
        .eq("id", versionId)
        .single();

      if (versionError) throw versionError;

      // Handle the case where offer might be an array (Supabase relation quirk)
      const offerData = Array.isArray(version.offer) ? version.offer[0] : version.offer;
      if (!offerData) throw new Error("Offer not found for this version");
      
      const offerId = offerData.id;
      const candidateId = offerData.candidate_id;

      // Get candidate data for employee creation
      const { data: candidate, error: candidateError } = await supabase
        .from("candidates")
        .select("*")
        .eq("id", candidateId)
        .single();

      if (candidateError) throw candidateError;

      // Mark version as accepted
      const { error: versionUpdateError } = await supabase
        .from("offer_versions")
        .update({ 
          status: 'accepted' as OfferVersionStatus,
          accepted_at: new Date().toISOString()
        })
        .eq("id", versionId);

      if (versionUpdateError) throw versionUpdateError;

      // Update offer status
      const { error: offerUpdateError } = await supabase
        .from("offers")
        .update({ status: 'accepted' as OfferStatus })
        .eq("id", offerId);

      if (offerUpdateError) throw offerUpdateError;

      // Create employee from candidate and offer version data
      const { data: employee, error: employeeError } = await supabase
        .from("employees")
        .insert({
          first_name: candidate.first_name,
          last_name: candidate.last_name,
          email: candidate.email,
          phone: candidate.phone,
          nationality: candidate.nationality,
          department_id: version.department_id,
          position_id: version.position_id,
          work_location_id: version.work_location_id,
          manager_id: version.manager_employee_id,
          join_date: version.start_date,
          salary: version.basic_salary,
          salary_currency_code: version.currency_code,
          status: 'active',
        })
        .select()
        .single();

      if (employeeError) throw employeeError;

      // Create employee allowances for housing, transport, and other
      const allowancesToCreate = [];
      
      if (version.housing_allowance > 0) {
        allowancesToCreate.push({
          employee_id: employee.id,
          custom_name: 'Housing Allowance',
          custom_amount: version.housing_allowance,
          effective_date: version.start_date,
        });
      }
      
      if (version.transport_allowance > 0) {
        allowancesToCreate.push({
          employee_id: employee.id,
          custom_name: 'Transport Allowance',
          custom_amount: version.transport_allowance,
          effective_date: version.start_date,
        });
      }
      
      if (version.other_allowances > 0) {
        allowancesToCreate.push({
          employee_id: employee.id,
          custom_name: 'Other Allowances',
          custom_amount: version.other_allowances,
          effective_date: version.start_date,
        });
      }

      if (allowancesToCreate.length > 0) {
        const { error: allowanceError } = await supabase
          .from("employee_allowances")
          .insert(allowancesToCreate);

        if (allowanceError) {
          console.error("Failed to create allowances:", allowanceError);
          // Don't throw - allowances are not critical
        }
      }

      // Log the conversion
      const { error: logError } = await supabase
        .from("employee_conversion_log")
        .insert({
          candidate_id: candidateId,
          offer_id: offerId,
          offer_version_id: versionId,
          employee_id: employee.id,
        });

      if (logError) {
        console.error("Failed to log conversion:", logError);
        // Don't throw - logging is not critical
      }

      // Archive the candidate
      await supabase
        .from("candidates")
        .update({ status: 'archived' })
        .eq("id", candidateId);

      // Archive the offer
      await supabase
        .from("offers")
        .update({ status: 'archived' })
        .eq("id", offerId);

      return { offerId, versionId, employeeId: employee.id };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["offers"] });
      queryClient.invalidateQueries({ queryKey: ["offer", result.offerId] });
      queryClient.invalidateQueries({ queryKey: ["candidates"] });
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
  });
}

export function useRejectOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (versionId: string) => {
      // Get version and offer details
      const { data: version, error: versionError } = await supabase
        .from("offer_versions")
        .select(`
          *,
          offer:offers(id, candidate_id)
        `)
        .eq("id", versionId)
        .single();

      if (versionError) throw versionError;

      const offerId = (version.offer as { id: string }).id;
      const candidateId = (version.offer as { candidate_id: string }).candidate_id;

      // Mark version as rejected
      await supabase
        .from("offer_versions")
        .update({ 
          status: 'rejected' as OfferVersionStatus,
          rejected_at: new Date().toISOString()
        })
        .eq("id", versionId);

      // Update offer status
      await supabase
        .from("offers")
        .update({ status: 'rejected' as OfferStatus })
        .eq("id", offerId);

      // Update candidate status
      await supabase
        .from("candidates")
        .update({ status: 'offer_rejected' })
        .eq("id", candidateId);

      return { offerId, versionId };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["offers"] });
      queryClient.invalidateQueries({ queryKey: ["offer", result.offerId] });
      queryClient.invalidateQueries({ queryKey: ["candidates"] });
      toast.success("Offer marked as rejected");
    },
    onError: (error: Error) => {
      toast.error(`Failed to reject offer: ${error.message}`);
    },
  });
}
