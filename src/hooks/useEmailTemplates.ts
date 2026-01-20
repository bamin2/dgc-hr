import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { queryKeys } from "@/lib/queryKeys";

/** Email template record from the database */
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

/** Partial update payload for email templates */
export interface EmailTemplateUpdate {
  subject?: string;
  body_content?: string;
  is_active?: boolean;
}

/**
 * Maps email template types to available smart tag categories.
 * Used by the template editor to show relevant placeholders.
 */
export const templateTagCategories: Record<string, string[]> = {
  leave_request_submitted: ["Employee", "Leave", "Company", "Date"],
  leave_request_approved: ["Employee", "Leave", "Company", "Date"],
  leave_request_rejected: ["Employee", "Leave", "Company", "Date"],
  payslip_issued: ["Employee", "Payroll", "Compensation", "Company", "Date"],
};

/**
 * Hook for managing email templates.
 * Provides CRUD operations for email notification templates.
 * 
 * @returns Templates list, loading state, error, and update mutation
 */
export function useEmailTemplates() {
  const queryClient = useQueryClient();

  const { data: templates, isLoading, error } = useQuery({
    queryKey: queryKeys.emailTemplates.all,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("email_templates")
        .select("id, type, name, subject, description, body_content, is_active, created_at, updated_at")
        .order("name");

      if (error) throw error;
      return data as EmailTemplate[];
    },
  });

  const updateTemplate = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: EmailTemplateUpdate }) => {
      // Ensure we have a fresh session before updating
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        throw new Error("You must be logged in to update email templates");
      }

      const { data, error } = await supabase
        .from("email_templates")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        // Provide more specific error messages
        if (error.code === "PGRST116") {
          throw new Error("Permission denied. You need admin access to update email templates.");
        }
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.emailTemplates.all });
      toast.success("Email template updated successfully");
    },
    onError: (error: any) => {
      console.error("Failed to update template:", error);
      
      if (error.code === "PGRST116" || error.message?.includes("Permission denied")) {
        toast.error("Permission denied. Please ensure you have admin access.");
      } else if (error.message?.includes("logged in")) {
        toast.error(error.message);
      } else {
        toast.error("Failed to update email template");
      }
    },
  });

  return {
    templates,
    isLoading,
    error,
    updateTemplate,
  };
}
