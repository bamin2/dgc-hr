import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ApprovalWorkflowStep, RequestType, ApprovalInitiationResult } from "@/types/approvals";
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

// Walk the manager chain starting from `managerId` up to MAX_DEPTH levels.
// Returns true if `employeeId` appears in that chain (cycle detected).
async function isCircularManager(employeeId: string, managerId: string): Promise<boolean> {
  const MAX_DEPTH = 5;
  let current: string | null = managerId;
  const visited = new Set<string>([employeeId]);

  for (let depth = 0; depth < MAX_DEPTH && current; depth++) {
    if (visited.has(current)) return true;
    visited.add(current);

    const { data } = await supabase
      .from('employees')
      .select('manager_id')
      .eq('id', current)
      .single();

    current = (data?.manager_id as string | null) ?? null;
  }
  return false;
}

// Get a default HR approver, optionally excluding a specific user (to prevent self-approval)
async function getDefaultHRApprover(workflowDefaultId?: string | null, excludeUserId?: string | null): Promise<string | null> {
  // First try workflow's default (only if it's not the excluded user)
  if (workflowDefaultId && workflowDefaultId !== excludeUserId) return workflowDefaultId;

  // Get first user with HR or Admin role, excluding the requester
  const query = supabase
    .from("user_roles")
    .select("user_id")
    .in("role", ["hr", "admin"])
    .limit(1);

  if (excludeUserId) {
    query.neq("user_id", excludeUserId);
  }

  const { data: roleData } = await query.single();

  return roleData?.user_id || null;
}

// Hook to initiate approval workflow
export function useInitiateApproval() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ requestId, requestType, employeeId }: InitiateApprovalParams) => {
      // 0. Get the requester's user_id to prevent self-approval
      const requesterUserId = await getEmployeeUserId(employeeId);

      // 1. Load workflow config
      const { data: workflow, error: workflowError } = await supabase
        .from("approval_workflows")
        .select("*")
        .eq("request_type", requestType)
        .single();

      if (workflowError) throw workflowError;

      // 2. If workflow is inactive — block, do not auto-approve.
      if (!workflow.is_active) {
        return { autoApproved: false, blocked: true, reason: 'workflow_inactive' } satisfies ApprovalInitiationResult;
      }

      const steps = (workflow.steps as unknown as ApprovalWorkflowStep[]) || [];
      if (steps.length === 0) {
        return { autoApproved: false, blocked: true, reason: 'no_steps' } satisfies ApprovalInitiationResult;
      }

      // 3. Get manager user_id if needed
      const managerUserId = await getManagerUserId(employeeId);

      // 4. Create approval steps
      let firstStepCreated = false;
      for (const stepConfig of steps) {
        let approverUserId: string | null = null;
        let effectiveApproverType = stepConfig.approver;

        if (stepConfig.approver === "manager") {
          if (managerUserId && managerUserId !== requesterUserId) {
            approverUserId = managerUserId;
          } else if (stepConfig.fallback === "hr") {
            // Fallback to HR (exclude requester to prevent self-approval)
            approverUserId = await getDefaultHRApprover(workflow.default_hr_approver_id, requesterUserId);
            effectiveApproverType = "hr";
          } else {
            // Skip this step if no manager and no fallback
            continue;
          }
        } else if (stepConfig.approver === "hr") {
          approverUserId = await getDefaultHRApprover(workflow.default_hr_approver_id, requesterUserId);
        } else if (stepConfig.approver === "specific_user") {
          approverUserId = stepConfig.specific_user_id || null;
          // If specific user is the requester, skip
          if (approverUserId === requesterUserId) {
            continue;
          }
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

      // 5. If no steps were created, try a last-resort default HR approver.
      if (!firstStepCreated) {
        const fallbackHrUserId = await getDefaultHRApprover(
          workflow.default_hr_approver_id,
          requesterUserId,
        );

        if (fallbackHrUserId) {
          const { error: insertError } = await supabase
            .from("request_approval_steps")
            .insert({
              request_id: requestId,
              request_type: requestType,
              step_number: 1,
              approver_type: "hr",
              approver_user_id: fallbackHrUserId,
              status: "pending",
            });
          if (insertError) throw insertError;
          firstStepCreated = true;
        } else {
          return { autoApproved: false, blocked: true, reason: 'no_approver' } satisfies ApprovalInitiationResult;
        }
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

      return { autoApproved: false, blocked: false } satisfies ApprovalInitiationResult;
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
      
      if (result.blocked) {
        switch (result.reason) {
          case 'workflow_inactive':
            toast.error("Approval workflow is inactive. Please contact HR to enable it.");
            break;
          case 'no_steps':
            toast.error("Approval workflow has no steps configured. Please contact HR.");
            break;
          case 'no_approver':
            toast.error("No approver could be assigned. Please contact HR.");
            break;
          default:
            toast.error("Request could not be submitted for approval. Please contact HR.");
        }
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
