import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type LoanStatus = "requested" | "approved" | "rejected" | "active" | "closed" | "cancelled";

interface LoanStatusBadgeProps {
  status: LoanStatus;
  className?: string;
}

const statusConfig: Record<LoanStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  requested: { label: "Requested", variant: "secondary" },
  approved: { label: "Approved", variant: "default" },
  rejected: { label: "Rejected", variant: "destructive" },
  active: { label: "Active", variant: "default" },
  closed: { label: "Closed", variant: "outline" },
  cancelled: { label: "Cancelled", variant: "outline" },
};

export function LoanStatusBadge({ status, className }: LoanStatusBadgeProps) {
  const config = statusConfig[status] || { label: status, variant: "outline" as const };

  return (
    <Badge 
      variant={config.variant} 
      className={cn(
        status === "active" && "bg-success hover:bg-success",
        status === "approved" && "bg-success hover:bg-success",
        className
      )}
    >
      {config.label}
    </Badge>
  );
}
