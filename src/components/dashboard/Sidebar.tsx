import { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Wallet,
  Calendar,
  Gift,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Clock,
  Briefcase,
  UsersRound,
  FileStack,
  Puzzle,
  Receipt,
  HelpCircle,
  BookUser,
  HandCoins,
  CheckSquare,
  UserCircle,
  History,
  UserPlus,
  icons,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { SidebarSection } from "./SidebarSection";
import { AnnouncementsCard } from "./AnnouncementsCard";
import { useRole } from "@/contexts/RoleContext";
import { useCompanySettings } from "@/contexts/CompanySettingsContext";
import { RoleBadge } from "@/components/employees/RoleBadge";
import { usePendingApprovalsCount } from "@/hooks/usePendingApprovalsCount";
import dgcLogoLight from "@/assets/dgc-logo-light.svg";

// MANAGEMENT - HR & Manager roles only
const managementMenuItems = [
  { icon: Users, label: "Employee Management", path: "/employees" },
  { icon: UserPlus, label: "Hiring", path: "/hiring" },
  { icon: Clock, label: "Time Management", path: "/time-management" },
  { icon: FileText, label: "Reports", path: "/reports" },
  { icon: Wallet, label: "Payrolls", path: "/payroll" },
  { icon: HandCoins, label: "Loans", path: "/loans" },
  { icon: Gift, label: "Benefits", path: "/benefits" },
];

// COMPANY - HR & Manager roles only
const companyMenuItems = [
  { icon: FileStack, label: "Documents", path: "/documents" },
  { icon: History, label: "Audit Trail", path: "/audit-trail" },
  { icon: Puzzle, label: "Integrations", path: "/integrations", comingSoon: true },
  { icon: Receipt, label: "Invoices", path: "/invoices", comingSoon: true },
  { icon: Settings, label: "Settings", path: "/settings" },
  { icon: HelpCircle, label: "Help & Center", path: "/help", comingSoon: true },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    return saved === 'true';
  });
  const location = useLocation();

  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', String(collapsed));
  }, [collapsed]);
  const { currentUser, canAccessManagement, canAccessCompany } = useRole();
  const { settings } = useCompanySettings();
  const { data: pendingCount = 0 } = usePendingApprovalsCount();

  // MAIN - Visible to all employees (with dynamic badge)
  const mainMenuItems = useMemo(() => [
    { icon: LayoutDashboard, label: "Dashboard", path: "/" },
    { icon: UserCircle, label: "My Profile", path: "/my-profile" },
    { icon: BookUser, label: "Directory", path: "/directory" },
    { icon: Calendar, label: "Calendar", path: "/calendar" },
    { icon: Briefcase, label: "Projects", path: "/projects" },
    { icon: Clock, label: "Time Off", path: "/time-off" },
    { icon: CheckSquare, label: "Approvals", path: "/approvals", badge: pendingCount },
  ], [pendingCount]);

  const initials = currentUser.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out h-full shrink-0",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo Section - DGC Branding */}
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        <div className={cn("flex items-center gap-3", collapsed && "justify-center w-full")}>
          {collapsed ? (
            <div className="w-10 h-10 rounded-xl bg-sidebar-primary flex items-center justify-center">
              <span className="text-sidebar-primary-foreground font-bold text-lg">D</span>
            </div>
          ) : (
            <div className="flex flex-col">
              <img 
                src={dgcLogoLight} 
                alt="DGC Logo" 
                className="h-8 w-auto"
              />
              <span className="text-xs font-semibold tracking-widest text-sidebar-muted mt-1">
                CORE
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3 overflow-y-auto scrollbar-thin">
        {/* MAIN Section - Always visible */}
        <SidebarSection 
          label="MAIN" 
          items={mainMenuItems} 
          collapsed={collapsed} 
        />

        {/* MANAGEMENT Section - Conditional */}
        {canAccessManagement && (
          <SidebarSection 
            label="MANAGEMENT" 
            items={managementMenuItems} 
            collapsed={collapsed} 
          />
        )}

        {/* COMPANY Section - Conditional */}
        {canAccessCompany && (
          <SidebarSection 
            label="COMPANY" 
            items={companyMenuItems} 
            collapsed={collapsed} 
          />
        )}
      </nav>


      {/* Collapse Toggle */}
      <div className="px-3 py-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "w-full flex items-center gap-2 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent",
            collapsed && "justify-center"
          )}
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5" />
              <span>Collapse</span>
            </>
          )}
        </Button>
      </div>

      {/* User Profile */}
      <div className="p-4 border-t border-sidebar-border">
        <div
          className={cn(
            "flex items-center gap-3",
            collapsed && "justify-center"
          )}
        >
          <Avatar className="w-10 h-10 ring-2 ring-sidebar-primary/30">
            <AvatarImage src={currentUser.avatar} />
            <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{currentUser.name}</p>
              <RoleBadge role={currentUser.role} showIcon={false} className="mt-1 text-xs h-5" />
            </div>
          )}
          {!collapsed && (
            <Button
              variant="ghost"
              size="icon"
              className="text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </aside>
  );
}
