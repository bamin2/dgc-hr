import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: 'active' | 'on_leave' | 'on_boarding' | 'probation' | 'terminated' | 'resigned';
  className?: string;
}

const statusConfig = {
  active: {
    label: 'ACTIVE',
    className: 'border-success/30 bg-success/10 text-success',
    dotClassName: 'bg-success'
  },
  on_boarding: {
    label: 'ON BOARDING',
    className: 'border-info/30 bg-info/10 text-info',
    dotClassName: 'bg-info'
  },
  probation: {
    label: 'PROBATION',
    className: 'border-warning/30 bg-warning/10 text-warning',
    dotClassName: 'bg-warning'
  },
  on_leave: {
    label: 'ON LEAVE',
    className: 'border-warning/30 bg-warning/10 text-warning',
    dotClassName: 'bg-warning'
  },
  terminated: {
    label: 'TERMINATED',
    className: 'border-destructive/30 bg-destructive/10 text-destructive',
    dotClassName: 'bg-destructive'
  },
  resigned: {
    label: 'RESIGNED',
    className: 'border-muted-foreground/30 bg-muted text-muted-foreground',
    dotClassName: 'bg-muted-foreground'
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
