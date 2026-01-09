import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useRole } from "@/contexts/RoleContext";
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
  created_at: string;
  updated_at: string;
  // Joined data
  template?: {
    id: string;
    name: string;
    category: string;
  };
  employee?: {
    id: string;
    first_name: string;
    last_name: string;
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

export function useAllHRDocumentRequests() {
  return useQuery({
    queryKey: ["hr-document-requests", "all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hr_document_requests")
        .select(`
          *,
          template:document_templates(id, name, category),
          employee:employees(id, first_name, last_name)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as HRDocumentRequest[];
    },
  });
}

export function useCreateHRDocumentRequest() {
  const queryClient = useQueryClient();
  const { effectiveEmployeeId } = useRole();

  return useMutation({
    mutationFn: async ({ templateId, notes }: { templateId: string; notes?: string }) => {
      if (!effectiveEmployeeId) throw new Error("No employee found");

      const { data, error } = await supabase
        .from("hr_document_requests")
        .insert({
          employee_id: effectiveEmployeeId,
          template_id: templateId,
          notes: notes || null,
        })
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
