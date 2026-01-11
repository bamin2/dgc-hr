import { Badge } from "@/components/ui/badge";
import type { OfferStatus, OfferVersionStatus } from "@/hooks/useOffers";

interface OfferStatusBadgeProps {
  status: OfferStatus | OfferVersionStatus;
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  draft: { label: "Draft", variant: "secondary" },
  sent: { label: "Sent", variant: "outline" },
  accepted: { label: "Accepted", variant: "default" },
  rejected: { label: "Rejected", variant: "destructive" },
  expired: { label: "Expired", variant: "secondary" },
  archived: { label: "Archived", variant: "secondary" },
  superseded: { label: "Superseded", variant: "secondary" },
};

export function OfferStatusBadge({ status }: OfferStatusBadgeProps) {
  const config = statusConfig[status] || { label: status, variant: "secondary" as const };
  
  return (
    <Badge variant={config.variant} className="capitalize">
      {config.label}
    </Badge>
  );
}
