import { usePendingApprovals } from "@/hooks/useApprovalSteps";
import { ApprovalCard } from "./ApprovalCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Inbox } from "lucide-react";

export function PendingApprovalsTab() {
  const { data: pendingApprovals, isLoading } = usePendingApprovals();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-48 w-full" />
        ))}
      </div>
    );
  }

  if (!pendingApprovals || pendingApprovals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Inbox className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium">No pending approvals</h3>
        <p className="text-sm text-muted-foreground mt-1">
          You're all caught up! There are no requests waiting for your approval.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">
          {pendingApprovals.length} pending approval{pendingApprovals.length !== 1 ? "s" : ""}
        </span>
      </div>
      {pendingApprovals.map((approval) => (
        <ApprovalCard key={approval.step.id} approval={approval} />
      ))}
    </div>
  );
}
