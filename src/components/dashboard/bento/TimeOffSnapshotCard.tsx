import { useNavigate } from "react-router-dom";
import { CalendarDays, Palmtree, Clock, CalendarCheck } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { BentoCard } from "./BentoCard";
import { usePersonalDashboard } from "@/hooks/usePersonalDashboard";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface TimeOffSnapshotCardProps {
  /** Compact variant for mobile - shows only balance with inline action */
  variant?: "default" | "compact";
}

export function TimeOffSnapshotCard({ variant = "default" }: TimeOffSnapshotCardProps) {
  const navigate = useNavigate();
  const { data, isLoading } = usePersonalDashboard();

  // Find annual leave balance
  const annualLeave = data?.leaveBalances.find(
    (b) => b.leaveTypeName.toLowerCase().includes("annual")
  );

  // Get pending requests count
  const pendingRequests = data?.requestsSummary.pending || 0;

  // Get next upcoming time off
  const nextTimeOff = data?.upcomingTimeOff[0];

  const isCompact = variant === "compact";

  if (isLoading) {
    return (
      <BentoCard colSpan={isCompact ? 12 : 4}>
        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="w-5 h-5 rounded" />
          <Skeleton className="h-5 w-24" />
        </div>
        <div className="space-y-3">
          <Skeleton className={cn("w-full rounded-xl", isCompact ? "h-12" : "h-16")} />
          {!isCompact && <Skeleton className="h-12 w-full rounded-xl" />}
        </div>
      </BentoCard>
    );
  }

  // Compact mobile variant
  if (isCompact) {
    return (
      <BentoCard 
        colSpan={12} 
        onClick={() => navigate("/time-off")}
        className="cursor-pointer p-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Palmtree className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Annual Leave</p>
              <p className="text-lg font-bold text-foreground">
                {annualLeave?.remaining ?? 0}
                <span className="text-sm font-normal text-muted-foreground ml-1">
                  / {annualLeave?.total ?? 0} days
                </span>
              </p>
            </div>
          </div>
          {pendingRequests > 0 && (
            <div className="flex items-center gap-1 text-amber-600 bg-amber-500/10 px-2.5 py-1 rounded-full">
              <Clock className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">{pendingRequests} pending</span>
            </div>
          )}
        </div>
      </BentoCard>
    );
  }

  // Default desktop variant
  return (
    <BentoCard 
      colSpan={4} 
      onClick={() => navigate("/leave")}
      className="cursor-pointer"
    >
      <div className="flex items-center gap-2 mb-4">
        <Palmtree className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-foreground">Time Off</h3>
      </div>

      <div className="space-y-3">
        {/* Available Days */}
        <div className="bg-secondary/30 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Annual Leave</p>
              <p className="text-xl sm:text-2xl font-bold text-foreground">
                {annualLeave?.remaining ?? 0}
                <span className="text-sm font-normal text-muted-foreground ml-1">
                  / {annualLeave?.total ?? 0} days
                </span>
              </p>
            </div>
            <CalendarDays className="w-8 h-8 text-primary/30" />
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex gap-3">
          {/* Pending Requests */}
          <div className="flex-1 bg-secondary/20 rounded-xl p-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              <span className="text-xs text-muted-foreground">Pending</span>
            </div>
            <p className="text-lg font-semibold mt-1">{pendingRequests}</p>
          </div>

          {/* Next Time Off */}
          <div className="flex-1 bg-secondary/20 rounded-xl p-3">
            <div className="flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-green-500" />
              <span className="text-xs text-muted-foreground">Next</span>
            </div>
            <p className="text-sm font-medium mt-1 truncate">
              {nextTimeOff 
                ? format(new Date(nextTimeOff.startDate), "MMM d")
                : "None"
              }
            </p>
          </div>
        </div>
      </div>
    </BentoCard>
  );
}
