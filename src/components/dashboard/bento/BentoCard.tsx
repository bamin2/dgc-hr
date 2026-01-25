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
        // Base glass styling
        "rounded-2xl border border-border/50 bg-card/80 backdrop-blur-md shadow-sm",
        // Hover effects
        "hover:bg-card/90 hover:border-border/70 hover:shadow-md",
        // Transitions
        "transition-all duration-200 ease-out",
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
