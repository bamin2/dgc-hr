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
 * LiquidGlass V2 styled card for Bento Grid layout.
 * Uses glass morphism with subtle borders and backdrop blur.
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
        // Base Liquid Glass styling - responsive blur/shadow
        "rounded-2xl border border-white/40 dark:border-white/15",
        "bg-white/80 dark:bg-white/10",
        "backdrop-blur-sm sm:backdrop-blur-md",
        "shadow-[0_3px_8px_rgba(0,0,0,0.03)] sm:shadow-[0_4px_12px_rgba(0,0,0,0.04)]",
        // Hover effects - also scaled
        "hover:bg-white/90 dark:hover:bg-white/15 hover:border-white/50 dark:hover:border-white/20",
        "hover:shadow-[0_8px_20px_rgba(0,0,0,0.04)] sm:hover:shadow-[0_12px_30px_rgba(0,0,0,0.06)]",
        // Transitions
        "transition-all duration-200",
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
