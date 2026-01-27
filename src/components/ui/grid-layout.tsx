import { cn } from "@/lib/utils";

// ============================================
// PAGE CONTAINER - Outer wrapper with app padding
// ============================================
interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  /** For pages like org-chart that need full width */
  fullWidth?: boolean;
}

/**
 * PageContainer - Outer wrapper with app padding (24px desktop, 16px mobile)
 * Centers content at max-w-[1152px] unless fullWidth is true
 */
export function PageContainer({ children, className, fullWidth }: PageContainerProps) {
  return (
    <div className={cn(
      "w-full",
      // App outer padding: 16px mobile, 24px desktop
      "px-4 sm:px-6",
      // Vertical padding
      "py-4 sm:py-6",
      className
    )}>
      {fullWidth ? children : (
        <div className="w-full max-w-[1152px] mx-auto">
          {children}
        </div>
      )}
    </div>
  );
}

// ============================================
// GRID - 8-column centered grid container
// ============================================
interface GridProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Grid - 8-column desktop, 6-column tablet, 1-column mobile
 * Gap: 16px (gap-4)
 */
export function Grid({ children, className }: GridProps) {
  return (
    <div className={cn(
      "w-full",
      // Desktop: 8 columns, Tablet: 6 columns, Mobile: 1 column
      "grid grid-cols-1 sm:grid-cols-6 lg:grid-cols-8",
      // Consistent 16px gap
      "gap-4",
      className
    )}>
      {children}
    </div>
  );
}

// ============================================
// GRID ITEM - Individual grid cell with span control
// ============================================
interface GridItemProps {
  children: React.ReactNode;
  className?: string;
  /** Desktop column span (8-col grid) */
  span?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  /** Tablet column span (6-col grid) - defaults to proportional */
  tabletSpan?: 1 | 2 | 3 | 4 | 5 | 6;
}

/**
 * GridItem - Individual grid cell with responsive span control
 * Mobile: Always full width (col-span-1)
 * Tablet: Uses tabletSpan or auto-calculated from desktop span
 * Desktop: Uses span prop
 */
export function GridItem({ 
  children, 
  className,
  span = 8,
  tabletSpan,
}: GridItemProps) {
  // Map spans to Tailwind classes
  const desktopSpanClasses = {
    1: "lg:col-span-1",
    2: "lg:col-span-2",
    3: "lg:col-span-3",
    4: "lg:col-span-4",
    5: "lg:col-span-5",
    6: "lg:col-span-6",
    7: "lg:col-span-7",
    8: "lg:col-span-8",
  };
  
  const tabletSpanClasses = {
    1: "sm:col-span-1",
    2: "sm:col-span-2",
    3: "sm:col-span-3",
    4: "sm:col-span-4",
    5: "sm:col-span-5",
    6: "sm:col-span-6",
  };
  
  // Calculate tablet span if not provided (proportional: 8 cols → 6 cols)
  const effectiveTabletSpan = tabletSpan ?? Math.min(6, Math.max(1, Math.round(span * 0.75))) as 1|2|3|4|5|6;
  
  return (
    <div className={cn(
      "col-span-1",  // Mobile: always full width
      tabletSpanClasses[effectiveTabletSpan],
      desktopSpanClasses[span],
      className
    )}>
      {children}
    </div>
  );
}
