import { Eye, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRole } from "@/contexts/RoleContext";

export function ImpersonationBanner() {
  const { isImpersonating, stopImpersonation, actualRole, impersonatedEmployee } = useRole();

  if (!isImpersonating || !impersonatedEmployee) return null;

  const initials = impersonatedEmployee.name
    .split(" ")
    .map(n => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="bg-warning text-warning-foreground px-4 py-2 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Eye className="w-4 h-4" />
        <Avatar className="w-6 h-6 border border-warning/60">
          <AvatarImage src={impersonatedEmployee.avatar} />
          <AvatarFallback className="bg-warning/80 text-warning-foreground text-xs">
            {initials}
          </AvatarFallback>
        </Avatar>
        <span className="font-medium text-sm">
          Viewing as <strong>{impersonatedEmployee.name}</strong>
          {impersonatedEmployee.position && (
            <span className="opacity-80"> ({impersonatedEmployee.position})</span>
          )}
          <span className="hidden sm:inline opacity-70"> • Your role: {actualRole.charAt(0).toUpperCase() + actualRole.slice(1)}</span>
        </span>
      </div>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={stopImpersonation}
        className="bg-warning/90 border-warning text-warning-foreground hover:bg-warning hover:text-warning-foreground h-7"
      >
        <X className="w-3 h-3 mr-1" />
        Exit View
      </Button>
    </div>
  );
}
