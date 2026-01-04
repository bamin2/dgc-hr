import { LucideIcon } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

interface MenuItem {
  icon: LucideIcon;
  label: string;
  path: string;
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
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                  "hover:bg-sidebar-accent",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-lg shadow-sidebar-primary/25"
                    : "text-sidebar-foreground/70 hover:text-sidebar-foreground",
                  collapsed && "justify-center px-0"
                )}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                {!collapsed && (
                  <span className="font-medium text-sm">{item.label}</span>
                )}
              </NavLink>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
