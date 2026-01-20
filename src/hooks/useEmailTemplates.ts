import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { queryKeys } from "@/lib/queryKeys";
import type { Json } from "@/integrations/supabase/types";

/** Configuration for additional email recipients */
export interface EmailRecipientConfig {
  send_to_manager: boolean;
  send_to_hr: boolean;
  custom_emails: string[];
}

/** Email template record from the database */
export interface EmailTemplate {
  id: string;
  type: string;
  name: string;
  subject: string;
  description: string | null;
  body_content: string;
  is_active: boolean;
  recipient_config: EmailRecipientConfig | null;
  use_default_template: boolean;
  created_at: string;
  updated_at: string;
}

/** Partial update payload for email templates */
export interface EmailTemplateUpdate {
  subject?: string;
  body_content?: string;
  is_active?: boolean;
  recipient_config?: EmailRecipientConfig;
  use_default_template?: boolean;
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
 * Parses the recipient_config JSON from the database into a typed object.
 */
function parseRecipientConfig(config: Json | null): EmailRecipientConfig | null {
  if (!config || typeof config !== "object" || Array.isArray(config)) {
    return null;
  }
  
  const obj = config as Record<string, unknown>;
  return {
    send_to_manager: typeof obj.send_to_manager === "boolean" ? obj.send_to_manager : false,
    send_to_hr: typeof obj.send_to_hr === "boolean" ? obj.send_to_hr : false,
    custom_emails: Array.isArray(obj.custom_emails) ? obj.custom_emails.filter((e): e is string => typeof e === "string") : [],
  };
}

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
        .select("id, type, name, subject, description, body_content, is_active, recipient_config, use_default_template, created_at, updated_at")
        .order("name");

      if (error) throw error;
      
      // Transform the data to properly parse recipient_config
      return data.map((row): EmailTemplate => ({
        id: row.id,
        type: row.type,
        name: row.name,
        subject: row.subject,
        description: row.description,
        body_content: row.body_content,
        is_active: row.is_active ?? true,
        recipient_config: parseRecipientConfig(row.recipient_config),
        use_default_template: row.use_default_template ?? false,
        created_at: row.created_at ?? "",
        updated_at: row.updated_at ?? "",
      }));
    },
  });

  const updateTemplate = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: EmailTemplateUpdate }) => {
      // Ensure we have a fresh session before updating
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        throw new Error("You must be logged in to update email templates");
      }

      // Convert EmailRecipientConfig to Json for Supabase
      const dbUpdates: Record<string, unknown> = { ...updates };
      if (updates.recipient_config) {
        dbUpdates.recipient_config = updates.recipient_config as unknown as Json;
      }

      const { data, error } = await supabase
        .from("email_templates")
        .update(dbUpdates)
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

/**
 * Hook for leave-related email templates only.
 * Filters templates where type starts with 'leave_'.
 */
export function useLeaveEmailTemplates() {
  const { templates, isLoading, error, updateTemplate } = useEmailTemplates();
  
  const leaveTemplates = templates?.filter((t) => t.type.startsWith("leave_"));
  
  return {
    templates: leaveTemplates,
    isLoading,
    error,
    updateTemplate,
  };
}

/**
 * Hook for non-leave email templates.
 * Filters out templates where type starts with 'leave_'.
 */
export function useNonLeaveEmailTemplates() {
  const { templates, isLoading, error, updateTemplate } = useEmailTemplates();
  
  const nonLeaveTemplates = templates?.filter((t) => !t.type.startsWith("leave_"));
  
  return {
    templates: nonLeaveTemplates,
    isLoading,
    error,
    updateTemplate,
  };
}
