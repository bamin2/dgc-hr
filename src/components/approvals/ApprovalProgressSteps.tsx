import { Check, Clock, X, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { RequestApprovalStep } from "@/types/approvals";

interface ApprovalProgressStepsProps {
  steps: RequestApprovalStep[];
  currentStepId?: string;
}

export function ApprovalProgressSteps({ steps, currentStepId }: ApprovalProgressStepsProps) {
  const getStepIcon = (step: RequestApprovalStep) => {
    switch (step.status) {
      case "approved":
        return <Check className="h-3 w-3" />;
      case "rejected":
        return <X className="h-3 w-3" />;
      case "pending":
        return <Clock className="h-3 w-3" />;
      case "cancelled":
        return <X className="h-3 w-3" />;
      default:
        return <Circle className="h-3 w-3" />;
    }
  };

  const getStepColor = (step: RequestApprovalStep) => {
    switch (step.status) {
      case "approved":
        return "bg-emerald-500 text-white";
      case "rejected":
        return "bg-destructive text-white";
      case "pending":
        return "bg-amber-500 text-white";
      case "cancelled":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getApproverLabel = (step: RequestApprovalStep) => {
    if (step.approver) {
      const name = [step.approver.first_name, step.approver.last_name]
        .filter(Boolean)
        .join(" ");
      return name || step.approver.email || "Unknown";
    }
    
    switch (step.approver_type) {
      case "manager":
        return "Manager";
      case "hr":
        return "HR";
      case "specific_user":
        return "Designated Approver";
      default:
        return step.approver_type;
    }
  };

  const getStatusLabel = (step: RequestApprovalStep) => {
    switch (step.status) {
      case "approved":
        return "Approved";
      case "rejected":
        return "Rejected";
      case "pending":
        return "Pending";
      case "queued":
        return "Waiting";
      case "cancelled":
        return "Cancelled";
      case "skipped":
        return "Skipped";
      default:
        return step.status;
    }
  };

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        Approval Progress
      </p>
      <div className="flex items-center gap-2">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center",
                  getStepColor(step),
                  currentStepId === step.id && "ring-2 ring-primary ring-offset-2"
                )}
              >
                {getStepIcon(step)}
              </div>
              <div className="text-xs">
                <p className="font-medium">{getApproverLabel(step)}</p>
                <p className="text-muted-foreground">{getStatusLabel(step)}</p>
              </div>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "w-8 h-0.5 mx-2",
                  step.status === "approved" ? "bg-emerald-500" : "bg-muted"
                )}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
