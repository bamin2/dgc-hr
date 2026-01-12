import { LucideIcon } from "lucide-react";
import { useLocation } from "react-router-dom";
import { PrefetchNavLink } from "@/components/PrefetchNavLink";
import { cn } from "@/lib/utils";

interface MenuItem {
  icon: LucideIcon;
  label: string;
  path: string;
  badge?: number;
  comingSoon?: boolean;
}

interface SidebarSectionProps {
  label: string;
  items: MenuItem[];
  collapsed: boolean;
}

export function SidebarSection({ label, items, collapsed }: SidebarSectionProps) {
  const location = useLocation();

  return (
    <div className="mb-6">
      {!collapsed && (
        <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-sidebar-muted">
          {label}
        </p>
      )}
      <ul className="space-y-1">
        {items.map((item) => {
          const isActive = !item.comingSoon && (item.path === "/" 
            ? location.pathname === "/" 
            : location.pathname.startsWith(item.path));

          // Coming Soon items - non-clickable
          if (item.comingSoon) {
            return (
              <li key={item.path}>
                <div
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg",
                    "text-sidebar-foreground/40 cursor-not-allowed",
                    collapsed && "justify-center px-0"
                  )}
                >
                  <item.icon className="w-5 h-5 shrink-0" />
                  {!collapsed && (
                    <>
                      <span className="font-medium text-sm">{item.label}</span>
                      <span className="ml-auto text-[10px] font-medium bg-sidebar-accent text-sidebar-muted px-1.5 py-0.5 rounded">
                        Soon
                      </span>
                    </>
                  )}
                </div>
              </li>
            );
          }

          return (
            <li key={item.path}>
              <PrefetchNavLink
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 relative",
                  "hover:bg-sidebar-accent",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-primary border-l-2 border-sidebar-primary"
                    : "text-sidebar-foreground/70 hover:text-sidebar-foreground",
                  collapsed && "justify-center px-0 border-l-0"
                )}
              >
                <item.icon className={cn(
                  "w-5 h-5 shrink-0",
                  isActive && "text-sidebar-primary"
                )} />
                {!collapsed && (
                  <>
                    <span className={cn(
                      "font-medium text-sm",
                      isActive && "text-sidebar-foreground"
                    )}>{item.label}</span>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="ml-auto bg-sidebar-primary text-sidebar-primary-foreground text-xs font-semibold rounded-full px-2 py-0.5 min-w-[20px] text-center">
                        {item.badge > 99 ? "99+" : item.badge}
                      </span>
                    )}
                  </>
                )}
                {collapsed && item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 bg-sidebar-primary text-sidebar-primary-foreground text-[10px] font-semibold rounded-full w-4 h-4 flex items-center justify-center">
                    {item.badge > 9 ? "9+" : item.badge}
                  </span>
                )}
              </PrefetchNavLink>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
