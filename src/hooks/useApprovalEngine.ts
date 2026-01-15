import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ApprovalWorkflowStep, RequestType } from "@/types/approvals";
import { toast } from "sonner";
import { queryKeys } from "@/lib/queryKeys";

interface InitiateApprovalParams {
  requestId: string;
  requestType: RequestType;
  employeeId: string;
}

// Get the user_id for an employee
async function getEmployeeUserId(employeeId: string): Promise<string | null> {
  const { data } = await supabase
    .from("employees")
    .select("user_id")
    .eq("id", employeeId)
    .single();
  
  return data?.user_id || null;
}

// Get the manager's user_id for an employee
async function getManagerUserId(employeeId: string): Promise<string | null> {
  const { data: employee } = await supabase
    .from("employees")
    .select("manager_id")
    .eq("id", employeeId)
    .single();

  if (!employee?.manager_id) return null;

  return getEmployeeUserId(employee.manager_id);
}

// Get a default HR approver
async function getDefaultHRApprover(workflowDefaultId?: string | null): Promise<string | null> {
  // First try workflow's default
  if (workflowDefaultId) return workflowDefaultId;

  // Get first user with HR or Admin role
  const { data: roleData } = await supabase
    .from("user_roles")
    .select("user_id")
    .in("role", ["hr", "admin"])
    .limit(1)
    .single();

  return roleData?.user_id || null;
}

// Hook to initiate approval workflow
export function useInitiateApproval() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ requestId, requestType, employeeId }: InitiateApprovalParams) => {
      // 1. Load workflow config
      const { data: workflow, error: workflowError } = await supabase
        .from("approval_workflows")
        .select("*")
        .eq("request_type", requestType)
        .single();

      if (workflowError) throw workflowError;

      // 2. If workflow is inactive, auto-approve
      if (!workflow.is_active) {
        if (requestType === "time_off") {
          await supabase
            .from("leave_requests")
            .update({ status: "approved" })
            .eq("id", requestId);
        } else if (requestType === "business_trip") {
          await supabase
            .from("business_trips")
            .update({ status: "hr_approved" })
            .eq("id", requestId);
        } else if (requestType === "loan") {
          const { data: { user } } = await supabase.auth.getUser();
          await supabase
            .from("loans")
            .update({
              status: "approved",
              approved_by: user?.id,
              approved_at: new Date().toISOString(),
            })
            .eq("id", requestId);
        }
        return { autoApproved: true };
      }

      const steps = (workflow.steps as unknown as ApprovalWorkflowStep[]) || [];
      if (steps.length === 0) {
        // No steps defined, auto-approve
        if (requestType === "time_off") {
          await supabase
            .from("leave_requests")
            .update({ status: "approved" })
            .eq("id", requestId);
        } else if (requestType === "business_trip") {
          await supabase
            .from("business_trips")
            .update({ status: "hr_approved" })
            .eq("id", requestId);
        } else if (requestType === "loan") {
          const { data: { user } } = await supabase.auth.getUser();
          await supabase
            .from("loans")
            .update({
              status: "approved",
              approved_by: user?.id,
              approved_at: new Date().toISOString(),
            })
            .eq("id", requestId);
        }
        return { autoApproved: true };
      }

      // 3. Get manager user_id if needed
      const managerUserId = await getManagerUserId(employeeId);

      // 4. Create approval steps
      let firstStepCreated = false;
      for (const stepConfig of steps) {
        let approverUserId: string | null = null;
        let effectiveApproverType = stepConfig.approver;

        if (stepConfig.approver === "manager") {
          if (managerUserId) {
            approverUserId = managerUserId;
          } else if (stepConfig.fallback === "hr") {
            // Fallback to HR
            approverUserId = await getDefaultHRApprover(workflow.default_hr_approver_id);
            effectiveApproverType = "hr";
          } else {
            // Skip this step if no manager and no fallback
            continue;
          }
        } else if (stepConfig.approver === "hr") {
          approverUserId = await getDefaultHRApprover(workflow.default_hr_approver_id);
        } else if (stepConfig.approver === "specific_user") {
          approverUserId = stepConfig.specific_user_id || null;
        }

        if (!approverUserId) {
          // Cannot resolve approver, skip step
          continue;
        }

        // First step is pending, rest are queued
        const status = !firstStepCreated ? "pending" : "queued";
        firstStepCreated = true;

        const { error: insertError } = await supabase
          .from("request_approval_steps")
          .insert({
            request_id: requestId,
            request_type: requestType,
            step_number: stepConfig.step,
            approver_type: effectiveApproverType,
            approver_user_id: approverUserId,
            status,
          });

        if (insertError) throw insertError;
      }

      // 5. If no steps were created (couldn't resolve any approvers), auto-approve
      if (!firstStepCreated) {
        if (requestType === "time_off") {
          await supabase
            .from("leave_requests")
            .update({ status: "approved" })
            .eq("id", requestId);
        } else if (requestType === "business_trip") {
          await supabase
            .from("business_trips")
            .update({ status: "hr_approved" })
            .eq("id", requestId);
        } else if (requestType === "loan") {
          const { data: { user } } = await supabase.auth.getUser();
          await supabase
            .from("loans")
            .update({
              status: "approved",
              approved_by: user?.id,
              approved_at: new Date().toISOString(),
            })
            .eq("id", requestId);
        }
        return { autoApproved: true };
      }

      // 6. Update request status to pending_approval
      if (requestType === "time_off") {
        await supabase
          .from("leave_requests")
          .update({
            status: "pending",
            submitted_at: new Date().toISOString(),
          })
          .eq("id", requestId);
      } else if (requestType === "business_trip") {
        await supabase
          .from("business_trips")
          .update({
            status: "submitted",
            submitted_at: new Date().toISOString(),
          })
          .eq("id", requestId);
      }
      // Loans stay in "requested" status until approved

      return { autoApproved: false };
    },
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leave.requests.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.approvals.pending });
      queryClient.invalidateQueries({ queryKey: queryKeys.approvals.pendingCount });
      queryClient.invalidateQueries({ queryKey: queryKeys.approvals.myRequests });
      
      // Also invalidate business trips queries if relevant
      if (variables.requestType === "business_trip") {
        queryClient.invalidateQueries({ queryKey: ['business-trips'] });
      }
      
      // Also invalidate loans queries if relevant
      if (variables.requestType === "loan") {
        queryClient.invalidateQueries({ queryKey: queryKeys.loans.all });
      }
      
      if (result.autoApproved) {
        toast.success("Request auto-approved (no approval workflow configured)");
      } else {
        toast.success("Request submitted for approval");
      }
    },
    onError: (error) => {
      console.error("Error initiating approval:", error);
      toast.error("Failed to submit request for approval");
    },
  });
}
