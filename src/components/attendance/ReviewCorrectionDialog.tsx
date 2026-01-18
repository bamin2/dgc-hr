import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useManagerReviewCorrection, useHRReviewCorrection } from '@/hooks/useAttendanceCorrections';
import type { AttendanceCorrection } from '@/hooks/useAttendanceCorrections';
import { format } from 'date-fns';
import { ArrowRight, Clock, AlertCircle } from 'lucide-react';

interface ReviewCorrectionDialogProps {
  correction: AttendanceCorrection;
  reviewerType: 'manager' | 'hr';
  reviewerId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReviewCorrectionDialog({
  correction,
  reviewerType,
  reviewerId,
  open,
  onOpenChange,
}: ReviewCorrectionDialogProps) {
  const [notes, setNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejection, setShowRejection] = useState(false);

  const managerReview = useManagerReviewCorrection();
  const hrReview = useHRReviewCorrection();

  const isPending = managerReview.isPending || hrReview.isPending;

  const handleApprove = async () => {
    if (reviewerType === 'manager') {
      await managerReview.mutateAsync({
        correctionId: correction.id,
        approved: true,
        managerId: reviewerId,
        notes: notes || undefined,
      });
    } else {
      await hrReview.mutateAsync({
        correctionId: correction.id,
        approved: true,
        hrReviewerId: reviewerId,
        notes: notes || undefined,
      });
    }
    onOpenChange(false);
    resetForm();
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) return;

    if (reviewerType === 'manager') {
      await managerReview.mutateAsync({
        correctionId: correction.id,
        approved: false,
        managerId: reviewerId,
        notes: notes || undefined,
        rejectionReason: rejectionReason.trim(),
      });
    } else {
      await hrReview.mutateAsync({
        correctionId: correction.id,
        approved: false,
        hrReviewerId: reviewerId,
        notes: notes || undefined,
        rejectionReason: rejectionReason.trim(),
      });
    }
    onOpenChange(false);
    resetForm();
  };

  const resetForm = () => {
    setNotes('');
    setRejectionReason('');
    setShowRejection(false);
  };

  const employee = correction.employee;
  const formattedDate = format(new Date(correction.date), 'EEEE, MMMM d, yyyy');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle>Review Attendance Correction</DialogTitle>
          <DialogDescription>
            {reviewerType === 'manager' 
              ? 'Review this correction request. If approved, it will be forwarded to HR for final approval.'
              : 'Review this correction request. If approved, the changes will be applied immediately.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Employee Info */}
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={employee?.avatar_url || undefined} />
              <AvatarFallback>
                {employee?.first_name?.[0]}{employee?.last_name?.[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{employee?.first_name} {employee?.last_name}</p>
              <p className="text-sm text-muted-foreground">{employee?.department?.name || 'No Department'}</p>
            </div>
          </div>

          <Separator />

          {/* Date */}
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{formattedDate}</span>
          </div>

          {/* Time Comparison */}
          <div className="rounded-lg border p-4 space-y-3">
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">Original</p>
                <p className="font-mono text-sm">
                  {correction.original_check_in || '--:--'} - {correction.original_check_out || '--:--'}
                </p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">Requested</p>
                <p className="font-mono text-sm font-medium text-primary">
                  {correction.corrected_check_in} - {correction.corrected_check_out || '--:--'}
                </p>
              </div>
            </div>
          </div>

          {/* Reason */}
          <div className="space-y-1">
            <p className="text-sm font-medium">Reason for Correction</p>
            <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
              {correction.reason}
            </p>
          </div>

          {/* Manager Notes (for HR review) */}
          {reviewerType === 'hr' && correction.manager_notes && (
            <div className="space-y-1">
              <p className="text-sm font-medium">Manager Notes</p>
              <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
                {correction.manager_notes}
              </p>
            </div>
          )}

          {/* Notes Input */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>

          {/* Rejection Reason */}
          {showRejection && (
            <div className="space-y-2">
              <Label htmlFor="rejection-reason" className="flex items-center gap-1 text-destructive">
                <AlertCircle className="h-3 w-3" />
                Rejection Reason (Required)
              </Label>
              <Textarea
                id="rejection-reason"
                placeholder="Explain why this correction is being rejected..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={2}
              />
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          {!showRejection ? (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowRejection(true)}
                disabled={isPending}
              >
                Reject
              </Button>
              <Button type="button" onClick={handleApprove} disabled={isPending}>
                {isPending ? 'Processing...' : reviewerType === 'manager' ? 'Approve & Forward to HR' : 'Approve & Apply'}
              </Button>
            </>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowRejection(false)}
                disabled={isPending}
              >
                Back
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleReject}
                disabled={isPending || !rejectionReason.trim()}
              >
                {isPending ? 'Processing...' : 'Confirm Rejection'}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
