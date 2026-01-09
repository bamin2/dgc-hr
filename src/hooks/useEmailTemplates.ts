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

// Define available variables for each template type
export const templateVariables: Record<string, { name: string; description: string }[]> = {
  leave_request_submitted: [
    { name: "employeeName", description: "Employee's full name" },
    { name: "leaveType", description: "Type of leave requested" },
    { name: "startDate", description: "Leave start date" },
    { name: "endDate", description: "Leave end date" },
    { name: "daysCount", description: "Total number of days" },
    { name: "reason", description: "Reason for leave (optional)" },
  ],
  leave_request_approved: [
    { name: "employeeName", description: "Employee's full name" },
    { name: "leaveType", description: "Type of leave requested" },
    { name: "startDate", description: "Leave start date" },
    { name: "endDate", description: "Leave end date" },
    { name: "daysCount", description: "Total number of days" },
    { name: "reviewerName", description: "Name of approver (optional)" },
  ],
  leave_request_rejected: [
    { name: "employeeName", description: "Employee's full name" },
    { name: "leaveType", description: "Type of leave requested" },
    { name: "startDate", description: "Leave start date" },
    { name: "endDate", description: "Leave end date" },
    { name: "daysCount", description: "Total number of days" },
    { name: "reviewerName", description: "Name of reviewer (optional)" },
    { name: "rejectionReason", description: "Reason for rejection (optional)" },
  ],
  payslip_issued: [
    { name: "employeeName", description: "Employee's full name" },
    { name: "payPeriod", description: "Pay period (e.g., January 2026)" },
    { name: "netPay", description: "Net pay amount" },
    { name: "currency", description: "Currency code (e.g., BHD)" },
  ],
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
