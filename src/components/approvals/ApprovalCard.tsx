import { useState } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User } from "lucide-react";
import { PendingApproval } from "@/types/approvals";
import { ApprovalProgressSteps } from "./ApprovalProgressSteps";
import { ApprovalActionDialog } from "./ApprovalActionDialog";
import { useRequestApprovalSteps } from "@/hooks/useApprovalSteps";

interface ApprovalCardProps {
  approval: PendingApproval;
}

export function ApprovalCard({ approval }: ApprovalCardProps) {
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "reject">("approve");

  const { data: allSteps } = useRequestApprovalSteps(
    approval.request_id,
    approval.request_type
  );

  const handleAction = (type: "approve" | "reject") => {
    setActionType(type);
    setActionDialogOpen(true);
  };

  if (approval.request_type === "time_off" && approval.leave_request) {
    const { leave_request } = approval;
    const employee = leave_request.employee;
    const leaveType = leave_request.leave_type;

    return (
      <>
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={employee?.avatar_url || undefined} />
                  <AvatarFallback>
                    {employee?.first_name?.[0]}
                    {employee?.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">
                    {employee?.full_name ||
                      `${employee?.first_name} ${employee?.last_name}`}
                  </h3>
                  <p className="text-sm text-muted-foreground">Time Off Request</p>
                </div>
              </div>
              <Badge variant="outline" className="shrink-0">
                Step {approval.step.step_number}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Leave Details */}
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: leaveType?.color || "#888" }}
                />
                <span className="font-medium">{leaveType?.name || "Leave"}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>
                  {format(new Date(leave_request.start_date), "MMM dd")}
                  {leave_request.start_date !== leave_request.end_date && (
                    <> - {format(new Date(leave_request.end_date), "MMM dd, yyyy")}</>
                  )}
                </span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>
                  {leave_request.days_count} day
                  {leave_request.days_count !== 1 ? "s" : ""}
                </span>
              </div>
            </div>

            {/* Reason */}
            {leave_request.reason && (
              <div className="bg-muted/50 rounded-lg p-3 text-sm">
                <p className="text-muted-foreground">{leave_request.reason}</p>
              </div>
            )}

            {/* Approval Progress */}
            {allSteps && allSteps.length > 0 && (
              <ApprovalProgressSteps
                steps={allSteps}
                currentStepId={approval.step.id}
              />
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => handleAction("reject")}
              >
                Reject
              </Button>
              <Button className="flex-1" onClick={() => handleAction("approve")}>
                Approve
              </Button>
            </div>
          </CardContent>
        </Card>

        <ApprovalActionDialog
          open={actionDialogOpen}
          onOpenChange={setActionDialogOpen}
          stepId={approval.step.id}
          actionType={actionType}
          requestType={approval.request_type}
        />
      </>
    );
  }

  // Fallback for other request types
  return (
    <Card>
      <CardContent className="p-6">
        <p className="text-muted-foreground">
          Unsupported request type: {approval.request_type}
        </p>
      </CardContent>
    </Card>
  );
}
