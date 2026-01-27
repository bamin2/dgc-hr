import { cn } from "@/lib/utils";

interface BentoGridProps {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

/**
 * 12-column Bento Grid container for dashboard layout.
 * Desktop: 12-column grid with gap-4
 * Mobile/Tablet: Single column stacking
 */
export function BentoGrid({ children, className, noPadding = false }: BentoGridProps) {
  return (
    <div
      className={cn(
        // Grid layout - aligned to 8-column system
        // Desktop: 8 columns, Tablet: 6 columns, Mobile: 1 column
        "grid grid-cols-1 sm:grid-cols-6 lg:grid-cols-8 gap-4",
        // Container constraints (only when not nested)
        !noPadding && "max-w-[1152px] mx-auto",
        className
      )}
    >
      {children}
    </div>
  );
}
