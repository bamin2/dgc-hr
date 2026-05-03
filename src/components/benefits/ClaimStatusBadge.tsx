import { cn } from '@/lib/utils';
import type { ClaimStatus } from '@/hooks/useBenefitClaims';

interface ClaimStatusBadgeProps {
  status: ClaimStatus;
  className?: string;
}

const statusConfig: Record<ClaimStatus, { label: string; className: string }> = {
  pending: {
    label: 'Pending',
    className: 'bg-warning/10 text-warning'
  },
  processing: {
    label: 'Processing',
    className: 'bg-info/10 text-info'
  },
  approved: {
    label: 'Approved',
    className: 'bg-success/10 text-success'
  },
  rejected: {
    label: 'Rejected',
    className: 'bg-destructive/10 text-destructive'
  }
};

export const ClaimStatusBadge = ({ status, className }: ClaimStatusBadgeProps) => {
  const config = statusConfig[status] || statusConfig.pending;

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
};
