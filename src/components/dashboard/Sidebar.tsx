import { useState } from "react";
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
  ClipboardCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { SidebarSection } from "./SidebarSection";
import { AnnouncementsCard } from "./AnnouncementsCard";
import { useRole } from "@/contexts/RoleContext";
import { useCompanySettings } from "@/contexts/CompanySettingsContext";
import { RoleBadge } from "@/components/employees/RoleBadge";

// MAIN - Visible to all employees
const mainMenuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: Users, label: "Employees", path: "/employees" },
  { icon: Calendar, label: "Calendar", path: "/calendar" },
  { icon: Briefcase, label: "Projects", path: "/projects" },
  { icon: Clock, label: "Time Off", path: "/time-off" },
];

// MANAGEMENT - HR & Manager roles only
const managementMenuItems = [
  { icon: UsersRound, label: "Team Member", path: "/team" },
  { icon: ClipboardCheck, label: "Attendance", path: "/attendance" },
  { icon: Clock, label: "Time Management", path: "/time-management" },
  { icon: FileText, label: "Reports", path: "/reports" },
  { icon: Wallet, label: "Payrolls", path: "/payroll" },
  { icon: Gift, label: "Benefits", path: "/benefits" },
];

// COMPANY - HR & Manager roles only
const companyMenuItems = [
  { icon: FileStack, label: "Documents", path: "/documents" },
  { icon: Puzzle, label: "Integrations", path: "/integrations" },
  { icon: Receipt, label: "Invoices", path: "/invoices" },
  { icon: Settings, label: "Settings", path: "/settings" },
  { icon: HelpCircle, label: "Help & Center", path: "/help" },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { currentUser, canAccessManagement, canAccessCompany } = useRole();
  const { settings } = useCompanySettings();

  const initials = currentUser.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();

  // Get company initials for logo fallback
  const companyInitials = settings.name
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  // Get display name (first word of company name)
  const companyDisplayName = settings.name.split(' ')[0];

  // Check if logo is valid (not empty or placeholder)
  const hasLogo = settings.branding.logoUrl && 
    settings.branding.logoUrl !== '/placeholder.svg' && 
    settings.branding.logoUrl !== '';

  return (
    <aside
      className={cn(
        "flex flex-col bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out h-screen sticky top-0",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo Section */}
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        <div className={cn("flex items-center gap-3", collapsed && "justify-center w-full")}>
          <Avatar className="w-10 h-10 rounded-xl">
            {hasLogo ? (
              <AvatarImage src={settings.branding.logoUrl} alt={settings.name} className="object-cover" />
            ) : null}
            <AvatarFallback className="rounded-xl bg-sidebar-primary text-sidebar-primary-foreground font-bold text-lg">
              {companyInitials.charAt(0) || 'F'}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <span className="text-xl font-bold tracking-tight">{companyDisplayName}</span>
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

      {/* Announcements Card */}
      <AnnouncementsCard collapsed={collapsed} />

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
