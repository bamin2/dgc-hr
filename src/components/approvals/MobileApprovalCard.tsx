import { useState } from "react";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Calendar, Banknote, Plane, ChevronDown, AlertTriangle } from "lucide-react";
import { PendingApproval } from "@/types/approvals";
import { MobileApprovalSheet } from "./MobileApprovalSheet";
import { useCompanySettings } from "@/contexts/CompanySettingsContext";
import { cn } from "@/lib/utils";

interface MobileApprovalCardProps {
  approval: PendingApproval;
}

export function MobileApprovalCard({ approval }: MobileApprovalCardProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "reject">("approve");
  const [reasonExpanded, setReasonExpanded] = useState(false);
  const { settings } = useCompanySettings();

  const handleAction = (type: "approve" | "reject") => {
    setActionType(type);
    setSheetOpen(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: settings?.branding?.currency || "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Time Off Request Card
  if (approval.request_type === "time_off" && approval.leave_request) {
    const { leave_request } = approval;
    const employee = leave_request.employee;
    const leaveType = leave_request.leave_type;
    const hasNegativeBalance = (leave_request as any).results_in_negative_balance;

    return (
      <>
        <Card className="overflow-hidden transition-all duration-200 hover:bg-white/60 dark:hover:bg-white/10 hover:shadow-sm">
          <CardContent className="p-4 space-y-3">
            {/* Header Row */}
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={employee?.avatar_url || undefined} />
                <AvatarFallback className="text-sm">
                  {employee?.first_name?.[0]}
                  {employee?.last_name?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-base truncate">
                  {employee?.full_name ||
                    `${employee?.first_name} ${employee?.last_name}`}
                </h3>
                <div className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: leaveType?.color || "#888" }}
                  />
                  <span className="text-sm text-muted-foreground truncate">
                    {leaveType?.name || "Leave"}
                  </span>
                </div>
              </div>
            </div>

            {/* Warning for negative balance */}
            {hasNegativeBalance && (
              <div className="flex items-center gap-2 px-3 py-2 bg-destructive/10 border border-destructive/20 rounded-xl">
                <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
                <span className="text-xs text-destructive font-medium">
                  Negative balance warning
                </span>
              </div>
            )}

            {/* Key Details - Compact */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                <span>
                  {format(new Date(leave_request.start_date), "MMM d")}
                  {leave_request.start_date !== leave_request.end_date && (
                    <> - {format(new Date(leave_request.end_date), "MMM d")}</>
                  )}
                </span>
              </div>
              <Badge variant="secondary" className="font-normal">
                {leave_request.days_count} day{leave_request.days_count !== 1 ? "s" : ""}
              </Badge>
            </div>

            {/* Reason (collapsible) */}
            {leave_request.reason && (
              <Collapsible open={reasonExpanded} onOpenChange={setReasonExpanded}>
                <CollapsibleTrigger className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transition-transform",
                      reasonExpanded && "rotate-180"
                    )}
                  />
                  <span>{reasonExpanded ? "Hide" : "Show"} reason</span>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="mt-2 p-3 bg-muted/50 rounded-xl text-sm text-muted-foreground">
                    {leave_request.reason}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}

            {/* Actions - Large Touch Targets */}
            <div className="flex gap-3 pt-1">
              <Button
                variant="outline"
                className="flex-1 h-12"
                onClick={() => handleAction("reject")}
              >
                Reject
              </Button>
              <Button
                className="flex-1 h-12"
                onClick={() => handleAction("approve")}
              >
                Approve
              </Button>
            </div>
          </CardContent>
        </Card>

        <MobileApprovalSheet
          open={sheetOpen}
          onOpenChange={setSheetOpen}
          stepId={approval.step.id}
          actionType={actionType}
          requestType={approval.request_type}
          employeeName={
            employee?.full_name ||
            `${employee?.first_name} ${employee?.last_name}`
          }
        />
      </>
    );
  }

  // Business Trip Request Card
  if (approval.request_type === "business_trip" && approval.business_trip) {
    const { business_trip } = approval;
    const employee = business_trip.employee;
    const destination = business_trip.destination;

    return (
      <>
        <Card className="overflow-hidden transition-all duration-200 hover:bg-white/60 dark:hover:bg-white/10 hover:shadow-sm">
          <CardContent className="p-4 space-y-3">
            {/* Header Row */}
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={employee?.avatar_url || undefined} />
                <AvatarFallback className="text-sm">
                  {employee?.first_name?.[0]}
                  {employee?.last_name?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-base truncate">
                  {employee?.full_name ||
                    `${employee?.first_name} ${employee?.last_name}`}
                </h3>
                <div className="flex items-center gap-2">
                  <Plane className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground truncate">
                    {destination?.name || destination?.city || "Business Trip"}
                  </span>
                </div>
              </div>
            </div>

            {/* Key Details - Compact */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                <span>
                  {format(new Date(business_trip.start_date), "MMM d")}
                  {business_trip.start_date !== business_trip.end_date && (
                    <> - {format(new Date(business_trip.end_date), "MMM d")}</>
                  )}
                </span>
              </div>
              <Badge variant="secondary" className="font-normal">
                {business_trip.nights_count} night{business_trip.nights_count !== 1 ? "s" : ""}
              </Badge>
            </div>

            {/* Actions - Large Touch Targets */}
            <div className="flex gap-3 pt-1">
              <Button
                variant="outline"
                className="flex-1 h-12"
                onClick={() => handleAction("reject")}
              >
                Reject
              </Button>
              <Button
                className="flex-1 h-12"
                onClick={() => handleAction("approve")}
              >
                Approve
              </Button>
            </div>
          </CardContent>
        </Card>

        <MobileApprovalSheet
          open={sheetOpen}
          onOpenChange={setSheetOpen}
          stepId={approval.step.id}
          actionType={actionType}
          requestType={approval.request_type}
          employeeName={
            employee?.full_name ||
            `${employee?.first_name} ${employee?.last_name}`
          }
        />
      </>
    );
  }

  // Loan Request Card
  if (approval.request_type === "loan" && approval.loan) {
    const { loan } = approval;
    const employee = loan.employee;

    return (
      <>
        <Card className="overflow-hidden transition-all duration-200 hover:bg-white/60 dark:hover:bg-white/10 hover:shadow-sm">
          <CardContent className="p-4 space-y-3">
            {/* Header Row */}
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={employee?.avatar_url || undefined} />
                <AvatarFallback className="text-sm">
                  {employee?.first_name?.[0]}
                  {employee?.last_name?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-base truncate">
                  {employee?.full_name ||
                    `${employee?.first_name} ${employee?.last_name}`}
                </h3>
                <div className="flex items-center gap-2">
                  <Banknote className="h-3.5 w-3.5 text-primary" />
                  <span className="text-sm font-medium text-primary">
                    {formatCurrency(loan.principal_amount)}
                  </span>
                </div>
              </div>
            </div>

            {/* Key Details - Compact */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                <span>Start: {format(new Date(loan.start_date), "MMM d, yyyy")}</span>
              </div>
              {loan.duration_months && (
                <Badge variant="secondary" className="font-normal">
                  {loan.duration_months} months
                </Badge>
              )}
            </div>

            {/* Notes (collapsible) */}
            {loan.notes && (
              <Collapsible open={reasonExpanded} onOpenChange={setReasonExpanded}>
                <CollapsibleTrigger className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transition-transform",
                      reasonExpanded && "rotate-180"
                    )}
                  />
                  <span>{reasonExpanded ? "Hide" : "Show"} notes</span>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="mt-2 p-3 bg-muted/50 rounded-xl text-sm text-muted-foreground">
                    {loan.notes}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}

            {/* Actions - Large Touch Targets */}
            <div className="flex gap-3 pt-1">
              <Button
                variant="outline"
                className="flex-1 h-12"
                onClick={() => handleAction("reject")}
              >
                Reject
              </Button>
              <Button
                className="flex-1 h-12"
                onClick={() => handleAction("approve")}
              >
                Approve
              </Button>
            </div>
          </CardContent>
        </Card>

        <MobileApprovalSheet
          open={sheetOpen}
          onOpenChange={setSheetOpen}
          stepId={approval.step.id}
          actionType={actionType}
          requestType={approval.request_type}
          employeeName={
            employee?.full_name ||
            `${employee?.first_name} ${employee?.last_name}`
          }
        />
      </>
    );
  }

  // Fallback
  return null;
}
