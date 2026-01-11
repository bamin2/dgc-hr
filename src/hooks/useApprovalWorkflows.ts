import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ApprovalWorkflow, ApprovalWorkflowStep, RequestType } from "@/types/approvals";
import { toast } from "sonner";
import { queryKeys } from "@/lib/queryKeys";

// Fetch all approval workflows
export function useApprovalWorkflows() {
  return useQuery({
    queryKey: queryKeys.approvalWorkflows.all,
    queryFn: async (): Promise<ApprovalWorkflow[]> => {
      const { data, error } = await supabase
        .from("approval_workflows")
        .select("id, request_type, is_active, steps, default_hr_approver_id, created_at, updated_at, updated_by")
        .order("request_type");

      if (error) throw error;

      return (data || []).map((row) => ({
        ...row,
        request_type: row.request_type as RequestType,
        steps: (row.steps as unknown as ApprovalWorkflowStep[]) || [],
      }));
    },
  });
}

// Fetch a specific workflow by request type
export function useApprovalWorkflow(requestType: RequestType) {
  return useQuery({
    queryKey: queryKeys.approvalWorkflows.byType(requestType),
    queryFn: async (): Promise<ApprovalWorkflow | null> => {
      const { data, error } = await supabase
        .from("approval_workflows")
        .select("id, request_type, is_active, steps, default_hr_approver_id, created_at, updated_at, updated_by")
        .eq("request_type", requestType)
        .single();

      if (error) {
        if (error.code === "PGRST116") return null; // Not found
        throw error;
      }

      return {
        ...data,
        request_type: data.request_type as RequestType,
        steps: (data.steps as unknown as ApprovalWorkflowStep[]) || [],
      };
    },
  });
}

// Update a workflow
export function useUpdateApprovalWorkflow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      requestType,
      is_active,
      steps,
      default_hr_approver_id,
    }: {
      requestType: RequestType;
      is_active?: boolean;
      steps?: ApprovalWorkflowStep[];
      default_hr_approver_id?: string | null;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const updateData: Record<string, unknown> = {
        updated_by: user?.id,
        updated_at: new Date().toISOString(),
      };

      if (is_active !== undefined) updateData.is_active = is_active;
      if (steps !== undefined) updateData.steps = steps;
      if (default_hr_approver_id !== undefined) updateData.default_hr_approver_id = default_hr_approver_id;

      const { data, error } = await supabase
        .from("approval_workflows")
        .update(updateData)
        .eq("request_type", requestType)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.approvalWorkflows.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.approvalWorkflows.byType(variables.requestType) });
      toast.success("Workflow updated successfully");
    },
    onError: (error) => {
      console.error("Error updating workflow:", error);
      toast.error("Failed to update workflow");
    },
  });
}

// Get HR users for approver selection
export function useHRUsers() {
  return useQuery({
    queryKey: queryKeys.users.hr,
    queryFn: async () => {
      // Get users with HR or Admin roles
      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select("user_id")
        .in("role", ["hr", "admin"]);

      if (roleError) throw roleError;

      const userIds = roleData?.map((r) => r.user_id) || [];
      if (userIds.length === 0) return [];

      // Get profile info for these users
      const { data: profiles, error: profileError } = await supabase
        .from("profiles")
        .select("id, email, first_name, last_name")
        .in("id", userIds);

      if (profileError) throw profileError;

      return profiles || [];
    },
  });
}

// Get all users for specific user selection
export function useAllUsers() {
  return useQuery({
    queryKey: queryKeys.users.all,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, email, first_name, last_name")
        .order("first_name");

      if (error) throw error;
      return data || [];
    },
  });
}
