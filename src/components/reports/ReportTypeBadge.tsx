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
    className: 'bg-info/10 text-info dark:bg-info/10 dark:text-info'
  },
  payroll: {
    label: 'Payroll',
    icon: Wallet,
    className: 'bg-success/10 text-success dark:bg-success/10 dark:text-success'
  },
  benefits: {
    label: 'Benefits',
    icon: Gift,
    className: 'bg-warning/10 text-warning dark:bg-warning/10 dark:text-warning'
  },
  employees: {
    label: 'Employees',
    icon: Users,
    className: 'bg-warning/10 text-warning dark:bg-warning/10 dark:text-warning'
  },
  leave: {
    label: 'Leave',
    icon: Clock,
    className: 'bg-info/10 text-info dark:bg-info/10 dark:text-info'
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
