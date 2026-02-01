import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { 
  CalendarPlus, 
  Plane, 
  FileText, 
  ClipboardCheck,
  UserPlus,
  Sparkles
} from "lucide-react";
import { BentoCard } from "./BentoCard";
import { useAuth } from "@/contexts/AuthContext";
import { useRole } from "@/contexts/RoleContext";
import { RequestTimeOffDialog } from "@/components/timeoff/RequestTimeOffDialog";
import { EmployeeRequestLoanDialog } from "@/components/loans/EmployeeRequestLoanDialog";
import { RequestHRDocumentDialog } from "@/components/approvals/RequestHRDocumentDialog";
import { CreateTripDialog } from "@/components/business-trips/CreateTripDialog";
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
