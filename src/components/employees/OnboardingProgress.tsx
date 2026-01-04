import { cn } from "@/lib/utils";

interface OnboardingProgressProps {
  value: number; // 0-100
  className?: string;
}

export function OnboardingProgress({ value, className }: OnboardingProgressProps) {
  const segments = 4;
  const filledSegments = Math.round((value / 100) * segments);

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex items-center gap-1">
        {Array.from({ length: segments }).map((_, index) => (
          <div
            key={index}
            className={cn(
              "w-6 h-2 rounded-full transition-colors",
              index < filledSegments
                ? "bg-primary"
                : "bg-muted"
            )}
          />
        ))}
      </div>
      <span className="text-sm font-medium text-foreground min-w-[40px]">
        {value}%
      </span>
    </div>
  );
}
