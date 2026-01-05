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
    className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
  },
  inactive: {
    label: 'Inactive',
    className: 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400'
  },
  pending: {
    label: 'Pending',
    className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
  },
  cancelled: {
    label: 'Cancelled',
    className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
  },
  expired: {
    label: 'Expired',
    className: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
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
