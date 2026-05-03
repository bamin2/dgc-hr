import { useState } from "react";
import { useLocation } from "react-router-dom";
import { PrefetchNavLink } from "@/components/PrefetchNavLink";
import {
  Menu,
  X,
  UserCircle,
  ChevronRight,
  Settings,
  HelpCircle,
  BookUser,
  Briefcase,
  Calendar,
  Plane,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useRole } from "@/contexts/RoleContext";
import { useAuth } from "@/contexts/AuthContext";
import { RoleBadge } from "@/components/employees/RoleBadge";
import dgcLogoLight from "@/assets/dgc-people-logo.svg";

// SECONDARY - Destinations not present in the bottom MobileActionBar
const secondaryMenuItems = [
  { icon: BookUser, label: "Directory", path: "/directory" },
  { icon: Briefcase, label: "Projects", path: "/projects" },
  { icon: Calendar, label: "Calendar", path: "/calendar" },
  { icon: Plane, label: "Business Trips", path: "/business-trips" },
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
    <PrefetchNavLink
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
    </PrefetchNavLink>
  );
}

export function MobileNav() {
  const [open, setOpen] = useState(false);
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
          className="lg:hidden h-11 px-3 gap-2 touch-manipulation"
          aria-label="Open more menu"
        >
          <Menu className="h-5 w-5" />
          <span className="text-sm font-medium">More</span>
        </Button>
      </SheetTrigger>
      <SheetContent 
        side="left" 
        className="w-[85vw] max-w-[320px] p-0 bg-sidebar text-sidebar-foreground flex flex-col overflow-hidden"
      >
        {/* Logo Section - DGC Branding */}
        <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
          <img 
            src={dgcLogoLight} 
            alt="DGC Logo" 
            className="h-12 w-auto"
          />
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
          <PrefetchNavLink
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
          </PrefetchNavLink>
        </div>

        {/* Secondary Navigation - destinations not in the bottom MobileActionBar */}
        <nav className="flex-1 py-4 px-3 overflow-y-auto space-y-1 min-h-0">
          {secondaryMenuItems.map((item) => (
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
