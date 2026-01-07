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
  UsersRound,
  FileStack,
  Puzzle,
  Receipt,
  HelpCircle,
  BookUser,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useRole } from "@/contexts/RoleContext";
import { useCompanySettings } from "@/contexts/CompanySettingsContext";
import { RoleBadge } from "@/components/employees/RoleBadge";

// MAIN - Visible to all employees
const mainMenuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: BookUser, label: "Directory", path: "/directory" },
  { icon: Calendar, label: "Calendar", path: "/calendar" },
  { icon: Briefcase, label: "Projects", path: "/projects" },
  { icon: Clock, label: "Time Off", path: "/time-off" },
];

// MANAGEMENT - HR & Manager roles only
const managementMenuItems = [
  { icon: Users, label: "Employees", path: "/employees" },
  { icon: UsersRound, label: "Team Member", path: "/team" },
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

interface NavItemProps {
  icon: React.ElementType;
  label: string;
  path: string;
  isActive: boolean;
  onClick: () => void;
}

function NavItem({ icon: Icon, label, path, isActive, onClick }: NavItemProps) {
  return (
    <Link
      to={path}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
        isActive
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      <Icon className="w-5 h-5" />
      <span className="font-medium">{label}</span>
    </Link>
  );
}

interface NavSectionProps {
  label: string;
  items: typeof mainMenuItems;
  currentPath: string;
  onItemClick: () => void;
}

function NavSection({ label, items, currentPath, onItemClick }: NavSectionProps) {
  return (
    <div className="space-y-1">
      <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
        {label}
      </p>
      {items.map((item) => (
        <NavItem
          key={item.path}
          icon={item.icon}
          label={item.label}
          path={item.path}
          isActive={currentPath === item.path}
          onClick={onItemClick}
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

  const companyInitials = settings.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const companyDisplayName = settings.name.split(" ")[0];

  const hasLogo =
    settings.branding.logoUrl &&
    settings.branding.logoUrl !== "/placeholder.svg" &&
    settings.branding.logoUrl !== "";

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
        {/* Logo Section */}
        <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10 rounded-xl">
              {hasLogo ? (
                <AvatarImage
                  src={settings.branding.logoUrl}
                  alt={settings.name}
                  className="object-cover"
                />
              ) : null}
              <AvatarFallback className="rounded-xl bg-sidebar-primary text-sidebar-primary-foreground font-bold text-lg">
                {companyInitials.charAt(0) || "F"}
              </AvatarFallback>
            </Avatar>
            <span className="text-xl font-bold tracking-tight">{companyDisplayName}</span>
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
