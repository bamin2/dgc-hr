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
      <Badge className="gap-1 bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200">
        <AlertTriangle className="h-3 w-3" />
        {showDaysRemaining ? `Expires in ${daysUntilExpiry} days` : 'Expiring Soon'}
      </Badge>
    );
  }
  
  return (
    <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-emerald-200">
      Valid
    </Badge>
  );
}
