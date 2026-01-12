import { useState } from "react";
import { formatShortDate, formatDisplayDate } from "@/lib/dateUtils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Clock, AlertCircle, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  useAllPendingLeaveRequests,
  useAdminApproveLeaveRequest,
  useAdminRejectLeaveRequest,
  AllPendingLeaveRequest,
} from "@/hooks/useAllPendingApprovals";

interface ActionDialogState {
  open: boolean;
  type: "approve" | "reject";
  request: AllPendingLeaveRequest | null;
}

export function AllPendingApprovalsTab() {
  const { data: pendingRequests, isLoading, error } = useAllPendingLeaveRequests();
  const approveRequest = useAdminApproveLeaveRequest();
  const rejectRequest = useAdminRejectLeaveRequest();

  const [actionDialog, setActionDialog] = useState<ActionDialogState>({
    open: false,
    type: "approve",
    request: null,
  });
  const [comment, setComment] = useState("");

  const handleAction = (request: AllPendingLeaveRequest, type: "approve" | "reject") => {
    setActionDialog({ open: true, type, request });
    setComment("");
  };

  const handleConfirm = async () => {
    if (!actionDialog.request) return;

    if (actionDialog.type === "approve") {
      await approveRequest.mutateAsync({
        requestId: actionDialog.request.id,
        comment: comment || undefined,
      });
    } else {
      if (!comment.trim()) return;
      await rejectRequest.mutateAsync({
        requestId: actionDialog.request.id,
        reason: comment,
      });
    }

    setActionDialog({ open: false, type: "approve", request: null });
    setComment("");
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-10 w-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-24 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8 text-destructive">
          <AlertCircle className="h-5 w-5 mr-2" />
          Failed to load pending requests
        </CardContent>
      </Card>
    );
  }

  if (!pendingRequests || pendingRequests.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-muted p-4 mb-4">
            <Calendar className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-medium text-lg mb-1">No Pending Requests</h3>
          <p className="text-sm text-muted-foreground">
            All time off requests have been processed.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {pendingRequests.length} pending request{pendingRequests.length !== 1 ? "s" : ""}
          </p>
          <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
            HR/Admin Override
          </Badge>
        </div>

        {pendingRequests.map((request) => (
          <LeaveRequestCard
            key={request.id}
            request={request}
            onApprove={() => handleAction(request, "approve")}
            onReject={() => handleAction(request, "reject")}
          />
        ))}
      </div>

      <Dialog open={actionDialog.open} onOpenChange={(open) => setActionDialog((prev) => ({ ...prev, open }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionDialog.type === "approve" ? "Approve Request" : "Reject Request"}
            </DialogTitle>
            <DialogDescription>
              {actionDialog.type === "approve"
                ? "This will override the normal approval workflow and approve the request immediately."
                : "Please provide a reason for rejecting this request. This is required."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="comment">
                {actionDialog.type === "approve" ? "Comment (optional)" : "Rejection Reason"}
              </Label>
              <Textarea
                id="comment"
                placeholder={
                  actionDialog.type === "approve"
                    ? "Add an optional comment..."
                    : "Enter the reason for rejection..."
                }
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setActionDialog({ open: false, type: "approve", request: null })}
            >
              Cancel
            </Button>
            <Button
              variant={actionDialog.type === "approve" ? "default" : "destructive"}
              onClick={handleConfirm}
              disabled={
                (actionDialog.type === "reject" && !comment.trim()) ||
                approveRequest.isPending ||
                rejectRequest.isPending
              }
            >
              {approveRequest.isPending || rejectRequest.isPending
                ? "Processing..."
                : actionDialog.type === "approve"
                ? "Approve"
                : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

interface LeaveRequestCardProps {
  request: AllPendingLeaveRequest;
  onApprove: () => void;
  onReject: () => void;
}

function LeaveRequestCard({ request, onApprove, onReject }: LeaveRequestCardProps) {
  const employee = request.employee;
  const leaveType = request.leave_type;

  return (
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
                {employee?.full_name || `${employee?.first_name} ${employee?.last_name}`}
              </h3>
              <p className="text-sm text-muted-foreground">Time Off Request</p>
            </div>
          </div>
          <Badge variant="outline" className="shrink-0 bg-amber-50 text-amber-700 border-amber-200">
            Pending
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Negative Balance Warning */}
        {(request as any).results_in_negative_balance && (
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
              {formatShortDate(request.start_date)}
              {request.start_date !== request.end_date && (
                <> - {formatDisplayDate(request.end_date)}</>
              )}
            </span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>
              {request.days_count} day{request.days_count !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* Reason */}
        {request.reason && (
          <div className="bg-muted/50 rounded-lg p-3 text-sm">
            <p className="text-muted-foreground">{request.reason}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button variant="outline" className="flex-1" onClick={onReject}>
            Reject
          </Button>
          <Button className="flex-1" onClick={onApprove}>
            Approve
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
