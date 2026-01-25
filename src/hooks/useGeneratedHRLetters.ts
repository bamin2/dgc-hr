import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface GeneratedHRLetter {
  id: string;
  employee_id: string;
  template_id: string;
  status: string;
  pdf_storage_path: string;
  processed_at: string | null;
  created_at: string;
  template?: {
    id: string;
    name: string;
    category: string;
  };
  employee?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string | null;
    employee_code: string | null;
    avatar_url: string | null;
  };
}

export function useGeneratedHRLetters(templateFilter?: string, searchQuery?: string) {
  return useQuery({
    queryKey: ["generated-hr-letters", templateFilter, searchQuery],
    queryFn: async () => {
      let query = supabase
        .from("hr_document_requests")
        .select(`
          id,
          employee_id,
          template_id,
          status,
          pdf_storage_path,
          processed_at,
          created_at,
          template:document_templates(id, name, category),
          employee:employees(id, first_name, last_name, email, employee_code, avatar_url)
        `)
        .eq("status", "approved")
        .not("pdf_storage_path", "is", null)
        .order("processed_at", { ascending: false });

      if (templateFilter && templateFilter !== "all") {
        query = query.eq("template_id", templateFilter);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Filter by search query on the client side
      let filteredData = data as GeneratedHRLetter[];
      
      if (searchQuery && searchQuery.trim()) {
        const search = searchQuery.toLowerCase().trim();
        filteredData = filteredData.filter((letter) => {
          const employeeName = `${letter.employee?.first_name} ${letter.employee?.last_name}`.toLowerCase();
          const employeeCode = letter.employee?.employee_code?.toLowerCase() || "";
          const templateName = letter.template?.name?.toLowerCase() || "";
          return (
            employeeName.includes(search) ||
            employeeCode.includes(search) ||
            templateName.includes(search)
          );
        });
      }

      return filteredData;
    },
  });
}

export function useDeleteGeneratedHRLetter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, storagePath }: { id: string; storagePath: string }) => {
      // 1. Delete the PDF from storage
      const { error: storageError } = await supabase.storage
        .from("hr-letters")
        .remove([storagePath]);

      if (storageError) {
        console.error("Failed to delete file from storage:", storageError);
        // Continue to delete the record even if storage deletion fails
      }

      // 2. Delete the request record
      const { error: dbError } = await supabase
        .from("hr_document_requests")
        .delete()
        .eq("id", id);

      if (dbError) throw dbError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["generated-hr-letters"] });
      queryClient.invalidateQueries({ queryKey: ["hr-document-requests"] });
    },
  });
}

export function useGeneratedHRLetterTemplates() {
  return useQuery({
    queryKey: ["generated-hr-letter-templates"],
    queryFn: async () => {
      // Get unique templates that have generated letters
      const { data, error } = await supabase
        .from("hr_document_requests")
        .select("template:document_templates(id, name)")
        .eq("status", "approved")
        .not("pdf_storage_path", "is", null);

      if (error) throw error;

      // Extract unique templates
      const templatesMap = new Map<string, { id: string; name: string }>();
      data.forEach((item) => {
        if (item.template) {
          const template = item.template as { id: string; name: string };
          templatesMap.set(template.id, template);
        }
      });

      return Array.from(templatesMap.values());
    },
  });
}
