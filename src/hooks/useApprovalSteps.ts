import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { RequestApprovalStep, PendingApproval, RequestType, ApprovalStepStatus } from "@/types/approvals";
import { toast } from "sonner";
import { queryKeys } from "@/lib/queryKeys";

// Fetch pending approvals for current user
export function usePendingApprovals() {
  return useQuery({
    queryKey: queryKeys.approvals.pending,
    queryFn: async (): Promise<PendingApproval[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // Fetch pending steps for current user
      const { data: steps, error: stepsError } = await supabase
        .from("request_approval_steps")
        .select("id, request_id, request_type, step_number, approver_type, approver_user_id, status, comment, acted_by, acted_at, created_at")
        .eq("approver_user_id", user.id)
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (stepsError) throw stepsError;
      if (!steps || steps.length === 0) return [];

      // Group by request type and fetch corresponding requests
      const pendingApprovals: PendingApproval[] = [];

      // Fetch leave requests for time_off steps
      const timeOffSteps = steps.filter((s) => s.request_type === "time_off");
      if (timeOffSteps.length > 0) {
        const requestIds = timeOffSteps.map((s) => s.request_id);
        const { data: leaveRequests, error: leaveError } = await supabase
          .from("leave_requests")
          .select(`
            *,
            employee:employees!leave_requests_employee_id_fkey(id, first_name, last_name, full_name, avatar_url),
            leave_type:leave_types(id, name, color)
          `)
          .in("id", requestIds);

        if (leaveError) throw leaveError;

        const leaveRequestMap = new Map(leaveRequests?.map((lr) => [lr.id, lr]));

        for (const step of timeOffSteps) {
          const leaveRequest = leaveRequestMap.get(step.request_id);
          if (leaveRequest) {
            pendingApprovals.push({
              step: {
                ...step,
                request_type: step.request_type as RequestType,
                approver_type: step.approver_type as RequestApprovalStep["approver_type"],
                status: step.status as ApprovalStepStatus,
              },
              request_type: "time_off",
              request_id: step.request_id,
              leave_request: {
                ...leaveRequest,
                employee: leaveRequest.employee as PendingApproval["leave_request"]["employee"],
                leave_type: leaveRequest.leave_type as PendingApproval["leave_request"]["leave_type"],
              },
            });
          }
        }
      }

      // Fetch business trips for business_trip steps
      const businessTripSteps = steps.filter((s) => s.request_type === "business_trip");
      if (businessTripSteps.length > 0) {
        const requestIds = businessTripSteps.map((s) => s.request_id);
        const { data: trips, error: tripError } = await supabase
          .from("business_trips")
          .select(`
            *,
            employee:employees!business_trips_employee_id_fkey(id, first_name, last_name, full_name, avatar_url),
            destination:business_trip_destinations(id, name, country, city)
          `)
          .in("id", requestIds);

        if (tripError) throw tripError;

        const tripMap = new Map(trips?.map((t) => [t.id, t]));

        for (const step of businessTripSteps) {
          const trip = tripMap.get(step.request_id);
          if (trip) {
            pendingApprovals.push({
              step: {
                ...step,
                request_type: step.request_type as RequestType,
                approver_type: step.approver_type as RequestApprovalStep["approver_type"],
                status: step.status as ApprovalStepStatus,
              },
              request_type: "business_trip",
              request_id: step.request_id,
              business_trip: {
                ...trip,
                employee: trip.employee as PendingApproval["business_trip"]["employee"],
                destination: trip.destination as PendingApproval["business_trip"]["destination"],
              },
            });
          }
        }
      }

      // Fetch loans for loan steps
      const loanSteps = steps.filter((s) => s.request_type === "loan");
      if (loanSteps.length > 0) {
        const requestIds = loanSteps.map((s) => s.request_id);
        const { data: loans, error: loanError } = await supabase
          .from("loans")
          .select(`
            *,
            employee:employees!loans_employee_id_fkey(id, first_name, last_name, full_name, avatar_url)
          `)
          .in("id", requestIds);

        if (loanError) throw loanError;

        const loanMap = new Map(loans?.map((l) => [l.id, l]));

        for (const step of loanSteps) {
          const loan = loanMap.get(step.request_id);
          if (loan) {
            pendingApprovals.push({
              step: {
                ...step,
                request_type: step.request_type as RequestType,
                approver_type: step.approver_type as RequestApprovalStep["approver_type"],
                status: step.status as ApprovalStepStatus,
              },
              request_type: "loan",
              request_id: step.request_id,
              loan: {
                ...loan,
                employee: loan.employee as PendingApproval["loan"]["employee"],
              },
            });
          }
        }
      }

      return pendingApprovals;
    },
  });
}

// Fetch approval steps for a specific request
export function useRequestApprovalSteps(requestId: string | null, requestType: RequestType | null) {
  return useQuery({
    queryKey: queryKeys.approvals.steps(requestId || '', requestType || ''),
    enabled: !!requestId && !!requestType,
    queryFn: async (): Promise<RequestApprovalStep[]> => {
      const { data, error } = await supabase
        .from("request_approval_steps")
        .select("id, request_id, request_type, step_number, approver_type, approver_user_id, status, comment, acted_by, acted_at, created_at")
        .eq("request_id", requestId!)
        .eq("request_type", requestType!)
        .order("step_number");

      if (error) throw error;

      // Fetch approver profiles separately
      const approverIds = (data || [])
        .filter((s) => s.approver_user_id)
        .map((s) => s.approver_user_id!);

      let approverMap = new Map<string, { id: string; first_name: string | null; last_name: string | null; email: string | null }>();
      
      if (approverIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, first_name, last_name, email")
          .in("id", approverIds);

        if (profiles) {
          approverMap = new Map(profiles.map((p) => [p.id, p]));
        }
      }

      return (data || []).map((step) => ({
        ...step,
        request_type: step.request_type as RequestType,
        approver_type: step.approver_type as RequestApprovalStep["approver_type"],
        status: step.status as ApprovalStepStatus,
        approver: step.approver_user_id ? approverMap.get(step.approver_user_id) : undefined,
      }));
    },
  });
}

// Approve a step
export function useApproveStep() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ stepId, comment }: { stepId: string; comment?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Get the step details
      const { data: step, error: stepError } = await supabase
        .from("request_approval_steps")
        .select("id, request_id, request_type, step_number, approver_type, approver_user_id, status, comment, acted_by, acted_at, created_at")
        .eq("id", stepId)
        .single();

      if (stepError) throw stepError;

      // Update the step to approved
      const { error: updateError } = await supabase
        .from("request_approval_steps")
        .update({
          status: "approved" as ApprovalStepStatus,
          acted_by: user.id,
          acted_at: new Date().toISOString(),
          comment,
        })
        .eq("id", stepId);

      if (updateError) throw updateError;

      // Check for next queued step
      const { data: nextStep, error: nextError } = await supabase
        .from("request_approval_steps")
        .select("id, request_id, request_type, step_number, status")
        .eq("request_id", step.request_id)
        .eq("request_type", step.request_type)
        .eq("status", "queued")
        .order("step_number")
        .limit(1)
        .single();

      if (nextError && nextError.code !== "PGRST116") throw nextError;

      if (nextStep) {
        // Activate next step
        await supabase
          .from("request_approval_steps")
          .update({ status: "pending" as ApprovalStepStatus })
          .eq("id", nextStep.id);
      } else {
        // All steps complete - approve the request
        if (step.request_type === "time_off") {
          await supabase
            .from("leave_requests")
            .update({
              status: "approved",
              reviewed_by: user.id,
              reviewed_at: new Date().toISOString(),
            })
            .eq("id", step.request_id);
        } else if (step.request_type === "business_trip") {
          await supabase
            .from("business_trips")
            .update({ status: "hr_approved" })
            .eq("id", step.request_id);
        } else if (step.request_type === "loan") {
          await supabase
            .from("loans")
            .update({
              status: "approved",
              approved_by: user.id,
              approved_at: new Date().toISOString(),
            })
            .eq("id", step.request_id);
        }
      }

      return { step, hasNextStep: !!nextStep };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.approvals.pending });
      queryClient.invalidateQueries({ queryKey: queryKeys.approvals.pendingCount });
      queryClient.invalidateQueries({ queryKey: ['request-approval-steps'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.leave.requests.all });
      queryClient.invalidateQueries({ queryKey: ['business-trips'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.loans.all });
      toast.success("Request approved");
    },
    onError: (error) => {
      console.error("Error approving step:", error);
      toast.error("Failed to approve request");
    },
  });
}

// Reject a step
export function useRejectStep() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ stepId, comment }: { stepId: string; comment: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Get the step details
      const { data: step, error: stepError } = await supabase
        .from("request_approval_steps")
        .select("id, request_id, request_type, step_number, status")
        .eq("id", stepId)
        .single();

      if (stepError) throw stepError;

      // Update the step to rejected
      const { error: updateError } = await supabase
        .from("request_approval_steps")
        .update({
          status: "rejected" as ApprovalStepStatus,
          acted_by: user.id,
          acted_at: new Date().toISOString(),
          comment,
        })
        .eq("id", stepId);

      if (updateError) throw updateError;

      // Cancel all remaining queued steps
      await supabase
        .from("request_approval_steps")
        .update({ status: "cancelled" as ApprovalStepStatus })
        .eq("request_id", step.request_id)
        .eq("request_type", step.request_type)
        .eq("status", "queued");

      // Reject the request
      if (step.request_type === "time_off") {
        await supabase
          .from("leave_requests")
          .update({
            status: "rejected",
            reviewed_by: user.id,
            reviewed_at: new Date().toISOString(),
            rejection_reason: comment,
          })
          .eq("id", step.request_id);
      } else if (step.request_type === "business_trip") {
        await supabase
          .from("business_trips")
          .update({
            status: "rejected",
            rejection_reason: comment,
          })
          .eq("id", step.request_id);
      } else if (step.request_type === "loan") {
        await supabase
          .from("loans")
          .update({
            status: "rejected",
            notes: comment,
          })
          .eq("id", step.request_id);
      }

      return { step };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.approvals.pending });
      queryClient.invalidateQueries({ queryKey: queryKeys.approvals.pendingCount });
      queryClient.invalidateQueries({ queryKey: ['request-approval-steps'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.leave.requests.all });
      queryClient.invalidateQueries({ queryKey: ['business-trips'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.loans.all });
      toast.success("Request rejected");
    },
    onError: (error) => {
      console.error("Error rejecting step:", error);
      toast.error("Failed to reject request");
    },
  });
}

// Get my submitted requests with their approval steps
export function useMyRequests() {
  return useQuery({
    queryKey: queryKeys.approvals.myRequests,
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // Get employee ID for current user from employees table (single source of truth)
      const { data: employee } = await supabase
        .from("employees")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!employee?.id) return [];

      // Get leave requests for this employee
      const { data: leaveRequests, error } = await supabase
        .from("leave_requests")
        .select(`
          *,
          leave_type:leave_types(id, name, color)
        `)
        .eq("employee_id", employee.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Get approval steps for all these requests
      const requestIds = leaveRequests?.map((lr) => lr.id) || [];
      let stepsMap = new Map<string, RequestApprovalStep[]>();

      if (requestIds.length > 0) {
        const { data: steps } = await supabase
          .from("request_approval_steps")
          .select("*")
          .in("request_id", requestIds)
          .eq("request_type", "time_off")
          .order("step_number");

        if (steps) {
          for (const step of steps) {
            const existing = stepsMap.get(step.request_id) || [];
            existing.push({
              ...step,
              request_type: step.request_type as RequestType,
              approver_type: step.approver_type as RequestApprovalStep["approver_type"],
              status: step.status as ApprovalStepStatus,
            });
            stepsMap.set(step.request_id, existing);
          }
        }
      }

      return leaveRequests?.map((lr) => ({
        ...lr,
        approval_steps: stepsMap.get(lr.id) || [],
      })) || [];
    },
  });
}

// Get team requests (for managers)
export function useTeamRequests() {
  return useQuery({
    queryKey: queryKeys.approvals.teamRequests,
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // Get employee ID for current user (the manager) from employees table (single source of truth)
      const { data: employee } = await supabase
        .from("employees")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!employee?.id) return [];

      // Get employees who report to this manager
      const { data: directReports, error: reportsError } = await supabase
        .from("employees")
        .select("id")
        .eq("manager_id", employee.id);

      if (reportsError) throw reportsError;
      if (!directReports || directReports.length === 0) return [];

      const reportIds = directReports.map((e) => e.id);

      // Get leave requests for direct reports
      const { data: leaveRequests, error } = await supabase
        .from("leave_requests")
        .select(`
          *,
          employee:employees!leave_requests_employee_id_fkey(id, first_name, last_name, full_name, avatar_url),
          leave_type:leave_types(id, name, color)
        `)
        .in("employee_id", reportIds)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Get approval steps for all these requests
      const requestIds = leaveRequests?.map((lr) => lr.id) || [];
      let stepsMap = new Map<string, RequestApprovalStep[]>();

      if (requestIds.length > 0) {
        const { data: steps } = await supabase
          .from("request_approval_steps")
          .select("*")
          .in("request_id", requestIds)
          .eq("request_type", "time_off")
          .order("step_number");

        if (steps) {
          for (const step of steps) {
            const existing = stepsMap.get(step.request_id) || [];
            existing.push({
              ...step,
              request_type: step.request_type as RequestType,
              approver_type: step.approver_type as RequestApprovalStep["approver_type"],
              status: step.status as ApprovalStepStatus,
            });
            stepsMap.set(step.request_id, existing);
          }
        }
      }

      return leaveRequests?.map((lr) => ({
        ...lr,
        approval_steps: stepsMap.get(lr.id) || [],
      })) || [];
    },
  });
}
