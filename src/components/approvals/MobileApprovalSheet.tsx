import { useState } from "react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useApproveStep, useRejectStep } from "@/hooks/useApprovalSteps";
import { RequestType } from "@/types/approvals";

interface MobileApprovalSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stepId: string;
  actionType: "approve" | "reject";
  requestType: RequestType;
  employeeName: string;
}

export function MobileApprovalSheet({
  open,
  onOpenChange,
  stepId,
  actionType,
  requestType,
  employeeName,
}: MobileApprovalSheetProps) {
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
      case "business_trip":
        return "business trip request";
      default:
        return "request";
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader className="text-left">
          <DrawerTitle>
            {isApproving ? "Approve" : "Reject"} Request
          </DrawerTitle>
          <DrawerDescription>
            {isApproving
              ? `Approve ${employeeName}'s ${getRequestTypeLabel(requestType)}?`
              : `Why are you rejecting ${employeeName}'s ${getRequestTypeLabel(requestType)}?`}
          </DrawerDescription>
        </DrawerHeader>

        <div className="px-6 py-4 space-y-4">
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

        <DrawerFooter>
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
              ? "Approve Request"
              : "Reject Request"}
          </Button>
          <DrawerClose asChild>
            <Button variant="liquidGlassSecondary" size="liquidGlassSecondary">
              Cancel
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
