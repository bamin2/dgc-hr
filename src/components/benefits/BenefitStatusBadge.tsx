import { cn } from '@/lib/utils';
import type { BenefitStatus } from '@/hooks/useBenefitPlans';
import type { EnrollmentStatus } from '@/hooks/useBenefitEnrollments';

interface BenefitStatusBadgeProps {
  status: BenefitStatus | EnrollmentStatus;
  className?: string;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  active: {
    label: 'Active',
    className: 'bg-success/10 text-success'
  },
  inactive: {
    label: 'Inactive',
    className: 'bg-muted text-muted-foreground'
  },
  pending: {
    label: 'Pending',
    className: 'bg-warning/10 text-warning'
  },
  cancelled: {
    label: 'Cancelled',
    className: 'bg-destructive/10 text-destructive'
  },
  expired: {
    label: 'Expired',
    className: 'bg-muted text-muted-foreground'
  }
};

export const BenefitStatusBadge = ({ status, className }: BenefitStatusBadgeProps) => {
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
