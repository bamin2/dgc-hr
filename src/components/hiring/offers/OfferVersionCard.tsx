import { Card, CardContent } from "@/components/ui/card";
import { OfferStatusBadge } from "./OfferStatusBadge";
import type { OfferVersion } from "@/hooks/useOffers";
import { format } from "date-fns";

interface OfferVersionCardProps {
  version: OfferVersion;
  isSelected?: boolean;
  onClick?: () => void;
}

export function OfferVersionCard({ version, isSelected, onClick }: OfferVersionCardProps) {
  return (
    <Card 
      className={`cursor-pointer transition-colors ${isSelected ? 'ring-2 ring-primary' : 'hover:bg-muted/50'}`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold">Version {version.version_number}</span>
          <OfferStatusBadge status={version.status} />
        </div>
        <div className="text-sm text-muted-foreground space-y-1">
          <p>{version.currency_code} {version.gross_pay_total?.toLocaleString()} / month</p>
          {version.sent_at && <p>Sent: {format(new Date(version.sent_at), "MMM d, yyyy")}</p>}
          {version.accepted_at && <p>Accepted: {format(new Date(version.accepted_at), "MMM d, yyyy")}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
