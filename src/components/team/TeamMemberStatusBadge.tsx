import { cn } from "@/lib/utils";
import { TeamMemberStatus } from "@/data/team";

interface TeamMemberStatusBadgeProps {
  status: TeamMemberStatus;
  className?: string;
}

const statusConfig: Record<TeamMemberStatus, { label: string; dotColor: string; textColor: string }> = {
  active: { label: 'Active', dotColor: 'bg-emerald-500', textColor: 'text-emerald-700 dark:text-emerald-400' },
  draft: { label: 'Draft', dotColor: 'bg-orange-500', textColor: 'text-orange-700 dark:text-orange-400' },
  absent: { label: 'Absent', dotColor: 'bg-red-500', textColor: 'text-red-700 dark:text-red-400' },
  onboarding: { label: 'Onboarding', dotColor: 'bg-blue-500', textColor: 'text-blue-700 dark:text-blue-400' },
  offboarding: { label: 'Offboarding', dotColor: 'bg-yellow-500', textColor: 'text-yellow-700 dark:text-yellow-400' },
  dismissed: { label: 'Dismissed', dotColor: 'bg-gray-500', textColor: 'text-gray-700 dark:text-gray-400' },
};

export function TeamMemberStatusBadge({ status, className }: TeamMemberStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className={cn("w-2 h-2 rounded-full", config.dotColor)} />
      <span className={cn("text-sm font-medium", config.textColor)}>
        {config.label}
      </span>
    </div>
  );
}
