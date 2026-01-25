import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useRole } from "@/contexts/RoleContext";
import { ApprovalMode } from "./useDocumentTemplates";

export interface HRDocumentRequest {
  id: string;
  employee_id: string;
  template_id: string;
  status: "pending" | "approved" | "rejected" | "cancelled";
  notes: string | null;
  generated_document_id: string | null;
  rejection_reason: string | null;
  processed_by: string | null;
  processed_at: string | null;
  pdf_storage_path: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  template?: {
    id: string;
    name: string;
    category: string;
    approval_mode: ApprovalMode;
    docx_storage_path: string | null;
  };
  employee?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string | null;
    employee_code: string | null;
  };
}

export function useMyHRDocumentRequests() {
  const { effectiveEmployeeId } = useRole();

  return useQuery({
    queryKey: ["hr-document-requests", "my", effectiveEmployeeId],
    queryFn: async () => {
      if (!effectiveEmployeeId) return [];
      
      const { data, error } = await supabase
        .from("hr_document_requests")
        .select(`
          *,
          template:document_templates(id, name, category)
        `)
        .eq("employee_id", effectiveEmployeeId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as HRDocumentRequest[];
    },
    enabled: !!effectiveEmployeeId,
  });
}

export function useAllHRDocumentRequests(statusFilter?: string) {
  return useQuery({
    queryKey: ["hr-document-requests", "all", statusFilter],
    queryFn: async () => {
      let query = supabase
        .from("hr_document_requests")
        .select(`
          *,
          template:document_templates(id, name, category, approval_mode, docx_storage_path),
          employee:employees(id, first_name, last_name, email, employee_code)
        `)
        .order("created_at", { ascending: false });

      if (statusFilter && statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as HRDocumentRequest[];
    },
  });
}

export function usePendingHRDocumentRequestsCount() {
  return useQuery({
    queryKey: ["hr-document-requests", "pending-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("hr_document_requests")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");

      if (error) throw error;
      return count || 0;
    },
  });
}

export function useCreateHRDocumentRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ employeeId, templateId, notes }: { 
      employeeId: string; 
      templateId: string; 
      notes?: string;
    }) => {
      // First, insert the request
      const { data, error } = await supabase
        .from("hr_document_requests")
        .insert({
          employee_id: employeeId,
          template_id: templateId,
          notes,
        })
        .select(`
          *,
          template:document_templates(id, name, approval_mode, docx_storage_path)
        `)
        .single();

      if (error) throw error;

      // Check if auto-generate is enabled
      const template = data.template as { approval_mode?: string; docx_storage_path?: string } | null;
      if (template?.approval_mode === 'auto_generate' && template?.docx_storage_path) {
        // Trigger automatic generation
        const { error: generateError } = await supabase.functions.invoke('generate-hr-letter', {
          body: { request_id: data.id }
        });
        
        if (generateError) {
          console.error('Auto-generate failed:', generateError);
          // Don't throw - request is still created, HR can manually process it
        }
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-hr-document-requests"] });
      queryClient.invalidateQueries({ queryKey: ["pending-hr-document-requests"] });
    },
  });
}

export function useGetHRLetterUrl() {
  return useMutation({
    mutationFn: async (storagePath: string) => {
      const { data, error } = await supabase.storage
        .from('hr-letters')
        .createSignedUrl(storagePath, 3600);
      
      if (error) throw error;
      return data.signedUrl;
    },
  });
}

export function useUpdateHRDocumentRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
      rejection_reason,
      generated_document_id,
    }: {
      id: string;
      status: "approved" | "rejected" | "cancelled";
      rejection_reason?: string;
      generated_document_id?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from("hr_document_requests")
        .update({
          status,
          rejection_reason: rejection_reason || null,
          generated_document_id: generated_document_id || null,
          processed_by: user?.id || null,
          processed_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hr-document-requests"] });
    },
  });
}
