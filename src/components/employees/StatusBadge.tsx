import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: 'active' | 'on_leave' | 'on_boarding' | 'probation' | 'terminated' | 'resigned';
  className?: string;
}

const statusConfig = {
  active: {
    label: 'ACTIVE',
    className: 'border-success/30 bg-success/10 text-success dark:border-success dark:bg-success/10 dark:text-success',
    dotClassName: 'bg-success'
  },
  on_boarding: {
    label: 'ON BOARDING',
    className: 'border-warning/30 bg-warning/10 text-warning dark:border-warning dark:bg-warning/10 dark:text-warning',
    dotClassName: 'bg-warning'
  },
  probation: {
    label: 'PROBATION',
    className: 'border-warning/30 bg-warning/10 text-warning dark:border-warning dark:bg-warning/10 dark:text-warning',
    dotClassName: 'bg-warning'
  },
  on_leave: {
    label: 'ON LEAVE',
    className: 'border-destructive/30 bg-destructive/10 text-destructive dark:border-destructive dark:bg-destructive/10 dark:text-destructive',
    dotClassName: 'bg-destructive'
  },
  terminated: {
    label: 'TERMINATED',
    className: 'border-border bg-muted text-muted-foreground dark:border-border dark:bg-muted dark:text-muted-foreground',
    dotClassName: 'bg-muted'
  },
  resigned: {
    label: 'RESIGNED',
    className: 'border-border bg-muted text-muted-foreground dark:border-border dark:bg-muted dark:text-muted-foreground',
    dotClassName: 'bg-muted'
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
