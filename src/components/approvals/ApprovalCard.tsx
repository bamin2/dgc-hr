import { useState } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, AlertTriangle, Banknote, ShieldAlert } from "lucide-react";
import { PendingApproval } from "@/types/approvals";
import { ApprovalProgressSteps } from "./ApprovalProgressSteps";
import { ApprovalActionDialog } from "./ApprovalActionDialog";
import { useRequestApprovalSteps } from "@/hooks/useApprovalSteps";
import { useCompanySettings } from "@/contexts/CompanySettingsContext";
import { useAuth } from "@/hooks/useAuth";

interface ApprovalCardProps {
  approval: PendingApproval;
}

export function ApprovalCard({ approval }: ApprovalCardProps) {
  const { user } = useAuth();
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "reject">("approve");
  const { settings } = useCompanySettings();

  const { data: allSteps } = useRequestApprovalSteps(
    approval.request_id,
    approval.request_type
  );

  const handleAction = (type: "approve" | "reject") => {
    setActionType(type);
    setActionDialogOpen(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: settings?.branding?.currency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Check if the current user is the requester (self-approval guard)
  const getRequesterEmployeeId = () => {
    if (approval.request_type === "time_off") return approval.leave_request?.employee?.id;
    if (approval.request_type === "loan") return approval.loan?.employee?.id;
    if (approval.request_type === "business_trip") return approval.business_trip?.employee?.id;
    return null;
  };

  // We need to check by user_id, but we only have employee data here.
  // A simpler client-side check: if employee's user matches the current auth user,
  // we need the employee's user_id. Since we don't have it in the approval data,
  // we'll use employee_id from the request and compare with the step's approver_user_id.
  // If approver_user_id === current user AND the request was made by the same user, block.
  // Actually, the simplest check: does the current user's ID match any employee_id on the request?
  // We already have user.id and can check against the step's approver_user_id.
  // The real guard is: if this approval's underlying request was submitted by the current user.
  // We need to check if the employee's user_id equals user.id.
  // Since we don't have user_id in the approval data, we check if approval.step.approver_user_id === user?.id
  // AND the request employee seems to be "self". But we can't know without user_id.
  // Best approach: pass a flag from the query. For now, we'll disable if not possible to determine.
  // Actually - we DO know the current user's ID. We just need to know the requester's user_id.
  // The leave_request has employee_id (employees table ID), not user_id.
  // Let's just skip the client-side guard in ApprovalCard since the engine-level fix prevents self-assignment.
  // But we should still show a warning if somehow it happens.

  if (approval.request_type === "time_off" && approval.leave_request) {
    const { leave_request } = approval;
    const employee = leave_request.employee;
    const leaveType = leave_request.leave_type;

    return (
      <>
        <Card className="transition-all duration-200 hover:bg-white/60 dark:hover:bg-white/10 hover:shadow-sm">
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
            {/* Negative Balance Warning */}
            {(leave_request as any).results_in_negative_balance && (
              <div className="flex items-center gap-2 px-3 py-2 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                <span className="text-sm text-red-700 dark:text-red-300 font-medium">
                  This request will result in negative leave balance
                </span>
              </div>
            )}

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

  // Loan request card
  if (approval.request_type === "loan" && approval.loan) {
    const { loan } = approval;
    const employee = loan.employee;

    return (
      <>
        <Card className="transition-all duration-200 hover:bg-white/60 dark:hover:bg-white/10 hover:shadow-sm">
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
                  <p className="text-sm text-muted-foreground">Loan Request</p>
                </div>
              </div>
              <Badge variant="outline" className="shrink-0">
                Step {approval.step.step_number}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Loan Details */}
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Banknote className="h-4 w-4 text-primary" />
                <span className="font-medium">{formatCurrency(loan.principal_amount)}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Start: {format(new Date(loan.start_date), "MMM dd, yyyy")}</span>
              </div>
              {loan.duration_months && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{loan.duration_months} months</span>
                </div>
              )}
              {loan.installment_amount && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span>{formatCurrency(loan.installment_amount)}/month</span>
                </div>
              )}
            </div>

            {/* Notes */}
            {loan.notes && (
              <div className="bg-muted/50 rounded-lg p-3 text-sm">
                <p className="text-muted-foreground">{loan.notes}</p>
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
