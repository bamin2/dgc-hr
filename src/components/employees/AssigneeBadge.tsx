import { cn } from "@/lib/utils";
import { User, Users, UserCheck, Monitor } from "lucide-react";
import { TaskAssignee } from "@/hooks/useOnboarding";

interface AssigneeBadgeProps {
  assignee: TaskAssignee;
  className?: string;
}

const assigneeConfig: Record<TaskAssignee, { label: string; icon: React.ElementType; className: string }> = {
  employee: {
    label: "Employee",
    icon: User,
    className: "bg-info/10 text-info",
  },
  hr: {
    label: "HR",
    icon: Users,
    className: "bg-muted text-muted-foreground",
  },
  manager: {
    label: "Manager",
    icon: UserCheck,
    className: "bg-success/10 text-success",
  },
  it: {
    label: "IT",
    icon: Monitor,
    className: "bg-warning/10 text-warning",
  },
};

export function AssigneeBadge({ assignee, className }: AssigneeBadgeProps) {
  const config = assigneeConfig[assignee];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
        config.className,
        className
      )}
    >
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
}
