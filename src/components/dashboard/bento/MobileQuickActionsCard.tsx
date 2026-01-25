import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  CalendarPlus, 
  Plane, 
  FileText, 
  Palmtree,
  ChevronRight
} from "lucide-react";
import { BentoCard } from "./BentoCard";
import { useAuth } from "@/contexts/AuthContext";
import { RequestTimeOffDialog } from "@/components/timeoff/RequestTimeOffDialog";
import { RequestHRDocumentDialog } from "@/components/approvals/RequestHRDocumentDialog";
import { cn } from "@/lib/utils";

interface QuickActionItem {
  label: string;
  icon: React.ElementType;
  onClick: () => void;
  color: string;
}

/**
 * Mobile-optimized 2x2 grid of quick actions
 * Large touch targets (min 48px) for native-like feel
 */
export function MobileQuickActionsCard() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  
  const [isTimeOffDialogOpen, setIsTimeOffDialogOpen] = useState(false);
  const [isHRLetterDialogOpen, setIsHRLetterDialogOpen] = useState(false);

  const firstName = profile?.first_name || "there";
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const actions: QuickActionItem[] = [
    {
      label: "Request Time Off",
      icon: CalendarPlus,
      onClick: () => setIsTimeOffDialogOpen(true),
      color: "bg-primary/10 text-primary",
    },
    {
      label: "Business Trip",
      icon: Plane,
      onClick: () => navigate("/business-trips/new"),
      color: "bg-blue-500/10 text-blue-600",
    },
    {
      label: "View Balance",
      icon: Palmtree,
      onClick: () => navigate("/time-off"),
      color: "bg-green-500/10 text-green-600",
    },
    {
      label: "HR Letter",
      icon: FileText,
      onClick: () => setIsHRLetterDialogOpen(true),
      color: "bg-amber-500/10 text-amber-600",
    },
  ];

  return (
    <>
      <BentoCard colSpan={12} className="p-4">
        {/* Compact greeting */}
        <div className="mb-4">
          <h1 className="text-lg font-semibold text-foreground">
            {getGreeting()}, {firstName}!
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            What would you like to do?
          </p>
        </div>

        {/* 2x2 Action Grid - large touch targets */}
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action) => {
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

      <RequestTimeOffDialog
        open={isTimeOffDialogOpen}
        onOpenChange={setIsTimeOffDialogOpen}
      />
      <RequestHRDocumentDialog
        open={isHRLetterDialogOpen}
        onOpenChange={setIsHRLetterDialogOpen}
      />
    </>
  );
}
