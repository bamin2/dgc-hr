import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ChevronDown, LogOut, User, Settings, Eye } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { NotificationBell } from "@/components/notifications";
import { useAuth } from "@/contexts/AuthContext";
import { useRole } from "@/contexts/RoleContext";
import { RoleBadge } from "@/components/employees";
import { MobileNav } from "./MobileNav";
import { GlobalSearch } from "./GlobalSearch";

export function Header() {
  const navigate = useNavigate();
  const { signOut, profile } = useAuth();
  const { currentUser, canImpersonate, isImpersonating, startImpersonation, stopImpersonation } = useRole();
  const [searchOpen, setSearchOpen] = useState(false);

  // Keyboard shortcut: ⌘K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const displayName = profile 
    ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'User'
    : currentUser.name || 'User';

  const initials = displayName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="flex items-center justify-between h-14 sm:h-16 px-4 sm:px-6">
        {/* Left side - Mobile nav trigger + Greeting */}
        <div className="flex items-center gap-3">
          {/* Mobile Navigation */}
          <div className="lg:hidden">
            <MobileNav />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-foreground">
              Hello, {displayName.split(' ')[0]}! 👋
            </h1>
            <p className="hidden sm:block text-sm text-muted-foreground">
              Let's check your team today
            </p>
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Search */}
          <button
            onClick={() => setSearchOpen(true)}
            className="hidden md:flex items-center gap-2 w-64 px-3 py-2 text-sm text-muted-foreground bg-secondary/50 rounded-md hover:bg-secondary transition-colors"
          >
            <Search className="w-4 h-4" />
            <span className="flex-1 text-left">Search anything...</span>
            <kbd className="pointer-events-none hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
              <span className="text-xs">⌘</span>K
            </kbd>
          </button>
          <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />

          {/* Notifications */}
          <NotificationBell />

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2 hover:bg-secondary px-2 sm:px-4"
              >
                <Avatar className="w-8 h-8">
                  <AvatarImage src={profile?.avatar_url || currentUser.avatar} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:flex items-center gap-2">
                  <span className="font-medium text-sm">
                    {displayName.split(' ')[0]}
                  </span>
                  <RoleBadge role={currentUser.role} />
                </div>
                <ChevronDown className="w-4 h-4 text-muted-foreground hidden sm:block" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => navigate('/employees/' + currentUser.id)}>
                <User className="w-4 h-4 mr-2" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/settings')}>
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </DropdownMenuItem>
              {canImpersonate && (
                <>
                  <DropdownMenuSeparator />
                  <div 
                    className="flex items-center justify-between px-2 py-1.5 cursor-pointer hover:bg-accent rounded-sm"
                    onClick={(e) => {
                      e.preventDefault();
                      if (isImpersonating) {
                        stopImpersonation();
                      } else {
                        startImpersonation();
                      }
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      <span className="text-sm">View as Employee</span>
                    </div>
                    <Switch 
                      checked={isImpersonating} 
                      onCheckedChange={(checked) => {
                        if (checked) {
                          startImpersonation();
                        } else {
                          stopImpersonation();
                        }
                      }}
                    />
                  </div>
                </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-destructive focus:text-destructive"
                onClick={handleSignOut}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
