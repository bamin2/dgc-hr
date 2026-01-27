import { useNavigate } from "react-router-dom";
import { ClipboardCheck, Clock, CheckCircle2, XCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BentoCard } from "./BentoCard";
import { useTeamDashboard } from "@/hooks/useTeamDashboard";
import { useAdminDashboard } from "@/hooks/useAdminDashboard";
import { useRole } from "@/contexts/RoleContext";

export function ApprovalsSummaryCard() {
  const navigate = useNavigate();
  const { effectiveTeamMemberIds, canEditEmployees } = useRole();
  
  // Use team dashboard for managers, admin dashboard for HR/Admin
  const { data: teamData, isLoading: teamLoading } = useTeamDashboard(effectiveTeamMemberIds);
  const { data: adminData, isLoading: adminLoading } = useAdminDashboard();

  const isLoading = canEditEmployees ? adminLoading : teamLoading;
  
  // Get pending counts based on role
  const pendingLeave = canEditEmployees 
    ? (adminData?.pendingApprovals.leaveRequests || 0)
    : (teamData?.pendingApprovals.leaveRequests || 0);
  
  const pendingLoans = canEditEmployees 
    ? (adminData?.pendingApprovals.loanRequests || 0) 
    : 0;

  const totalPending = pendingLeave + pendingLoans;

  if (isLoading) {
    return (
      <BentoCard colSpan={3}>
        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="w-5 h-5 rounded" />
          <Skeleton className="h-5 w-28" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-9 w-full rounded-full" />
        </div>
      </BentoCard>
    );
  }

  return (
    <BentoCard colSpan={3}>
      <div className="flex items-center gap-2 mb-4">
        <ClipboardCheck className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-foreground">Pending Approvals</h3>
      </div>

      <div className="bg-secondary/30 rounded-xl p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-500" />
            <span className="text-sm text-muted-foreground">Awaiting review</span>
          </div>
          <span className="text-xl sm:text-2xl font-bold text-foreground">{totalPending}</span>
        </div>
        
        {totalPending > 0 && (
          <div className="mt-3 pt-3 border-t border-border/50 space-y-1">
            {pendingLeave > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Leave requests</span>
                <span className="font-medium">{pendingLeave}</span>
              </div>
            )}
            {pendingLoans > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Loan requests</span>
                <span className="font-medium">{pendingLoans}</span>
              </div>
            )}
          </div>
        )}
      </div>

      <Button 
        variant="outline" 
        className="w-full rounded-full gap-2"
        onClick={() => navigate("/approvals")}
      >
        Go to Approvals
        <ArrowRight className="w-4 h-4" />
      </Button>
    </BentoCard>
  );
}
