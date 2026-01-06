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
    className: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  },
  hr: {
    label: "HR",
    icon: Users,
    className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  },
  manager: {
    label: "Manager",
    icon: UserCheck,
    className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  },
  it: {
    label: "IT",
    icon: Monitor,
    className: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
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
