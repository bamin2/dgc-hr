import { useState } from "react";
import { useApprovalWorkflows, useEmployeesWithUserIds } from "@/hooks/useApprovalWorkflows";
import { WorkflowEditor } from "./WorkflowEditor";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useUpdateApprovalWorkflow } from "@/hooks/useApprovalWorkflows";
import { RequestType } from "@/types/approvals";
import { GitBranch, Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const REQUEST_TYPE_LABELS: Record<RequestType, string> = {
  time_off: "Time Off Requests",
  loan: "Loan Requests",
  hr_letter: "HR Letter Requests",
  business_trip: "Business Trip Requests",
};

export function ApprovalSettingsTab() {
  const { data: workflows, isLoading } = useApprovalWorkflows();
  const { data: employees } = useEmployeesWithUserIds();
  const updateWorkflow = useUpdateApprovalWorkflow();
  const [open, setOpen] = useState(false);

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

  // Find the selected employee for display
  const selectedEmployee = employees?.find(e => e.user_id === defaultHRApproverId);

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
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  id="default-hr"
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-full justify-between font-normal mt-2"
                >
                  {selectedEmployee ? (
                    <span>{selectedEmployee.first_name} {selectedEmployee.last_name}</span>
                  ) : (
                    <span className="text-muted-foreground">Select an HR approver</span>
                  )}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[350px] p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search employees..." />
                  <CommandList>
                    <CommandEmpty>No employee found.</CommandEmpty>
                    <CommandGroup className="max-h-[300px] overflow-y-auto">
                      {employees?.map((employee) => (
                        <CommandItem
                          key={employee.id}
                          value={`${employee.first_name} ${employee.last_name} ${employee.email}`}
                          onSelect={() => {
                            handleDefaultHRChange(employee.user_id!);
                            setOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              defaultHRApproverId === employee.user_id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          <div className="flex flex-col">
                            <span>{employee.first_name} {employee.last_name}</span>
                            {employee.email && (
                              <span className="text-xs text-muted-foreground">
                                {employee.email}
                              </span>
                            )}
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
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
