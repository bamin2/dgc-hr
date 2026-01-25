import { useLocation, Link } from "react-router-dom";
import { Home, FileText, CheckSquare, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRole } from "@/contexts/RoleContext";
import { usePendingApprovalsCount } from "@/hooks/usePendingApprovalsCount";

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
  badge?: number;
}

/**
 * Mobile-only fixed bottom navigation bar
 * Provides quick access to core employee workflows
 * Native app feel with 72px height and large touch targets
 * 
 * Tabs:
 * - Home: Dashboard
 * - Requests: Time off and other employee requests
 * - Approvals: Manager/HR only - pending approvals
 * - Profile: Employee profile
 */
export function MobileActionBar() {
  const location = useLocation();
  const { canAccessManagement } = useRole();
  const { data: pendingCount = 0 } = usePendingApprovalsCount();

  // Build nav items dynamically based on role
  const navItems: NavItem[] = [
    { icon: Home, label: "Home", path: "/" },
    { icon: FileText, label: "Requests", path: "/time-off" },
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

  return (
    <nav 
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50",
        "bg-background/95 backdrop-blur-md border-t border-border",
        "safe-area-inset-bottom",
        "lg:hidden" // Only show on mobile/tablet
      )}
    >
      {/* Increased height to 72px for better touch targets */}
      <div className="flex items-stretch justify-around h-[72px]">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center flex-1",
                "min-w-[72px] min-h-[56px] py-2",
                "touch-manipulation transition-all duration-150",
                "active:scale-95", // Haptic-style visual feedback
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
                {item.badge && item.badge > 0 && (
                  <span className={cn(
                    "absolute -top-1.5 -right-2 min-w-[18px] h-[18px]",
                    "flex items-center justify-center",
                    "bg-primary text-primary-foreground",
                    "text-[10px] font-bold rounded-full px-1",
                    "shadow-sm"
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
        })}
      </div>
    </nav>
  );
}
