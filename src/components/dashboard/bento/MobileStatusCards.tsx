import { useNavigate } from "react-router-dom";
import { CalendarCheck, Clock, Wallet } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { usePersonalDashboard } from "@/hooks/usePersonalDashboard";
import { formatCurrencyWithCode } from "@/lib/salaryUtils";
import { Skeleton } from "@/components/ui/skeleton";

interface StatusCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  subValue?: string;
  highlight?: boolean;
  onClick: () => void;
  color: string;
}

function StatusCard({ icon: Icon, label, value, subValue, highlight, onClick, color }: StatusCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-start gap-2 p-4 rounded-2xl",
        "bg-card/80 border border-border/50",
        "hover:bg-card/90 active:scale-[0.98]",
        "transition-all duration-150 touch-manipulation",
        "min-h-[88px] w-full text-left"
      )}
    >
      <div className={cn(
        "w-10 h-10 rounded-xl flex items-center justify-center",
        color
      )}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="space-y-0.5">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={cn(
          "text-sm font-semibold text-foreground",
          highlight && "text-primary"
        )}>
          {value}
        </p>
        {subValue && (
          <p className="text-xs text-muted-foreground">{subValue}</p>
        )}
      </div>
    </button>
  );
}

function StatusCardSkeleton() {
  return (
    <div className="flex flex-col items-start gap-2 p-4 rounded-2xl bg-card/80 border border-border/50 min-h-[88px]">
      <Skeleton className="w-10 h-10 rounded-xl" />
      <div className="space-y-1">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-4 w-20" />
      </div>
    </div>
  );
}

/**
 * Horizontal row of quick status cards for mobile dashboard
 * Shows: Next Leave, Pending Requests, Loan Balance (if applicable)
 */
export function MobileStatusCards() {
  const navigate = useNavigate();
  const { data, isLoading } = usePersonalDashboard();

  if (isLoading) {
    return (
      <div className="col-span-12 px-4">
        <div className="grid grid-cols-2 gap-3">
          <StatusCardSkeleton />
          <StatusCardSkeleton />
        </div>
      </div>
    );
  }

  // Get next upcoming leave
  const nextLeave = data?.upcomingTimeOff?.[0];
  const nextLeaveDisplay = nextLeave
    ? format(new Date(nextLeave.startDate), "MMM d")
    : "None scheduled";
  const nextLeaveType = nextLeave?.leaveTypeName || "";

  // Get pending requests count
  const pendingCount = data?.requestsSummary?.pending || 0;

  // Get loan info (only show if has active loans)
  const hasLoan = data?.activeLoans && data.activeLoans.length > 0;
  const totalLoanBalance = data?.activeLoans?.reduce(
    (sum, loan) => sum + loan.outstandingBalance, 0
  ) || 0;
  const loanCurrency = data?.loanCurrency || "SAR";

  return (
    <div className="col-span-12 px-4">
      <div className={cn(
        "grid gap-3",
        hasLoan ? "grid-cols-2" : "grid-cols-2"
      )}>
        {/* Next Leave */}
        <StatusCard
          icon={CalendarCheck}
          label="Next Leave"
          value={nextLeaveDisplay}
          subValue={nextLeaveType}
          onClick={() => navigate("/time-off")}
          color="bg-primary/10 text-primary"
        />

        {/* Pending Requests */}
        <StatusCard
          icon={Clock}
          label="Pending"
          value={pendingCount > 0 ? `${pendingCount} request${pendingCount !== 1 ? 's' : ''}` : "None"}
          highlight={pendingCount > 0}
          onClick={() => navigate("/time-off")}
          color="bg-amber-500/10 text-amber-600"
        />

        {/* Loan Balance (conditional - full width if shown) */}
        {hasLoan && (
          <div className="col-span-2">
            <StatusCard
              icon={Wallet}
              label="Loan Balance"
              value={formatCurrencyWithCode(totalLoanBalance, loanCurrency)}
              onClick={() => navigate("/my-profile?tab=loans")}
              color="bg-blue-500/10 text-blue-600"
            />
          </div>
        )}
      </div>
    </div>
  );
}
