import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface EmailTemplate {
  id: string;
  type: string;
  name: string;
  subject: string;
  description: string | null;
  body_content: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface EmailTemplateUpdate {
  subject?: string;
  body_content?: string;
  is_active?: boolean;
}

// Map email template types to relevant smart tag categories
export const templateTagCategories: Record<string, string[]> = {
  leave_request_submitted: ["Employee", "Leave", "Company", "Date"],
  leave_request_approved: ["Employee", "Leave", "Company", "Date"],
  leave_request_rejected: ["Employee", "Leave", "Company", "Date"],
  payslip_issued: ["Employee", "Payroll", "Compensation", "Company", "Date"],
};

export function useEmailTemplates() {
  const queryClient = useQueryClient();

  const { data: templates, isLoading, error } = useQuery({
    queryKey: ["email-templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("email_templates")
        .select("*")
        .order("name");

      if (error) throw error;
      return data as EmailTemplate[];
    },
  });

  const updateTemplate = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: EmailTemplateUpdate }) => {
      const { data, error } = await supabase
        .from("email_templates")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-templates"] });
      toast.success("Email template updated successfully");
    },
    onError: (error) => {
      console.error("Failed to update template:", error);
      toast.error("Failed to update email template");
    },
  });

  return {
    templates,
    isLoading,
    error,
    updateTemplate,
  };
}
