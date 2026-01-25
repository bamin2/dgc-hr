import { useLocation, Link } from "react-router-dom";
import { Home, Clock, Bell, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNotifications } from "@/hooks/useNotifications";

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
  badge?: number;
}

/**
 * Mobile-only fixed bottom navigation bar
 * Provides quick access to core employee workflows
 * Native app feel with 44px+ touch targets
 */
export function MobileActionBar() {
  const location = useLocation();
  const { notifications } = useNotifications();
  
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const navItems: NavItem[] = [
    { icon: Home, label: "Home", path: "/" },
    { icon: Clock, label: "Time Off", path: "/time-off" },
    { icon: Bell, label: "Alerts", path: "/notifications", badge: unreadCount },
    { icon: User, label: "Me", path: "/my-profile" },
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
      <div className="flex items-stretch justify-around h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center flex-1",
                "min-w-[64px] min-h-[48px] py-2",
                "touch-manipulation transition-colors",
                active 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground active:text-foreground"
              )}
            >
              <div className="relative">
                <Icon className={cn(
                  "w-6 h-6 transition-transform",
                  active && "scale-110"
                )} />
                {item.badge && item.badge > 0 && (
                  <span className={cn(
                    "absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px]",
                    "flex items-center justify-center",
                    "bg-primary text-primary-foreground",
                    "text-[10px] font-bold rounded-full px-1"
                  )}>
                    {item.badge > 99 ? "99+" : item.badge}
                  </span>
                )}
              </div>
              <span className={cn(
                "text-[10px] font-medium mt-1",
                active && "font-semibold"
              )}>
                {item.label}
              </span>
              {/* Active indicator dot */}
              {active && (
                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
