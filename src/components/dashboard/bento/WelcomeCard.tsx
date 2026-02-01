import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { 
  CalendarPlus, 
  Plane, 
  FileText, 
  ClipboardCheck,
  UserPlus,
  Sparkles,
  CalendarCheck,
  Clock,
  CheckCircle
} from "lucide-react";
import { BentoCard } from "./BentoCard";
import { useAuth } from "@/contexts/AuthContext";
import { useRole } from "@/contexts/RoleContext";
import { usePersonalDashboard } from "@/hooks/usePersonalDashboard";
import { usePendingApprovalsCount } from "@/hooks/usePendingApprovalsCount";
import { RequestTimeOffDialog } from "@/components/timeoff/RequestTimeOffDialog";
import { EmployeeRequestLoanDialog } from "@/components/loans/EmployeeRequestLoanDialog";
import { RequestHRDocumentDialog } from "@/components/approvals/RequestHRDocumentDialog";
import { CreateTripDialog } from "@/components/business-trips/CreateTripDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface QuickAction {
  label: string;
  icon: React.ElementType;
  onClick: () => void;
}

export function WelcomeCard() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { canEditEmployees, isManager } = useRole();
  
  // Data hooks for snapshot stats
  const { data: dashboardData, isLoading: dashboardLoading } = usePersonalDashboard();
  const { data: approvalsCount, isLoading: approvalsLoading } = usePendingApprovalsCount();
  
  const [isTimeOffDialogOpen, setIsTimeOffDialogOpen] = useState(false);
  const [isLoanDialogOpen, setIsLoanDialogOpen] = useState(false);
  const [isHRLetterDialogOpen, setIsHRLetterDialogOpen] = useState(false);
  const [isBusinessTripDialogOpen, setIsBusinessTripDialogOpen] = useState(false);

  const firstName = profile?.first_name || "there";
  const today = new Date();
  const formattedDate = format(today, "EEE, MMM d");
  
  // Get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  // Compute snapshot stats
  const nextLeave = dashboardData?.upcomingTimeOff[0];
  const nextLeaveDisplay = nextLeave 
    ? format(new Date(nextLeave.startDate), "MMM d") 
    : "None";
  const pendingRequests = dashboardData?.requestsSummary.pending ?? 0;
  const showApprovals = isManager || canEditEmployees;
  const approvalsWaiting = approvalsCount ?? 0;
  const isStatsLoading = dashboardLoading || approvalsLoading;

  // Base actions for all employees
  const baseActions: QuickAction[] = [
    {
      label: "Time Off",
      icon: CalendarPlus,
      onClick: () => setIsTimeOffDialogOpen(true),
    },
    {
      label: "Business Trip",
      icon: Plane,
      onClick: () => setIsBusinessTripDialogOpen(true),
    },
    {
      label: "HR Letter",
      icon: FileText,
      onClick: () => setIsHRLetterDialogOpen(true),
    },
  ];

  // Manager/HR/Admin actions
  const managerActions: QuickAction[] = isManager || canEditEmployees ? [
    {
      label: "Approvals",
      icon: ClipboardCheck,
      onClick: () => navigate("/approvals"),
    },
  ] : [];

  // HR/Admin only actions
  const adminActions: QuickAction[] = canEditEmployees ? [
    {
      label: "Add Employee",
      icon: UserPlus,
      onClick: () => navigate("/employees?action=add"),
    },
  ] : [];

  const actions = [...baseActions, ...managerActions, ...adminActions].slice(0, 4);

  return (
    <>
      <BentoCard colSpan={5} className="flex flex-col gap-3">
        {/* Header row with date pill */}
        <div className="flex items-start justify-between">
          <div className="space-y-0.5">
            <h1 className="text-lg font-semibold text-foreground flex items-center gap-2">
              {getGreeting()}, {firstName}!
              <Sparkles className="h-4 w-4 text-primary" />
            </h1>
            <p className="text-sm text-muted-foreground">
              Here's what's happening today
            </p>
          </div>
          {/* Today pill */}
          <div className="flex flex-col items-end">
            <span className="text-xs font-medium text-muted-foreground">Today</span>
            <span className="text-sm font-medium text-foreground">{formattedDate}</span>
          </div>
        </div>

        {/* Today Snapshot Strip */}
        {isStatsLoading ? (
          <div className={cn(
            "grid gap-2",
            showApprovals ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-1 sm:grid-cols-2"
          )}>
            {Array.from({ length: showApprovals ? 3 : 2 }).map((_, i) => (
              <Skeleton key={i} className="h-12 rounded-lg" />
            ))}
          </div>
        ) : (
          <div className={cn(
            "grid gap-2",
            showApprovals ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-1 sm:grid-cols-2"
          )}>
            {/* Next Leave */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/30">
              <CalendarCheck className="h-4 w-4 text-primary shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Next Leave</p>
                <p className="text-sm font-medium truncate">{nextLeaveDisplay}</p>
              </div>
            </div>

            {/* Pending Requests */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/30">
              <Clock className="h-4 w-4 text-amber-500 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Pending</p>
                <p className="text-sm font-medium">{pendingRequests}</p>
              </div>
            </div>

            {/* Approvals Waiting (manager only) */}
            {showApprovals && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/30">
                <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">To Approve</p>
                  <p className="text-sm font-medium">{approvalsWaiting}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Quick actions grid */}
        <div className="grid grid-cols-4 gap-2">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.label}
                onClick={action.onClick}
                className={cn(
                  "flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl",
                  "bg-white/50 dark:bg-white/5 border border-white/40 dark:border-white/10",
                  "hover:bg-white/70 dark:hover:bg-white/10 hover:border-white/60 dark:hover:border-white/15",
                  "transition-all duration-150",
                  "text-foreground"
                )}
              >
                <Icon className="h-5 w-5 text-primary" />
                <span className="text-xs font-medium text-center leading-tight">{action.label}</span>
              </button>
            );
          })}
        </div>
      </BentoCard>

      <RequestTimeOffDialog
        open={isTimeOffDialogOpen}
        onOpenChange={setIsTimeOffDialogOpen}
      />
      <EmployeeRequestLoanDialog
        open={isLoanDialogOpen}
        onOpenChange={setIsLoanDialogOpen}
      />
      <RequestHRDocumentDialog
        open={isHRLetterDialogOpen}
        onOpenChange={setIsHRLetterDialogOpen}
      />
      <CreateTripDialog
        open={isBusinessTripDialogOpen}
        onOpenChange={setIsBusinessTripDialogOpen}
      />
    </>
  );
}
