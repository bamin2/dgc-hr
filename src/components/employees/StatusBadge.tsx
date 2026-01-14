import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: 'active' | 'on_leave' | 'on_boarding' | 'probation' | 'terminated' | 'resigned' | 'inactive';
  className?: string;
}

const statusConfig = {
  active: {
    label: 'ACTIVE',
    className: 'border-emerald-300 bg-emerald-50 text-emerald-600 dark:border-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400',
    dotClassName: 'bg-emerald-500'
  },
  on_boarding: {
    label: 'ON BOARDING',
    className: 'border-orange-300 bg-orange-50 text-orange-600 dark:border-orange-600 dark:bg-orange-950/50 dark:text-orange-400',
    dotClassName: 'bg-orange-500'
  },
  probation: {
    label: 'PROBATION',
    className: 'border-yellow-300 bg-yellow-50 text-yellow-600 dark:border-yellow-600 dark:bg-yellow-950/50 dark:text-yellow-400',
    dotClassName: 'bg-yellow-500'
  },
  on_leave: {
    label: 'ON LEAVE',
    className: 'border-red-300 bg-red-50 text-red-600 dark:border-red-600 dark:bg-red-950/50 dark:text-red-400',
    dotClassName: 'bg-red-500'
  },
  terminated: {
    label: 'TERMINATED',
    className: 'border-gray-300 bg-gray-50 text-gray-600 dark:border-gray-600 dark:bg-gray-950/50 dark:text-gray-400',
    dotClassName: 'bg-gray-500'
  },
  resigned: {
    label: 'RESIGNED',
    className: 'border-slate-300 bg-slate-50 text-slate-600 dark:border-slate-600 dark:bg-slate-950/50 dark:text-slate-400',
    dotClassName: 'bg-slate-500'
  },
  inactive: {
    label: 'INACTIVE',
    className: 'border-gray-300 bg-gray-50 text-gray-600 dark:border-gray-600 dark:bg-gray-950/50 dark:text-gray-400',
    dotClassName: 'bg-gray-500'
  }
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wide border",
      config.className,
      className
    )}>
      <span className={cn("h-1.5 w-1.5 rounded-full", config.dotClassName)} />
      {config.label}
    </span>
  );
}
