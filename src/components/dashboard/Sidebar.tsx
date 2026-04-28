import { useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Wallet,
  Gift,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Clock,
  Briefcase,
  FileStack,
  HelpCircle,
  BookUser,
  HandCoins,
  CheckSquare,
  UserCircle,
  History,
  UserPlus,
  Plane,
  ChevronsUpDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarSection } from "./SidebarSection";
import { useRole } from "@/contexts/RoleContext";
import { useCompanySettings } from "@/contexts/CompanySettingsContext";
import { RoleBadge } from "@/components/employees/RoleBadge";
import { usePendingApprovalsCount } from "@/hooks/usePendingApprovalsCount";
import { useAuth } from "@/hooks/useAuth";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import dgcLogoLight from "@/assets/dgc-people-logo.svg";
import dgcLogoMark from "@/assets/dgc-logo-mark.svg";

// MANAGEMENT - HR & Manager roles only
const managementMenuItems = [
  { icon: Users, label: "Employee Management", path: "/employees" },
  { icon: UserPlus, label: "Hiring", path: "/hiring" },
  { icon: Clock, label: "Time Management", path: "/time-management" },
  { icon: FileText, label: "Reports", path: "/reports" },
  {
    icon: Wallet,
    label: "Payrolls",
    path: "/payroll",
    subItems: [
      { label: "Payroll Runs", path: "/payroll" },
      { label: "Payslip Templates", path: "/payroll/templates" },
    ],
  },
  { icon: HandCoins, label: "Loans", path: "/loans" },
  { icon: Gift, label: "Benefits", path: "/benefits" },
];

// COMPANY - HR & Manager roles only
const companyMenuItems = [
  { icon: FileStack, label: "Documents", path: "/documents" },
  { icon: History, label: "Audit Trail", path: "/audit-trail" },
];

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, canAccessManagement, canAccessCompany } = useRole();
  const { settings } = useCompanySettings();
  const { data: pendingCount = 0 } = usePendingApprovalsCount();
  const { signOut } = useAuth();
  const { preferences, updatePreferences } = useUserPreferences();

  const collapsed = preferences.display.sidebarCollapsed;

  const setCollapsed = (next: boolean) => {
    updatePreferences({
      display: { ...preferences.display, sidebarCollapsed: next },
    });
  };

  // One-time migration: localStorage → DB
  useEffect(() => {
    const legacy = localStorage.getItem('sidebar-collapsed');
    if (legacy !== null && preferences.userId) {
      const legacyValue = legacy === 'true';
      if (legacyValue !== preferences.display.sidebarCollapsed) {
        updatePreferences({
          display: { ...preferences.display, sidebarCollapsed: legacyValue },
        });
      }
      localStorage.removeItem('sidebar-collapsed');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preferences.userId]);

  // MAIN - Visible to all employees (with dynamic badge)
  const mainMenuItems = useMemo(() => [
    { icon: LayoutDashboard, label: "Dashboard", path: "/" },
    { icon: UserCircle, label: "My Profile", path: "/my-profile" },
    { icon: BookUser, label: "Directory", path: "/directory" },
    { icon: Briefcase, label: "Projects", path: "/projects" },
    { icon: Clock, label: "Time Off", path: "/time-off" },
    { icon: Plane, label: "Business Trips", path: "/business-trips" },
    { icon: CheckSquare, label: "Approvals", path: "/approvals", badge: pendingCount },
    { icon: Settings, label: "Settings", path: "/settings" },
    { icon: HelpCircle, label: "Help Center", path: "/help-center" },
  ], [pendingCount]);

  const initials = currentUser.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out h-full shrink-0",
        collapsed ? "w-20" : "w-60"
      )}
    >
      {/* Logo Section - DGC Branding */}
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        <div className={cn("flex items-center gap-3", collapsed && "justify-center w-full")}>
          {collapsed ? (
            <img
              src={dgcLogoMark}
              alt="DGC"
              className="h-10 w-10 rounded-xl"
            />
          ) : (
            <img
              src={dgcLogoLight}
              alt="DGC Logo"
              className="h-10 w-auto"
            />
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3 overflow-y-auto scrollbar-thin">
        <SidebarSection
          label="MAIN"
          items={mainMenuItems}
          collapsed={collapsed}
        />

        {canAccessManagement && (
          <SidebarSection
            label="MANAGEMENT"
            items={managementMenuItems}
            collapsed={collapsed}
          />
        )}

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
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
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

      {/* User Profile - Dropdown menu (matches Header pattern) */}
      <div className="p-3 border-t border-sidebar-border">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="User menu"
              className={cn(
                "w-full flex items-center gap-3 rounded-lg p-2 text-left transition-colors",
                "hover:bg-sidebar-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
                collapsed && "justify-center"
              )}
            >
              <Avatar className="w-9 h-9 ring-2 ring-sidebar-primary/30 shrink-0">
                <AvatarImage src={currentUser.avatar} />
                <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-xs">
                  {initials}
                </AvatarFallback>
              </Avatar>
              {!collapsed && (
                <>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{currentUser.name}</p>
                    <RoleBadge role={currentUser.role} showIcon={false} className="mt-0.5 text-xs h-5" />
                  </div>
                  <ChevronsUpDown className="w-4 h-4 text-sidebar-foreground/60 shrink-0" />
                </>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align={collapsed ? "center" : "end"}
            side="top"
            className="w-56"
          >
            <DropdownMenuItem onClick={() => navigate('/my-profile')}>
              <UserCircle className="w-4 h-4 mr-2" />
              My Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/settings')}>
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleSignOut}
              className="text-destructive focus:text-destructive"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}
