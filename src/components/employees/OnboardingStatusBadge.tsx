import { cn } from "@/lib/utils";
import { OnboardingStatus } from "@/hooks/useOnboarding";

interface OnboardingStatusBadgeProps {
  status: OnboardingStatus;
  className?: string;
}

const statusConfig: Record<OnboardingStatus, { label: string; dotClass: string; bgClass: string; textClass: string }> = {
  completed: {
    label: 'Completed',
    dotClass: 'bg-success',
    bgClass: 'bg-success/10',
    textClass: 'text-success',
  },
  in_progress: {
    label: 'Onboarding',
    dotClass: 'bg-primary',
    bgClass: 'bg-primary/10',
    textClass: 'text-primary',
  },
  pending: {
    label: 'Pending',
    dotClass: 'bg-warning',
    bgClass: 'bg-warning/10',
    textClass: 'text-warning',
  },
  scheduled: {
    label: 'Scheduled',
    dotClass: 'bg-info',
    bgClass: 'bg-info/10',
    textClass: 'text-info',
  },
  incomplete: {
    label: 'Incomplete',
    dotClass: 'bg-destructive',
    bgClass: 'bg-destructive/10',
    textClass: 'text-destructive',
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
