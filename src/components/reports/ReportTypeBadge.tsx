import { cn } from '@/lib/utils';
import { Calendar, Wallet, Gift, Users, Clock } from 'lucide-react';
import type { ReportType } from '@/hooks/useReportAnalytics';

interface ReportTypeBadgeProps {
  type: ReportType;
  showIcon?: boolean;
  className?: string;
}

const typeConfig: Record<ReportType, { label: string; icon: typeof Calendar; className: string }> = {
  attendance: {
    label: 'Attendance',
    icon: Calendar,
    className: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400'
  },
  payroll: {
    label: 'Payroll',
    icon: Wallet,
    className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
  },
  benefits: {
    label: 'Benefits',
    icon: Gift,
    className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
  },
  employees: {
    label: 'Employees',
    icon: Users,
    className: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
  },
  leave: {
    label: 'Leave',
    icon: Clock,
    className: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400'
  }
};

export const ReportTypeBadge = ({ type, showIcon = true, className }: ReportTypeBadgeProps) => {
  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
        config.className,
        className
      )}
    >
      {showIcon && <Icon className="h-3 w-3" />}
      {config.label}
    </span>
  );
};
