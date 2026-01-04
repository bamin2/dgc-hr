import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: 'active' | 'on_leave' | 'inactive';
  className?: string;
}

const statusConfig = {
  active: {
    label: 'Active',
    className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
  },
  on_leave: {
    label: 'On Leave',
    className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
  },
  inactive: {
    label: 'Inactive',
    className: 'bg-muted text-muted-foreground'
  }
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
      config.className,
      className
    )}>
      {config.label}
    </span>
  );
}
