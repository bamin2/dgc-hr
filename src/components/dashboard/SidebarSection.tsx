import { LucideIcon } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

interface MenuItem {
  icon: LucideIcon;
  label: string;
  path: string;
  badge?: number;
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
          const isActive = item.path === "/" 
            ? location.pathname === "/" 
            : location.pathname.startsWith(item.path);
          return (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 relative",
                  "hover:bg-sidebar-accent",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-lg shadow-sidebar-primary/25"
                    : "text-sidebar-foreground/70 hover:text-sidebar-foreground",
                  collapsed && "justify-center px-0"
                )}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                {!collapsed && (
                  <>
                    <span className="font-medium text-sm">{item.label}</span>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="ml-auto bg-destructive text-destructive-foreground text-xs font-semibold rounded-full px-2 py-0.5 min-w-[20px] text-center">
                        {item.badge > 99 ? "99+" : item.badge}
                      </span>
                    )}
                  </>
                )}
                {collapsed && item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-[10px] font-semibold rounded-full w-4 h-4 flex items-center justify-center">
                    {item.badge > 9 ? "9+" : item.badge}
                  </span>
                )}
              </NavLink>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
