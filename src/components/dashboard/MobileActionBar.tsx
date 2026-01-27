import { useState, useCallback } from "react";
import { useLocation, Link } from "react-router-dom";
import { Home, FileText, CheckSquare, User, Plus, Calendar, Banknote } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRole } from "@/contexts/RoleContext";
import { usePendingApprovalsCount } from "@/hooks/usePendingApprovalsCount";
import { preloadRoute } from "@/lib/routePreloader";
import { prefetchMobileRouteData } from "@/lib/mobileNavPreloader";
import { useQueryClient } from "@tanstack/react-query";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { RequestTimeOffDialog } from "@/components/timeoff/RequestTimeOffDialog";
import { EmployeeRequestLoanDialog } from "@/components/loans/EmployeeRequestLoanDialog";
import { RequestHRDocumentDialog } from "@/components/approvals/RequestHRDocumentDialog";

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
  badge?: number;
}

interface QuickAction {
  icon: React.ElementType;
  label: string;
  action: () => void;
}

/**
 * Mobile-only fixed bottom navigation bar
 * Provides quick access to core employee workflows
 * Native app feel with 72px height and large touch targets
 * 
 * Tabs:
 * - Home: Dashboard
 * - Requests: Time off and other employee requests
 * - Quick Action: Opens bottom sheet with request options
 * - Approvals: Manager/HR only - pending approvals
 * - Profile: Employee profile
 */
export function MobileActionBar() {
  const location = useLocation();
  const { canAccessManagement, currentUser } = useRole();
  const { data: pendingCount = 0 } = usePendingApprovalsCount();
  const queryClient = useQueryClient();

  // Sheet and dialog states
  const [sheetOpen, setSheetOpen] = useState(false);
  const [timeOffOpen, setTimeOffOpen] = useState(false);
  const [loanOpen, setLoanOpen] = useState(false);
  const [hrLetterOpen, setHrLetterOpen] = useState(false);

  // Prefetch route chunk and pre-warm data on touch/hover
  const handlePrefetch = useCallback((path: string) => {
    preloadRoute(path);
    prefetchMobileRouteData(queryClient, path, currentUser?.id);
  }, [queryClient, currentUser?.id]);

  // Handle quick action selection
  const handleQuickAction = useCallback((openDialog: () => void) => {
    setSheetOpen(false);
    // Small delay for smooth sheet close animation
    setTimeout(() => {
      openDialog();
    }, 150);
  }, []);

  // Quick actions for the bottom sheet
  const quickActions: QuickAction[] = [
    {
      icon: Calendar,
      label: "Time Off",
      action: () => handleQuickAction(() => setTimeOffOpen(true)),
    },
    {
      icon: Banknote,
      label: "Loan",
      action: () => handleQuickAction(() => setLoanOpen(true)),
    },
    {
      icon: FileText,
      label: "HR Letter",
      action: () => handleQuickAction(() => setHrLetterOpen(true)),
    },
  ];

  // Left nav items (before the Quick Action button)
  const leftNavItems: NavItem[] = [
    { icon: Home, label: "Home", path: "/" },
    { icon: FileText, label: "Requests", path: "/requests" },
  ];

  // Right nav items (after the Quick Action button)
  const rightNavItems: NavItem[] = [
    // Only show Approvals for managers/HR/admin
    ...(canAccessManagement ? [{
      icon: CheckSquare,
      label: "Approvals",
      path: "/approvals",
      badge: pendingCount
    }] : []),
    { icon: User, label: "Profile", path: "/my-profile" },
  ];

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  const renderNavItem = (item: NavItem) => {
    const Icon = item.icon;
    const active = isActive(item.path);
    
    return (
      <Link
        key={item.path}
        to={item.path}
        onTouchStart={() => handlePrefetch(item.path)}
        onMouseEnter={() => handlePrefetch(item.path)}
        className={cn(
          "flex flex-col items-center justify-center flex-1",
          "min-w-[56px] min-h-[56px] py-2",
          "touch-manipulation transition-all duration-150",
          "active:scale-95",
          active 
            ? "text-primary" 
            : "text-muted-foreground hover:text-foreground active:text-foreground"
        )}
      >
        <div className="relative">
          <Icon className={cn(
            "w-6 h-6 transition-transform duration-150",
            active && "scale-110"
          )} />
          {/* Badge on icon - only when count > 0, subtle styling */}
          {typeof item.badge === 'number' && item.badge > 0 && (
            <span className={cn(
              "absolute -top-1 -right-1.5",
              "min-w-[16px] h-[16px] px-1",
              "flex items-center justify-center",
              "bg-destructive/90 text-destructive-foreground",
              "text-[9px] font-medium rounded-full"
            )}>
              {item.badge > 99 ? "99+" : item.badge}
            </span>
          )}
        </div>
        <span className={cn(
          "text-[11px] font-medium mt-1.5",
          active && "font-semibold"
        )}>
          {item.label}
        </span>
        {/* Active indicator bar */}
        {active && (
          <span className="absolute bottom-2 w-6 h-0.5 rounded-full bg-primary" />
        )}
      </Link>
    );
  };

  return (
    <>
      <nav 
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50",
          "bg-background/95 backdrop-blur-md border-t border-border",
          "safe-area-inset-bottom",
          "lg:hidden"
        )}
      >
        <div className="flex items-stretch justify-around h-[72px]">
          {/* Left nav items */}
          {leftNavItems.map(renderNavItem)}
          
          {/* Central Quick Action Button */}
          <div className="flex items-center justify-center px-2">
            <button
              type="button"
              onClick={() => setSheetOpen(true)}
              className={cn(
                "w-14 h-14 rounded-full",
                "bg-[#C6A45E] text-white",
                "flex items-center justify-center",
                "shadow-lg shadow-[#C6A45E]/30",
                "touch-manipulation transition-transform duration-150",
                "active:scale-95"
              )}
              aria-label="Quick actions"
            >
              <Plus className="w-7 h-7" strokeWidth={2.5} />
            </button>
          </div>
          
          {/* Right nav items */}
          {rightNavItems.map(renderNavItem)}
        </div>
      </nav>

      {/* Quick Actions Bottom Sheet */}
      <Drawer open={sheetOpen} onOpenChange={setSheetOpen}>
        <DrawerContent>
          <DrawerHeader className="text-left">
            <DrawerTitle>Requests</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-6">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.label}
                  type="button"
                  onClick={action.action}
                  className={cn(
                    "w-full flex items-center gap-4 min-h-[56px] px-2 py-3",
                    "touch-manipulation transition-colors duration-150",
                    "active:bg-muted/50 rounded-xl",
                    index < quickActions.length - 1 && "border-b border-border"
                  )}
                >
                  <div className="h-10 w-10 rounded-xl bg-secondary/50 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-foreground" />
                  </div>
                  <span className="text-base font-medium">{action.label}</span>
                </button>
              );
            })}
          </div>
        </DrawerContent>
      </Drawer>

      {/* Request Dialogs */}
      <RequestTimeOffDialog open={timeOffOpen} onOpenChange={setTimeOffOpen} />
      <EmployeeRequestLoanDialog open={loanOpen} onOpenChange={setLoanOpen} />
      <RequestHRDocumentDialog open={hrLetterOpen} onOpenChange={setHrLetterOpen} />
    </>
  );
}
