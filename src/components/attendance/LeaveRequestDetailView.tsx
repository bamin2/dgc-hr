import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { LeaveStatusBadge } from './LeaveStatusBadge';
import { ApprovalProgressSteps } from '@/components/approvals/ApprovalProgressSteps';
import { LeaveRequest } from '@/hooks/useLeaveRequests';
import { RequestApprovalStep } from '@/types/approvals';
import { useAuth } from '@/hooks/useAuth';
import { useRole } from '@/contexts/RoleContext';
import { useApproveLeaveRequest, useRejectLeaveRequest } from '@/hooks/useLeaveRequests';
import { 
  Calendar, 
  Clock, 
  User, 
  FileText, 
  AlertTriangle,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface LeaveRequestDetailViewProps {
  request: LeaveRequest;
  approvalSteps: RequestApprovalStep[];
}

export function LeaveRequestDetailView({ request, approvalSteps }: LeaveRequestDetailViewProps) {
  const { profile } = useAuth();
  const { currentUser } = useRole();
  const approveLeave = useApproveLeaveRequest();
  const rejectLeave = useRejectLeaveRequest();
  
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const isHROrAdmin = currentUser.role === 'hr' || currentUser.role === 'admin';
  const isPending = request.status === 'pending';
  const canTakeAction = isHROrAdmin && isPending;

  const employeeName = request.employee 
    ? `${request.employee.first_name} ${request.employee.last_name}`
    : 'Unknown Employee';

  const employeeInitials = request.employee
    ? `${request.employee.first_name?.[0] || ''}${request.employee.last_name?.[0] || ''}`
    : '?';

  const handleApprove = () => {
    if (!profile?.id) return;
    approveLeave.mutate({ id: request.id, reviewerId: profile.id });
  };

  const handleReject = () => {
    if (!profile?.id || !rejectionReason.trim()) return;
    rejectLeave.mutate(
      { id: request.id, reviewerId: profile.id, rejectionReason: rejectionReason.trim() },
      { onSuccess: () => setShowRejectDialog(false) }
    );
  };

  const reviewerName = request.reviewer 
    ? `${request.reviewer.first_name} ${request.reviewer.last_name}`
    : null;

  return (
    <div className="space-y-6">
      {/* Status & Actions Bar */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <LeaveStatusBadge status={request.status} />
              {request.results_in_negative_balance && (
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Negative Balance
                </Badge>
              )}
            </div>
            
            {canTakeAction && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="text-destructive hover:bg-destructive/10"
                  onClick={() => setShowRejectDialog(true)}
                  disabled={rejectLeave.isPending}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
                <Button
                  onClick={handleApprove}
                  disabled={approveLeave.isPending}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Approve
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Leave Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              Leave Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Leave Type</p>
              <div className="flex items-center gap-2 mt-1">
                {request.leave_type?.color && (
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: request.leave_type.color }}
                  />
                )}
                <p className="font-medium">{request.leave_type?.name || 'Unknown'}</p>
                {request.leave_type?.is_paid === false && (
                  <Badge variant="outline" className="text-xs">Unpaid</Badge>
                )}
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Dates</p>
              <p className="font-medium mt-1">
                {format(new Date(request.start_date), 'MMM d, yyyy')}
                {request.start_date !== request.end_date && (
                  <> — {format(new Date(request.end_date), 'MMM d, yyyy')}</>
                )}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Duration</p>
              <p className="font-medium mt-1">
                {request.days_count} {request.days_count === 1 ? 'day' : 'days'}
                {request.is_half_day && ' (Half day)'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Request Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              Request Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Submitted By</p>
              <div className="flex items-center gap-3 mt-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={request.employee?.avatar_url || undefined} />
                  <AvatarFallback className="text-xs">{employeeInitials}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{employeeName}</p>
                  {request.employee?.department?.name && (
                    <p className="text-sm text-muted-foreground">
                      {request.employee.department.name}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Submitted On</p>
              <p className="font-medium mt-1">
                {format(new Date(request.created_at), "MMM d, yyyy 'at' h:mm a")}
              </p>
            </div>

            {reviewerName && request.reviewed_at && (
              <div>
                <p className="text-sm text-muted-foreground">Reviewed By</p>
                <p className="font-medium mt-1">{reviewerName}</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(request.reviewed_at), "MMM d, yyyy 'at' h:mm a")}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Reason */}
      {request.reason && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              Reason
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{request.reason}</p>
          </CardContent>
        </Card>
      )}

      {/* Approval Progress */}
      {approvalSteps.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              Approval Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ApprovalProgressSteps steps={approvalSteps} />
          </CardContent>
        </Card>
      )}

      {/* Rejection Reason */}
      {request.status === 'rejected' && request.rejection_reason && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 text-destructive">
              <XCircle className="h-4 w-4" />
              Rejection Reason
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{request.rejection_reason}</p>
          </CardContent>
        </Card>
      )}

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Leave Request</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this leave request. This will be visible to the employee.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rejection-reason">Rejection Reason</Label>
              <Textarea
                id="rejection-reason"
                placeholder="Enter the reason for rejection..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={!rejectionReason.trim() || rejectLeave.isPending}
            >
              {rejectLeave.isPending ? 'Rejecting...' : 'Reject Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
