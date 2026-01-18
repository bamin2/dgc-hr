import * as React from "react";
import { cn } from "@/lib/utils";

interface PageShellProps {
  children: React.ReactNode;
  /** Use full width without max-width constraint (e.g., org chart) */
  fullWidth?: boolean;
  /** Remove default padding */
  noPadding?: boolean;
  /** Additional class names */
  className?: string;
}

/**
 * PageShell - Consistent page wrapper component
 * 
 * Provides:
 * - Maximum width of 1400px to prevent overly wide layouts on large monitors
 * - Centered content with proper margins
 * - Responsive horizontal and vertical padding
 * - Consistent base styling across all pages
 * 
 * @example
 * <PageShell>
 *   <PageHeader title="Dashboard" />
 *   <DashboardContent />
 * </PageShell>
 */
export function PageShell({
  children,
  fullWidth = false,
  noPadding = false,
  className,
}: PageShellProps) {
  return (
    <div
      className={cn(
        "w-full min-h-full",
        !fullWidth && "max-w-[1400px] mx-auto",
        !noPadding && "px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8",
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * PageShellContent - Inner content wrapper with consistent spacing
 * Use within PageShell for main content area
 */
interface PageShellContentProps {
  children: React.ReactNode;
  className?: string;
}

export function PageShellContent({ children, className }: PageShellContentProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {children}
    </div>
  );
}
