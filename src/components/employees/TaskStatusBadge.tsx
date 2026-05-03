import { cn } from "@/lib/utils";
import { TaskStatus } from "@/hooks/useOnboarding";

interface TaskStatusBadgeProps {
  status: TaskStatus;
  className?: string;
}

const statusConfig: Record<TaskStatus, { label: string; className: string }> = {
  pending: {
    label: "Pending",
    className: "bg-muted text-muted-foreground",
  },
  in_progress: {
    label: "In Progress",
    className: "bg-info/10 text-info dark:bg-info/10 dark:text-info",
  },
  completed: {
    label: "Completed",
    className: "bg-success/10 text-success dark:bg-success/10 dark:text-success",
  },
  skipped: {
    label: "Skipped",
    className: "bg-warning/10 text-warning dark:bg-warning/10 dark:text-warning",
  },
};

export function TaskStatusBadge({ status, className }: TaskStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium",
        config.className,
        className
      )}
    >
      <span
        className={cn(
          "w-1.5 h-1.5 rounded-full",
          status === "pending" && "bg-muted-foreground",
          status === "in_progress" && "bg-info",
          status === "completed" && "bg-success",
          status === "skipped" && "bg-warning"
        )}
      />
      {config.label}
    </span>
  );
}
