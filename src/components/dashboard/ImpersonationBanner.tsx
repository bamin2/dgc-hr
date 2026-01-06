import { Eye, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRole } from "@/contexts/RoleContext";

export function ImpersonationBanner() {
  const { isImpersonating, stopImpersonation, actualRole } = useRole();

  if (!isImpersonating) return null;

  return (
    <div className="bg-amber-500 text-amber-950 px-4 py-2 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Eye className="w-4 h-4" />
        <span className="font-medium text-sm">
          You are viewing as Employee (Your actual role: {actualRole.charAt(0).toUpperCase() + actualRole.slice(1)})
        </span>
      </div>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={stopImpersonation}
        className="bg-amber-600 border-amber-700 text-amber-50 hover:bg-amber-700 hover:text-amber-50 h-7"
      >
        <X className="w-3 h-3 mr-1" />
        Exit View
      </Button>
    </div>
  );
}
