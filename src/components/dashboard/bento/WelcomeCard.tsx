import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  CalendarPlus, 
  Plane, 
  FileText, 
  ClipboardCheck,
  UserPlus,
  DollarSign,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BentoCard } from "./BentoCard";
import { useAuth } from "@/contexts/AuthContext";
import { useRole } from "@/contexts/RoleContext";
import { RequestTimeOffDialog } from "@/components/timeoff/RequestTimeOffDialog";
import { EmployeeRequestLoanDialog } from "@/components/loans/EmployeeRequestLoanDialog";
import { RequestHRDocumentDialog } from "@/components/approvals/RequestHRDocumentDialog";

interface QuickAction {
  label: string;
  icon: React.ElementType;
  onClick: () => void;
  variant?: "default" | "outline";
}

export function WelcomeCard() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { canEditEmployees, isManager } = useRole();
  
  const [isTimeOffDialogOpen, setIsTimeOffDialogOpen] = useState(false);
  const [isLoanDialogOpen, setIsLoanDialogOpen] = useState(false);
  const [isHRLetterDialogOpen, setIsHRLetterDialogOpen] = useState(false);

  const firstName = profile?.first_name || "there";
  
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
      label: "Request Time Off",
      icon: CalendarPlus,
      onClick: () => setIsTimeOffDialogOpen(true),
    },
    {
      label: "Business Trip",
      icon: Plane,
      onClick: () => navigate("/business-trips/new"),
      variant: "outline",
    },
    {
      label: "HR Letter",
      icon: FileText,
      onClick: () => setIsHRLetterDialogOpen(true),
      variant: "outline",
    },
  ];

  // Manager/HR/Admin actions
  const managerActions: QuickAction[] = isManager || canEditEmployees ? [
    {
      label: "Approvals",
      icon: ClipboardCheck,
      onClick: () => navigate("/approvals"),
      variant: "outline",
    },
  ] : [];

  // HR/Admin only actions
  const adminActions: QuickAction[] = canEditEmployees ? [
    {
      label: "Add Employee",
      icon: UserPlus,
      onClick: () => navigate("/employees?action=add"),
      variant: "outline",
    },
  ] : [];

  const actions = [...baseActions, ...managerActions, ...adminActions].slice(0, 4);

  return (
    <>
      <BentoCard colSpan={7} className="flex flex-col gap-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h1 className="text-lg sm:text-2xl font-semibold text-foreground flex items-center gap-2">
              {getGreeting()}, {firstName}! 
              <Sparkles className="h-5 w-5 text-primary" />
            </h1>
            <p className="text-sm text-muted-foreground">
              Here's what's happening today
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-auto pt-2">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.label}
                variant={action.variant || "default"}
                size="sm"
                onClick={action.onClick}
                className="rounded-full gap-2"
              >
                <Icon className="h-4 w-4" />
                {action.label}
              </Button>
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
    </>
  );
}
