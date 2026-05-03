import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  CalendarPlus, 
  Banknote, 
  Receipt, 
  FileText,
  CheckSquare,
  BookUser
} from "lucide-react";
import { BentoCard } from "./BentoCard";
import { useRole } from "@/contexts/RoleContext";
import { useMyEmployee } from "@/hooks/useMyEmployee";
import { RequestTimeOffDialog } from "@/components/timeoff/RequestTimeOffDialog";
import { EmployeeRequestLoanDialog } from "@/components/loans/EmployeeRequestLoanDialog";
import { RequestHRDocumentDialog } from "@/components/approvals/RequestHRDocumentDialog";
import { MobilePayslipsSheet } from "@/components/myprofile/mobile/MobilePayslipsSheet";
import { cn } from "@/lib/utils";

interface QuickActionItem {
  label: string;
  icon: React.ElementType;
  onClick: () => void;
  color: string;
}

/**
 * Mobile Quick Actions - 2x2 grid of common employee actions
 * Shows role-based additional actions for Managers/HR/Admins
 */
export function MobileQuickActionsCard() {
  const navigate = useNavigate();
  const { isManager, canEditEmployees } = useRole();
  const { data: employee } = useMyEmployee();
  
  const [isTimeOffDialogOpen, setIsTimeOffDialogOpen] = useState(false);
  const [isLoanDialogOpen, setIsLoanDialogOpen] = useState(false);
  const [isHRLetterDialogOpen, setIsHRLetterDialogOpen] = useState(false);
  const [isPayslipsSheetOpen, setIsPayslipsSheetOpen] = useState(false);

  // Show manager actions for Manager, HR, or Admin roles
  const showManagerActions = isManager || canEditEmployees;

  // Base actions available to all employees
  const baseActions: QuickActionItem[] = [
    {
      label: "Request Time Off",
      icon: CalendarPlus,
      onClick: () => setIsTimeOffDialogOpen(true),
      color: "bg-primary/10 text-primary",
    },
    {
      label: "Request Loan",
      icon: Banknote,
      onClick: () => setIsLoanDialogOpen(true),
      color: "bg-emerald-500/10 text-emerald-600",
    },
    {
      label: "View Payslip",
      icon: Receipt,
      onClick: () => setIsPayslipsSheetOpen(true),
      color: "bg-blue-500/10 text-blue-600",
    },
    {
      label: "HR Letter",
      icon: FileText,
      onClick: () => setIsHRLetterDialogOpen(true),
      color: "bg-amber-500/10 text-amber-600",
    },
  ];

  // Manager/HR-only actions
  const managerActions: QuickActionItem[] = showManagerActions ? [
    {
      label: "Approvals",
      icon: CheckSquare,
      onClick: () => navigate("/approvals"),
      color: "bg-violet-500/10 text-violet-600",
    },
    {
      label: "Directory",
      icon: BookUser,
      onClick: () => navigate("/directory"),
      color: "bg-rose-500/10 text-rose-600",
    },
  ] : [];

  const allActions = [...baseActions, ...managerActions];

  return (
    <>
      <BentoCard colSpan={12} className="p-4">
        {/* Section Header */}
        <h2 className="text-sm font-semibold text-foreground mb-3">
          Quick Actions
        </h2>

        {/* 2-column Action Grid - large touch targets */}
        <div className="grid grid-cols-2 gap-3">
          {allActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.label}
                onClick={action.onClick}
                className={cn(
                  "flex flex-col items-center justify-center gap-2",
                  "min-h-[88px] rounded-2xl p-4",
                  "bg-secondary/50 hover:bg-secondary/80 active:scale-[0.98]",
                  "transition-all duration-150 touch-manipulation"
                )}
              >
                <div className={cn(
                  "w-11 h-11 rounded-xl flex items-center justify-center",
                  action.color
                )}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-xs font-medium text-foreground text-center leading-tight">
                  {action.label}
                </span>
              </button>
            );
          })}
        </div>
      </BentoCard>

      {/* Dialogs */}
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
      <MobilePayslipsSheet
        open={isPayslipsSheetOpen}
        onOpenChange={setIsPayslipsSheetOpen}
        employeeId={employee?.id}
      />
    </>
  );
}
