import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface AllPendingLeaveRequest {
  id: string;
  employee_id: string;
  leave_type_id: string;
  start_date: string;
  end_date: string;
  days_count: number;
  reason: string | null;
  status: string;
  created_at: string;
  employee: {
    id: string;
    first_name: string;
    last_name: string;
    full_name: string | null;
    avatar_url: string | null;
  };
  leave_type: {
    id: string;
    name: string;
    color: string | null;
  };
}

// Fetch ALL pending leave requests for HR/Admin
export function useAllPendingLeaveRequests() {
  return useQuery({
    queryKey: ["all-pending-leave-requests"],
    queryFn: async (): Promise<AllPendingLeaveRequest[]> => {
      const { data, error } = await supabase
        .from("leave_requests")
        .select(`
          *,
          employee:employees!leave_requests_employee_id_fkey(id, first_name, last_name, full_name, avatar_url),
          leave_type:leave_types(id, name, color)
        `)
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (error) throw error;

      return (data || []).map((lr) => ({
        ...lr,
        employee: lr.employee as AllPendingLeaveRequest["employee"],
        leave_type: lr.leave_type as AllPendingLeaveRequest["leave_type"],
      }));
    },
  });
}

// Admin override: directly approve a leave request
export function useAdminApproveLeaveRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ requestId, comment }: { requestId: string; comment?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Get the employee ID for the current user
      const { data: employee, error: employeeError } = await supabase
        .from("employees")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (employeeError) throw employeeError;
      if (!employee) throw new Error("No employee record found for current user");

      // Update all pending/queued steps to approved
      const { error: stepsError } = await supabase
        .from("request_approval_steps")
        .update({
          status: "approved",
          acted_by: employee.id,
          acted_at: new Date().toISOString(),
          comment: comment || "Approved by HR/Admin override",
        })
        .eq("request_id", requestId)
        .eq("request_type", "time_off")
        .in("status", ["pending", "queued"]);

      if (stepsError) throw stepsError;

      // Approve the leave request
      const { error: requestError } = await supabase
        .from("leave_requests")
        .update({
          status: "approved",
          reviewed_by: employee.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", requestId);

      if (requestError) throw requestError;

      return { requestId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-pending-leave-requests"] });
      queryClient.invalidateQueries({ queryKey: ["pending-approvals"] });
      queryClient.invalidateQueries({ queryKey: ["pending-approvals-count"] });
      queryClient.invalidateQueries({ queryKey: ["request-approval-steps"] });
      queryClient.invalidateQueries({ queryKey: ["leave-requests"] });
      toast.success("Leave request approved");
    },
    onError: (error) => {
      console.error("Error approving leave request:", error);
      toast.error("Failed to approve leave request");
    },
  });
}

// Admin override: directly reject a leave request
export function useAdminRejectLeaveRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ requestId, reason }: { requestId: string; reason: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Get the employee ID for the current user
      const { data: employee, error: employeeError } = await supabase
        .from("employees")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (employeeError) throw employeeError;
      if (!employee) throw new Error("No employee record found for current user");

      // Update all pending steps to rejected, queued steps to cancelled
      const { error: rejectError } = await supabase
        .from("request_approval_steps")
        .update({
          status: "rejected",
          acted_by: employee.id,
          acted_at: new Date().toISOString(),
          comment: reason,
        })
        .eq("request_id", requestId)
        .eq("request_type", "time_off")
        .eq("status", "pending");

      if (rejectError) throw rejectError;

      const { error: cancelError } = await supabase
        .from("request_approval_steps")
        .update({
          status: "cancelled",
        })
        .eq("request_id", requestId)
        .eq("request_type", "time_off")
        .eq("status", "queued");

      if (cancelError) throw cancelError;

      // Reject the leave request
      const { error: requestError } = await supabase
        .from("leave_requests")
        .update({
          status: "rejected",
          reviewed_by: employee.id,
          reviewed_at: new Date().toISOString(),
          rejection_reason: reason,
        })
        .eq("id", requestId);

      if (requestError) throw requestError;

      return { requestId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-pending-leave-requests"] });
      queryClient.invalidateQueries({ queryKey: ["pending-approvals"] });
      queryClient.invalidateQueries({ queryKey: ["pending-approvals-count"] });
      queryClient.invalidateQueries({ queryKey: ["request-approval-steps"] });
      queryClient.invalidateQueries({ queryKey: ["leave-requests"] });
      toast.success("Leave request rejected");
    },
    onError: (error) => {
      console.error("Error rejecting leave request:", error);
      toast.error("Failed to reject leave request");
    },
  });
}
