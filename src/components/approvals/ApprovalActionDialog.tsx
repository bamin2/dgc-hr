import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useApproveStep, useRejectStep } from "@/hooks/useApprovalSteps";
import { RequestType } from "@/types/approvals";

interface ApprovalActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stepId: string;
  actionType: "approve" | "reject";
  requestType: RequestType;
}

export function ApprovalActionDialog({
  open,
  onOpenChange,
  stepId,
  actionType,
  requestType,
}: ApprovalActionDialogProps) {
  const [comment, setComment] = useState("");
  const approveStep = useApproveStep();
  const rejectStep = useRejectStep();

  const isApproving = actionType === "approve";
  const isPending = approveStep.isPending || rejectStep.isPending;

  const handleSubmit = async () => {
    if (isApproving) {
      await approveStep.mutateAsync({ stepId, comment: comment || undefined });
    } else {
      if (!comment.trim()) {
        return; // Require comment for rejection
      }
      await rejectStep.mutateAsync({ stepId, comment });
    }
    setComment("");
    onOpenChange(false);
  };

  const getRequestTypeLabel = (type: RequestType) => {
    switch (type) {
      case "time_off":
        return "time off request";
      case "loan":
        return "loan request";
      case "hr_letter":
        return "HR letter request";
      default:
        return "request";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle>
            {isApproving ? "Approve" : "Reject"} Request
          </DialogTitle>
          <DialogDescription>
            {isApproving
              ? `Are you sure you want to approve this ${getRequestTypeLabel(requestType)}?`
              : `Please provide a reason for rejecting this ${getRequestTypeLabel(requestType)}.`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="comment">
              {isApproving ? "Comment (optional)" : "Reason for rejection"}
              {!isApproving && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Textarea
              id="comment"
              placeholder={
                isApproving
                  ? "Add a comment..."
                  : "Please explain why this request is being rejected..."
              }
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="liquidGlassSecondary"
            size="liquidGlassSecondary"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            variant={isApproving ? "liquidGlass" : "destructive"}
            size={isApproving ? "liquidGlass" : "lg"}
            onClick={handleSubmit}
            disabled={isPending || (!isApproving && !comment.trim())}
          >
            {isPending
              ? isApproving
                ? "Approving..."
                : "Rejecting..."
              : isApproving
              ? "Approve"
              : "Reject"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
