import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { ApprovalWorkflow, ApprovalWorkflowStep, ApproverType } from "@/types/approvals";
import { useUpdateApprovalWorkflow, useAllUsers } from "@/hooks/useApprovalWorkflows";

interface WorkflowEditorProps {
  workflow: ApprovalWorkflow;
  label: string;
}

const APPROVER_TYPE_LABELS: Record<ApproverType, string> = {
  manager: "Manager",
  hr: "HR",
  specific_user: "Specific User",
};

export function WorkflowEditor({ workflow, label }: WorkflowEditorProps) {
  const [steps, setSteps] = useState<ApprovalWorkflowStep[]>(workflow.steps);
  const [isActive, setIsActive] = useState(workflow.is_active);
  const [hasChanges, setHasChanges] = useState(false);
  
  const updateWorkflow = useUpdateApprovalWorkflow();
  const { data: allUsers } = useAllUsers();

  const handleActiveChange = (active: boolean) => {
    setIsActive(active);
    setHasChanges(true);
  };

  const handleAddStep = () => {
    if (steps.length >= 3) return; // Max 3 steps
    const newStep: ApprovalWorkflowStep = {
      step: steps.length + 1,
      approver: "hr",
    };
    setSteps([...steps, newStep]);
    setHasChanges(true);
  };

  const handleRemoveStep = (index: number) => {
    const newSteps = steps
      .filter((_, i) => i !== index)
      .map((step, i) => ({ ...step, step: i + 1 }));
    setSteps(newSteps);
    setHasChanges(true);
  };

  const handleStepChange = (index: number, updates: Partial<ApprovalWorkflowStep>) => {
    const newSteps = steps.map((step, i) =>
      i === index ? { ...step, ...updates } : step
    );
    setSteps(newSteps);
    setHasChanges(true);
  };

  const handleSave = async () => {
    await updateWorkflow.mutateAsync({
      requestType: workflow.request_type,
      is_active: isActive,
      steps,
    });
    setHasChanges(false);
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{label}</CardTitle>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch
                id={`${workflow.id}-active`}
                checked={isActive}
                onCheckedChange={handleActiveChange}
              />
              <Label htmlFor={`${workflow.id}-active`} className="text-sm">
                {isActive ? "Active" : "Inactive"}
              </Label>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Steps */}
        <div className="space-y-3">
          {steps.map((step, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-3 border rounded-lg bg-muted/30"
            >
              <div className="flex items-center gap-2 text-muted-foreground">
                <GripVertical className="h-4 w-4" />
                <span className="text-sm font-medium">Step {step.step}</span>
              </div>
              
              <div className="flex-1 space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <Label className="text-xs">Approver Type</Label>
                    <Select
                      value={step.approver}
                      onValueChange={(value: ApproverType) =>
                        handleStepChange(index, { approver: value, specific_user_id: undefined })
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(APPROVER_TYPE_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {step.approver === "specific_user" && (
                    <div>
                      <Label className="text-xs">Select User</Label>
                      <Select
                        value={step.specific_user_id || ""}
                        onValueChange={(value) =>
                          handleStepChange(index, { specific_user_id: value })
                        }
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select user" />
                        </SelectTrigger>
                        <SelectContent>
                          {allUsers?.map((user) => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.first_name} {user.last_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                {step.approver === "manager" && (
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={`${workflow.id}-${index}-fallback`}
                      checked={step.fallback === "hr"}
                      onCheckedChange={(checked) =>
                        handleStepChange(index, { fallback: checked ? "hr" : undefined })
                      }
                    />
                    <Label
                      htmlFor={`${workflow.id}-${index}-fallback`}
                      className="text-sm text-muted-foreground"
                    >
                      Fallback to HR if no manager assigned
                    </Label>
                  </div>
                )}
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 text-muted-foreground hover:text-destructive"
                onClick={() => handleRemoveStep(index)}
                disabled={steps.length === 1}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        {/* Add Step Button */}
        <div className="flex items-center justify-between pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddStep}
            disabled={steps.length >= 3}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Step
            {steps.length >= 3 && (
              <span className="ml-2 text-xs text-muted-foreground">(max 3)</span>
            )}
          </Button>

          {hasChanges && (
            <Button
              size="sm"
              onClick={handleSave}
              disabled={updateWorkflow.isPending}
            >
              {updateWorkflow.isPending ? "Saving..." : "Save Changes"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
