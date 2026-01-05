import { useNavigate } from "react-router-dom";
import { Search, ChevronDown, LogOut, User, Settings } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NotificationBell } from "@/components/notifications";
import { useAuth } from "@/contexts/AuthContext";
import { useRole } from "@/contexts/RoleContext";
import { RoleBadge } from "@/components/employees";

export function Header() {
  const navigate = useNavigate();
  const { signOut, profile } = useAuth();
  const { currentUser } = useRole();

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
      <div className="flex items-center justify-between h-16 px-6">
        {/* Greeting */}
        <div>
          <h1 className="text-xl font-bold text-foreground">
            Hello, {displayName.split(' ')[0]}! 👋
          </h1>
          <p className="text-sm text-muted-foreground">
            Let's check your team today
          </p>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search anything..."
              className="w-64 pl-10 bg-secondary/50 border-0 focus-visible:ring-1 focus-visible:ring-primary"
            />
          </div>

          {/* Notifications */}
          <NotificationBell />

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2 hover:bg-secondary"
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
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => navigate('/employees/' + currentUser.id)}>
                <User className="w-4 h-4 mr-2" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/settings')}>
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </DropdownMenuItem>
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
