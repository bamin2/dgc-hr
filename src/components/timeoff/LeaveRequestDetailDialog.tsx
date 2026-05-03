import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { LeaveRequest, LeaveRequestStatus } from "@/hooks/useLeaveRequests";
import { Calendar, Clock, FileText, User } from "lucide-react";

interface LeaveRequestDetailDialogProps {
  request: LeaveRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const statusStyles: Record<LeaveRequestStatus, string> = {
  approved: "bg-emerald-100 text-emerald-700 border-emerald-200",
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  rejected: "bg-red-100 text-red-700 border-red-200",
};

export function LeaveRequestDetailDialog({
  request,
  open,
  onOpenChange,
}: LeaveRequestDetailDialogProps) {
  if (!request) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Leave Request Details</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 pt-2">
          {/* Leave Type */}
          <div className="flex items-center gap-3">
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: request.leave_type?.color || '#6b7280' }}
            />
            <span className="font-medium text-lg">
              {request.leave_type?.name || 'Unknown Leave Type'}
            </span>
          </div>

          {/* Status */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Status:</span>
            <Badge
              variant="outline"
              className={cn("capitalize", statusStyles[request.status])}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5" />
              {request.status}
            </Badge>
          </div>

          {/* Dates */}
          <div className="flex items-start gap-3">
            <Calendar className="w-4 h-4 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm font-medium">
                {format(new Date(request.start_date), "MMM dd, yyyy")}
                {request.start_date !== request.end_date && (
                  <> — {format(new Date(request.end_date), "MMM dd, yyyy")}</>
                )}
              </p>
              <p className="text-sm text-muted-foreground">
                {request.days_count} day{request.days_count > 1 ? 's' : ''}
                {request.is_half_day && ' (Half day)'}
              </p>
            </div>
          </div>

          {/* Reason */}
          {request.reason && (
            <div className="flex items-start gap-3">
              <FileText className="w-4 h-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Reason</p>
                <p className="text-sm text-muted-foreground">{request.reason}</p>
              </div>
            </div>
          )}

          {/* Submitted Date */}
          <div className="flex items-start gap-3">
            <Clock className="w-4 h-4 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm font-medium">Submitted</p>
              <p className="text-sm text-muted-foreground">
                {format(new Date(request.created_at), "MMM dd, yyyy 'at' h:mm a")}
              </p>
            </div>
          </div>

          {/* Reviewer Info (for non-pending) */}
          {request.status !== 'pending' && request.reviewer && (
            <div className="flex items-start gap-3">
              <User className="w-4 h-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">
                  {request.status === 'approved' ? 'Approved' : 'Rejected'} by
                </p>
                <p className="text-sm text-muted-foreground">
                  {request.reviewer.first_name} {request.reviewer.last_name}
                  {request.reviewed_at && (
                    <> on {format(new Date(request.reviewed_at), "MMM dd, yyyy")}</>
                  )}
                </p>
              </div>
            </div>
          )}

          {/* Rejection Reason */}
          {request.status === 'rejected' && request.rejection_reason && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3">
              <p className="text-sm font-medium text-red-700">Rejection Reason</p>
              <p className="text-sm text-red-600 mt-1">{request.rejection_reason}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
