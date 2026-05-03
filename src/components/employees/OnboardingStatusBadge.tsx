import { cn } from "@/lib/utils";
import { OnboardingStatus } from "@/hooks/useOnboarding";

interface OnboardingStatusBadgeProps {
  status: OnboardingStatus;
  className?: string;
}

const statusConfig: Record<OnboardingStatus, { label: string; dotClass: string; bgClass: string; textClass: string }> = {
  completed: {
    label: 'Completed',
    dotClass: 'bg-emerald-500',
    bgClass: 'bg-emerald-50 dark:bg-emerald-500/10',
    textClass: 'text-emerald-700 dark:text-emerald-400',
  },
  in_progress: {
    label: 'Onboarding',
    dotClass: 'bg-primary',
    bgClass: 'bg-primary/10',
    textClass: 'text-primary',
  },
  pending: {
    label: 'Pending',
    dotClass: 'bg-amber-500',
    bgClass: 'bg-amber-50 dark:bg-amber-500/10',
    textClass: 'text-amber-700 dark:text-amber-400',
  },
  scheduled: {
    label: 'Scheduled',
    dotClass: 'bg-teal-500',
    bgClass: 'bg-teal-50 dark:bg-teal-500/10',
    textClass: 'text-teal-700 dark:text-teal-400',
  },
  incomplete: {
    label: 'Incomplete',
    dotClass: 'bg-red-500',
    bgClass: 'bg-red-50 dark:bg-red-500/10',
    textClass: 'text-red-700 dark:text-red-400',
  },
};

export function OnboardingStatusBadge({ status, className }: OnboardingStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
        config.bgClass,
        config.textClass,
        className
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full", config.dotClass)} />
      {config.label}
    </span>
  );
}
