import { cn } from "@/lib/utils";

interface BentoGridProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * 12-column Bento Grid container for dashboard layout.
 * Desktop: 12-column grid with gap-4
 * Mobile/Tablet: Single column stacking
 */
export function BentoGrid({ children, className }: BentoGridProps) {
  return (
    <div
      className={cn(
        // Grid layout
        "grid grid-cols-1 lg:grid-cols-12 gap-4",
        // Container constraints
        "max-w-[1280px] mx-auto",
        // Responsive padding
        "px-4 sm:px-6",
        className
      )}
    >
      {children}
    </div>
  );
}
