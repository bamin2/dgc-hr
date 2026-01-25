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
        // Grid layout
        "grid grid-cols-1 lg:grid-cols-12 gap-4",
        // Container constraints (only when not nested)
        !noPadding && "max-w-[1280px] mx-auto",
        // Responsive padding (only when not nested)
        !noPadding && "px-4 sm:px-6",
        className
      )}
    >
      {children}
    </div>
  );
}
