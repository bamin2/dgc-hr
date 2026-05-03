import { Badge } from '@/components/ui/badge';
import { differenceInDays, parseISO, isPast } from 'date-fns';
import { AlertTriangle } from 'lucide-react';

interface InsuranceCardExpiryBadgeProps {
  expiryDate: string | null | undefined;
  showDaysRemaining?: boolean;
}

export function InsuranceCardExpiryBadge({ 
  expiryDate, 
  showDaysRemaining = true 
}: InsuranceCardExpiryBadgeProps) {
  if (!expiryDate) return null;
  
  const expiry = parseISO(expiryDate);
  const daysUntilExpiry = differenceInDays(expiry, new Date());
  
  if (isPast(expiry)) {
    return (
      <Badge variant="destructive" className="gap-1">
        <AlertTriangle className="h-3 w-3" />
        Expired
      </Badge>
    );
  }
  
  if (daysUntilExpiry <= 30) {
    return (
      <Badge className="gap-1 bg-warning/10 text-warning hover:bg-warning/10 border-warning/30">
        <AlertTriangle className="h-3 w-3" />
        {showDaysRemaining ? `Expires in ${daysUntilExpiry} days` : 'Expiring Soon'}
      </Badge>
    );
  }
  
  return (
    <Badge variant="secondary" className="bg-success/10 text-success hover:bg-success/10 border-success/30">
      Valid
    </Badge>
  );
}
