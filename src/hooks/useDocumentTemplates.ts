import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { queryKeys } from "@/lib/queryKeys";
export interface DocumentTemplate {
  id: string;
  name: string;
  category: string;
  description: string | null;
  content: string;
  is_active: boolean;
  docx_template_url: string | null;
  created_at: string;
  updated_at: string;
}

export type DocumentTemplateInput = Omit<DocumentTemplate, "id" | "created_at" | "updated_at">;

export function useDocumentTemplates() {
  return useQuery({
    queryKey: queryKeys.documents.templates,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("document_templates")
        .select("*")
        .order("category", { ascending: true })
        .order("name", { ascending: true });

      if (error) throw error;
      return data as DocumentTemplate[];
    },
  });
}

export function useDocumentTemplate(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.documents.templateDetail(id || ''),
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("document_templates")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as DocumentTemplate;
    },
    enabled: !!id,
  });
}

export function useCreateDocumentTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (template: DocumentTemplateInput) => {
      const { data, error } = await supabase
        .from("document_templates")
        .insert(template)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.documents.templates });
    },
  });
}

export function useUpdateDocumentTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...template }: Partial<DocumentTemplate> & { id: string }) => {
      const { data, error } = await supabase
        .from("document_templates")
        .update(template)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.documents.templates });
    },
  });
}

export function useDeleteDocumentTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("document_templates")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.documents.templates });
    },
  });
}
