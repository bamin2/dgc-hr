import { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Wallet,
  Calendar,
  Gift,
  FileText,
  Settings,
  Clock,
  Briefcase,
  FileStack,
  HelpCircle,
  BookUser,
  History,
  Menu,
  X,
  UserCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useRole } from "@/contexts/RoleContext";
import { useCompanySettings } from "@/contexts/CompanySettingsContext";
import { RoleBadge } from "@/components/employees/RoleBadge";
import dgcLogoLight from "@/assets/dgc-logo-light.svg";

// MAIN - Visible to all employees
const mainMenuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: UserCircle, label: "My Profile", path: "/my-profile" },
  { icon: BookUser, label: "Directory", path: "/directory" },
  { icon: Calendar, label: "Calendar", path: "/calendar" },
  { icon: Briefcase, label: "Projects", path: "/projects" },
  { icon: Clock, label: "Time Off", path: "/time-off" },
  { icon: Settings, label: "Settings", path: "/settings" },
  { icon: HelpCircle, label: "Help Center", path: "/help-center" },
];

// MANAGEMENT - HR & Manager roles only
const managementMenuItems = [
  { icon: Users, label: "Employee Management", path: "/employees" },
  { icon: Clock, label: "Time Management", path: "/time-management" },
  { icon: FileText, label: "Reports", path: "/reports" },
  { icon: Wallet, label: "Payrolls", path: "/payroll" },
  { icon: Gift, label: "Benefits", path: "/benefits" },
];

// COMPANY - HR & Manager roles only
const companyMenuItems = [
  { icon: FileStack, label: "Documents", path: "/documents" },
  { icon: History, label: "Audit Trail", path: "/audit-trail" },
];

interface NavItemProps {
  icon: React.ElementType;
  label: string;
  path: string;
  isActive: boolean;
  onClick: () => void;
  comingSoon?: boolean;
}

function NavItem({ icon: Icon, label, path, isActive, onClick, comingSoon }: NavItemProps) {
  if (comingSoon) {
    return (
      <div
        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sidebar-foreground/40 cursor-not-allowed"
      >
        <Icon className="w-5 h-5" />
        <span className="font-medium">{label}</span>
        <span className="ml-auto text-[10px] font-medium bg-sidebar-accent text-sidebar-muted px-1.5 py-0.5 rounded">
          Soon
        </span>
      </div>
    );
  }

  return (
    <Link
      to={path}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
        isActive
          ? "bg-sidebar-accent text-sidebar-primary border-l-2 border-sidebar-primary"
          : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
      )}
    >
      <Icon className={cn("w-5 h-5", isActive && "text-sidebar-primary")} />
      <span className={cn("font-medium", isActive && "text-sidebar-foreground")}>{label}</span>
    </Link>
  );
}

interface NavSectionProps {
  label: string;
  items: Array<{
    icon: React.ElementType;
    label: string;
    path: string;
    comingSoon?: boolean;
  }>;
  currentPath: string;
  onItemClick: () => void;
}

function NavSection({ label, items, currentPath, onItemClick }: NavSectionProps) {
  return (
    <div className="space-y-1">
      <p className="px-3 text-xs font-semibold text-sidebar-muted uppercase tracking-wider mb-2">
        {label}
      </p>
      {items.map((item) => (
        <NavItem
          key={item.path}
          icon={item.icon}
          label={item.label}
          path={item.path}
          isActive={!item.comingSoon && currentPath === item.path}
          onClick={onItemClick}
          comingSoon={item.comingSoon}
        />
      ))}
    </div>
  );
}

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { currentUser, canAccessManagement, canAccessCompany } = useRole();
  const { settings } = useCompanySettings();

  const initials = currentUser.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const handleClose = () => setOpen(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden h-10 w-10"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0 bg-sidebar text-sidebar-foreground flex flex-col overflow-hidden">
        {/* Logo Section - DGC Branding */}
        <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
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
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 overflow-y-auto space-y-6 min-h-0">
          <NavSection
            label="Main"
            items={mainMenuItems}
            currentPath={location.pathname}
            onItemClick={handleClose}
          />

          {canAccessManagement && (
            <NavSection
              label="Management"
              items={managementMenuItems}
              currentPath={location.pathname}
              onItemClick={handleClose}
            />
          )}

          {canAccessCompany && (
            <NavSection
              label="Company"
              items={companyMenuItems}
              currentPath={location.pathname}
              onItemClick={handleClose}
            />
          )}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-sidebar-border mt-auto">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10 ring-2 ring-sidebar-primary/30">
              <AvatarImage src={currentUser.avatar} />
              <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{currentUser.name}</p>
              <RoleBadge role={currentUser.role} showIcon={false} className="mt-1 text-xs h-5" />
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
