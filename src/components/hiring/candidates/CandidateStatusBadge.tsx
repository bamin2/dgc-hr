import { Badge } from "@/components/ui/badge";
import type { CandidateStatus } from "@/hooks/useCandidates";

interface CandidateStatusBadgeProps {
  status: CandidateStatus;
}

const statusConfig: Record<CandidateStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  draft: { label: "Draft", variant: "secondary" },
  in_process: { label: "In Process", variant: "default" },
  offer_sent: { label: "Offer Sent", variant: "outline" },
  offer_accepted: { label: "Accepted", variant: "default" },
  offer_rejected: { label: "Rejected", variant: "destructive" },
  archived: { label: "Archived", variant: "secondary" },
};

export function CandidateStatusBadge({ status }: CandidateStatusBadgeProps) {
  const config = statusConfig[status] || { label: status, variant: "secondary" as const };
  
  return (
    <Badge variant={config.variant} className="capitalize">
      {config.label}
    </Badge>
  );
}
