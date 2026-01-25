import { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import {
  LayoutDashboard,
  Clock,
  Menu,
  X,
  UserCircle,
  Bell,
  ChevronRight,
  Settings,
  HelpCircle,
  BookUser,
  Briefcase,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useRole } from "@/contexts/RoleContext";
import { useAuth } from "@/contexts/AuthContext";
import { RoleBadge } from "@/components/employees/RoleBadge";
import dgcLogoLight from "@/assets/dgc-logo-light.svg";

// PRIMARY - Core employee actions (always visible, larger touch targets)
const primaryMenuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: UserCircle, label: "My Profile", path: "/my-profile" },
  { icon: Clock, label: "Time Off", path: "/time-off" },
  { icon: Bell, label: "Notifications", path: "/notifications" },
];

// SECONDARY - Less frequent actions (grouped in "More")
const secondaryMenuItems = [
  { icon: BookUser, label: "Directory", path: "/directory" },
  { icon: Briefcase, label: "Projects", path: "/projects" },
  { icon: Settings, label: "Settings", path: "/settings" },
  { icon: HelpCircle, label: "Help Center", path: "/help-center" },
];

interface NavItemProps {
  icon: React.ElementType;
  label: string;
  path: string;
  isActive: boolean;
  onClick: () => void;
  large?: boolean;
}

function NavItem({ icon: Icon, label, path, isActive, onClick, large = false }: NavItemProps) {
  return (
    <Link
      to={path}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-xl transition-all touch-manipulation",
        large ? "px-4 py-3.5 min-h-[52px]" : "px-3 py-2.5",
        isActive
          ? "bg-sidebar-accent text-sidebar-primary"
          : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 active:bg-sidebar-accent"
      )}
    >
      <Icon className={cn(
        large ? "w-5 h-5" : "w-4 h-4",
        isActive && "text-sidebar-primary"
      )} />
      <span className={cn(
        "font-medium flex-1",
        large ? "text-base" : "text-sm",
        isActive && "text-sidebar-foreground"
      )}>
        {label}
      </span>
      <ChevronRight className={cn(
        "w-4 h-4 text-sidebar-foreground/30",
        isActive && "text-sidebar-primary/50"
      )} />
    </Link>
  );
}

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const location = useLocation();
  const { currentUser } = useRole();
  const { signOut } = useAuth();

  const initials = currentUser.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const handleClose = () => {
    setOpen(false);
    setShowMore(false);
  };

  const handleSignOut = async () => {
    handleClose();
    await signOut();
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden h-11 w-11 touch-manipulation"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent 
        side="left" 
        className="w-[85vw] max-w-[320px] p-0 bg-sidebar text-sidebar-foreground flex flex-col overflow-hidden"
      >
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
            className="h-11 w-11 text-sidebar-foreground hover:bg-sidebar-accent touch-manipulation"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* User Profile - Moved to top for prominence */}
        <div className="p-4 border-b border-sidebar-border">
          <Link 
            to="/my-profile" 
            onClick={handleClose}
            className="flex items-center gap-3 touch-manipulation"
          >
            <Avatar className="w-12 h-12 ring-2 ring-sidebar-primary/30">
              <AvatarImage src={currentUser.avatar} />
              <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-lg">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-base font-semibold truncate">{currentUser.name}</p>
              <RoleBadge role={currentUser.role} showIcon={false} className="mt-1 text-xs h-5" />
            </div>
            <ChevronRight className="w-4 h-4 text-sidebar-foreground/30" />
          </Link>
        </div>

        {/* Primary Navigation - Large touch targets */}
        <nav className="flex-1 py-4 px-3 overflow-y-auto space-y-1 min-h-0">
          {primaryMenuItems.map((item) => (
            <NavItem
              key={item.path}
              icon={item.icon}
              label={item.label}
              path={item.path}
              isActive={location.pathname === item.path}
              onClick={handleClose}
              large
            />
          ))}

          {/* More Section - Expandable */}
          <div className="pt-4 mt-4 border-t border-sidebar-border/50">
            <button
              onClick={() => setShowMore(!showMore)}
              className={cn(
                "flex items-center gap-3 w-full px-4 py-3 rounded-xl",
                "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 active:bg-sidebar-accent",
                "transition-all touch-manipulation"
              )}
            >
              <span className="text-xs font-semibold uppercase tracking-wider flex-1 text-left">
                More
              </span>
              <ChevronRight className={cn(
                "w-4 h-4 text-sidebar-foreground/30 transition-transform",
                showMore && "rotate-90"
              )} />
            </button>

            {showMore && (
              <div className="mt-1 space-y-1 animate-in slide-in-from-top-2 duration-200">
                {secondaryMenuItems.map((item) => (
                  <NavItem
                    key={item.path}
                    icon={item.icon}
                    label={item.label}
                    path={item.path}
                    isActive={location.pathname === item.path}
                    onClick={handleClose}
                  />
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* Sign Out Button */}
        <div className="p-4 border-t border-sidebar-border">
          <button
            onClick={handleSignOut}
            className={cn(
              "flex items-center gap-3 w-full px-4 py-3 rounded-xl",
              "text-sidebar-foreground/70 hover:bg-red-500/10 hover:text-red-400",
              "transition-all touch-manipulation"
            )}
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
