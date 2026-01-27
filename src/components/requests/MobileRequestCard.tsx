import { Plane, FileText, Banknote, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { UnifiedRequest, UnifiedStatus } from "@/hooks/useUnifiedRequests";

interface MobileRequestCardProps {
  request: UnifiedRequest;
  onClick?: () => void;
}

function getStatusBadgeVariant(status: UnifiedStatus): "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "muted" {
  switch (status) {
    case "pending":
    case "draft":
      return "warning";
    case "approved":
    case "active":
      return "success";
    case "rejected":
      return "destructive";
    case "cancelled":
      return "muted";
    default:
      return "secondary";
  }
}

function getStatusLabel(status: UnifiedStatus): string {
  switch (status) {
    case "pending":
      return "Pending";
    case "draft":
      return "Draft";
    case "approved":
      return "Approved";
    case "active":
      return "Active";
    case "rejected":
      return "Rejected";
    case "cancelled":
      return "Cancelled";
    default:
      return status;
  }
}

function RequestIcon({ type, icon }: { type: UnifiedRequest["type"]; icon: string }) {
  const iconClass = "h-5 w-5";
  
  switch (type) {
    case "leave":
      // For leave, icon is a color - show a colored dot
      return (
        <div 
          className="h-10 w-10 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${icon}20` }}
        >
          <div 
            className="h-3.5 w-3.5 rounded-full"
            style={{ backgroundColor: icon }}
          />
        </div>
      );
    case "business_trip":
      return (
        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Plane className={cn(iconClass, "text-primary")} />
        </div>
      );
    case "hr_document":
      return (
        <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center">
          <FileText className={cn(iconClass, "text-muted-foreground")} />
        </div>
      );
    case "loan":
      return (
        <div className="h-10 w-10 rounded-xl bg-success/10 flex items-center justify-center">
          <Banknote className={cn(iconClass, "text-success")} />
        </div>
      );
    default:
      return null;
  }
}

export function MobileRequestCard({ request, onClick }: MobileRequestCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 p-4 rounded-2xl",
        "bg-card border border-border/50",
        "min-h-[88px] text-left",
        "active:scale-[0.98] transition-all duration-200",
        "hover:bg-white/60 dark:hover:bg-white/10 hover:shadow-sm",
        "touch-manipulation"
      )}
    >
      <RequestIcon type={request.type} icon={request.icon} />
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-medium text-sm truncate">{request.title}</h3>
          <Badge variant={getStatusBadgeVariant(request.status)} className="shrink-0 text-[10px]">
            {getStatusLabel(request.status)}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5 truncate">
          {request.subtitle}
        </p>
      </div>
      
      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
    </button>
  );
}
