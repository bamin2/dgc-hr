import { useApprovalWorkflows, useHRUsers } from "@/hooks/useApprovalWorkflows";
import { WorkflowEditor } from "./WorkflowEditor";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUpdateApprovalWorkflow } from "@/hooks/useApprovalWorkflows";
import { RequestType } from "@/types/approvals";
import { GitBranch } from "lucide-react";

const REQUEST_TYPE_LABELS: Record<RequestType, string> = {
  time_off: "Time Off Requests",
  loan: "Loan Requests",
  hr_letter: "HR Letter Requests",
};

export function ApprovalSettingsTab() {
  const { data: workflows, isLoading } = useApprovalWorkflows();
  const { data: hrUsers } = useHRUsers();
  const updateWorkflow = useUpdateApprovalWorkflow();

  // Find current default HR approver from time_off workflow
  const timeOffWorkflow = workflows?.find((w) => w.request_type === "time_off");
  const defaultHRApproverId = timeOffWorkflow?.default_hr_approver_id || "";

  const handleDefaultHRChange = async (userId: string) => {
    // Update all workflows with the new default HR approver
    if (workflows) {
      for (const workflow of workflows) {
        await updateWorkflow.mutateAsync({
          requestType: workflow.request_type,
          default_hr_approver_id: userId || null,
        });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <GitBranch className="h-5 w-5" />
          Approval Workflows
        </h2>
        <p className="text-sm text-muted-foreground">
          Configure how requests are routed for approval
        </p>
      </div>

      {/* Default HR Approver */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Default HR Approver</CardTitle>
          <CardDescription>
            This person will receive HR approval requests when no specific approver is assigned
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="max-w-sm">
            <Label htmlFor="default-hr">Select default HR approver</Label>
            <Select
              value={defaultHRApproverId}
              onValueChange={handleDefaultHRChange}
            >
              <SelectTrigger id="default-hr" className="mt-2">
                <SelectValue placeholder="Select an HR approver" />
              </SelectTrigger>
              <SelectContent>
                {hrUsers?.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.first_name} {user.last_name}
                    {user.email && (
                      <span className="text-muted-foreground ml-2">
                        ({user.email})
                      </span>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Workflow Editors */}
      {workflows?.map((workflow) => (
        <WorkflowEditor
          key={workflow.id}
          workflow={workflow}
          label={REQUEST_TYPE_LABELS[workflow.request_type]}
        />
      ))}
    </div>
  );
}
