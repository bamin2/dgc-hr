import { cn } from "@/lib/utils";

interface BentoCardProps {
  children: React.ReactNode;
  className?: string;
  /** Column span for 8-col desktop grid (maps to 6-col tablet automatically) 
   * Note: 12 is supported for backwards compatibility and maps to 8 (full width)
   * 7 is supported for backwards compatibility and maps to 5
   */
  colSpan?: 2 | 3 | 4 | 5 | 6 | 7 | 8 | 12;
  onClick?: () => void;
  noPadding?: boolean;
}

/**
 * Bento Grid card with a solid surface and subtle border.
 *
 * Grid System (8-col desktop, 6-col tablet, 1-col mobile):
 * - colSpan 2 = Quarter (2/8 desktop, 2/6 tablet)
 * - colSpan 3 = Third (3/8 desktop, 3/6 tablet)
 * - colSpan 4 = Half (4/8 desktop, 3/6 tablet)
 * - colSpan 5 = ~Two-thirds (5/8 desktop, 4/6 tablet)
 * - colSpan 6 = Three-quarters (6/8 desktop, 4/6 tablet)
 * - colSpan 8 = Full width (8/8 desktop, 6/6 tablet)
 */
export function BentoCard({
  children,
  className,
  colSpan = 8,
  onClick,
  noPadding = false,
}: BentoCardProps) {
  // Map spans to Tailwind classes (8-col desktop, 6-col tablet, 1-col mobile)
  // Includes backwards-compatible mappings for 7 and 12
  const colSpanClasses: Record<number, string> = {
    2: "col-span-1 sm:col-span-2 lg:col-span-2",   // Quarter
    3: "col-span-1 sm:col-span-3 lg:col-span-3",   // Third (rounded)
    4: "col-span-1 sm:col-span-3 lg:col-span-4",   // Half
    5: "col-span-1 sm:col-span-4 lg:col-span-5",   // ~Two-thirds
    6: "col-span-1 sm:col-span-4 lg:col-span-6",   // Three-quarters
    7: "col-span-1 sm:col-span-5 lg:col-span-5",   // Legacy: maps to ~5 cols
    8: "col-span-1 sm:col-span-6 lg:col-span-8",   // Full
    12: "col-span-1 sm:col-span-6 lg:col-span-8",  // Legacy: maps to full width
  };

  return (
    <div
      className={cn(
        // Solid surface with subtle border - no glass, no blur
        "rounded-2xl border border-border bg-surface shadow-sm",
        // Quiet hover - shadow only
        "hover:shadow-md",
        "transition-shadow duration-200",
        // Grid span - updated to 8-col system
        colSpanClasses[colSpan],
        // Padding - responsive: p-4 mobile, p-5 tablet+
        !noPadding && "p-4 sm:p-5",
        // Interactive styling
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </div>
  );
}
