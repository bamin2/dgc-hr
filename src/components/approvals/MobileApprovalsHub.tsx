import { usePendingApprovals } from "@/hooks/useApprovalSteps";
import { MobileApprovalCard } from "./MobileApprovalCard";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle } from "lucide-react";

export function MobileApprovalsHub() {
  const { data: pendingApprovals, isLoading } = usePendingApprovals();

  if (isLoading) {
    return (
      <div className="space-y-4 px-4 pb-24">
        <div className="pt-2">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-52 mt-1" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-44 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!pendingApprovals || pendingApprovals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-4">
          <CheckCircle className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h3 className="text-lg font-medium">All caught up!</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-xs">
          No pending approvals at the moment. We'll notify you when new requests arrive.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-24">
      {/* Header */}
      <div className="px-4 pt-2">
        <h1 className="text-xl font-semibold">Pending Approvals</h1>
        <p className="text-sm text-muted-foreground">
          {pendingApprovals.length} awaiting your decision
        </p>
      </div>

      {/* Approval Cards */}
      <div className="space-y-3 px-4">
        {pendingApprovals.map((approval) => (
          <MobileApprovalCard key={approval.step.id} approval={approval} />
        ))}
      </div>
    </div>
  );
}
