import { cn } from "@/lib/utils";

interface BentoCardProps {
  children: React.ReactNode;
  className?: string;
  colSpan?: 4 | 5 | 6 | 7 | 8 | 12;
  onClick?: () => void;
  noPadding?: boolean;
}

/**
 * LiquidGlass V2 styled card for Bento Grid layout.
 * Uses glass morphism with subtle borders and backdrop blur.
 */
export function BentoCard({
  children,
  className,
  colSpan = 12,
  onClick,
  noPadding = false,
}: BentoCardProps) {
  const colSpanClasses = {
    4: "col-span-12 lg:col-span-4",
    5: "col-span-12 lg:col-span-5",
    6: "col-span-12 lg:col-span-6",
    7: "col-span-12 lg:col-span-7",
    8: "col-span-12 lg:col-span-8",
    12: "col-span-12",
  };

  return (
    <div
      className={cn(
        // Base Liquid Glass styling
        "rounded-2xl border border-white/40 dark:border-white/15 bg-white/80 dark:bg-white/10 backdrop-blur-md shadow-[0_4px_12px_rgba(0,0,0,0.04)]",
        // Hover effects
        "hover:bg-white/90 dark:hover:bg-white/15 hover:border-white/50 dark:hover:border-white/20 hover:shadow-[0_12px_30px_rgba(0,0,0,0.06)]",
        // Transitions
        "transition-all duration-200",
        // Grid span
        colSpanClasses[colSpan],
        // Padding
        !noPadding && "p-5",
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
