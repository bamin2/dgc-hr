import * as React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon, FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  /** Icon to display (Lucide icon component) */
  icon?: LucideIcon;
  /** Main title */
  title: string;
  /** Description text */
  description?: string;
  /** Primary action button */
  action?: {
    label: string;
    onClick: () => void;
    variant?: "default" | "outline" | "secondary";
  };
  /** Secondary action */
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  /** Additional class names */
  className?: string;
  /** Size variant */
  size?: "sm" | "default" | "lg";
  /** Children for custom content below description */
  children?: React.ReactNode;
}

/**
 * EmptyState - Consistent empty state component
 * 
 * Use when:
 * - A list/table has no data
 * - A search returns no results
 * - A feature hasn't been set up yet
 * 
 * @example
 * <EmptyState
 *   icon={Users}
 *   title="No employees yet"
 *   description="Get started by adding your first team member"
 *   action={{ label: "Add Employee", onClick: () => setDialogOpen(true) }}
 * />
 */
export function EmptyState({
  icon: Icon = FileQuestion,
  title,
  description,
  action,
  secondaryAction,
  className,
  size = "default",
  children,
}: EmptyStateProps) {
  const iconSizes = {
    sm: "h-8 w-8",
    default: "h-12 w-12",
    lg: "h-16 w-16",
  };

  const outerCircleSizes = {
    sm: "h-[72px] w-[72px]",
    default: "h-24 w-24",
    lg: "h-[120px] w-[120px]",
  };

  const innerCircleSizes = {
    sm: "h-14 w-14",
    default: "h-[72px] w-[72px]",
    lg: "h-[88px] w-[88px]",
  };

  const containerPadding = {
    sm: "py-6 px-4",
    default: "py-12 px-6",
    lg: "py-16 px-8",
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        containerPadding[size],
        className
      )}
    >
      {/* Layered icon visual: gold-tinted outer ring, card inner circle, primary icon */}
      <div
        className={cn(
          "rounded-full bg-accent/10 flex items-center justify-center mb-4",
          outerCircleSizes[size]
        )}
      >
        <div
          className={cn(
            "rounded-full bg-card border border-border flex items-center justify-center",
            innerCircleSizes[size]
          )}
        >
          <Icon className={cn("text-primary", iconSizes[size])} />
        </div>
      </div>

      {/* Title */}
      <h3
        className={cn(
          "font-medium text-foreground",
          size === "sm" && "text-sm",
          size === "default" && "text-base",
          size === "lg" && "text-lg"
        )}
      >
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p
          className={cn(
            "mt-1 text-muted-foreground max-w-md",
            size === "sm" && "text-xs",
            size === "default" && "text-sm",
            size === "lg" && "text-base"
          )}
        >
          {description}
        </p>
      )}

      {/* Custom content */}
      {children && <div className="mt-4">{children}</div>}

      {/* Actions */}
      {(action || secondaryAction) && (
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          {action && (
            <Button
              onClick={action.onClick}
              variant={action.variant || "default"}
              size={size === "sm" ? "sm" : "default"}
            >
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button
              onClick={secondaryAction.onClick}
              variant="outline"
              size={size === "sm" ? "sm" : "default"}
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * NoSearchResults - Specialized empty state for search
 */
interface NoSearchResultsProps {
  searchTerm?: string;
  onClear?: () => void;
  className?: string;
}

export function NoSearchResults({
  searchTerm,
  onClear,
  className,
}: NoSearchResultsProps) {
  return (
    <EmptyState
      icon={FileQuestion}
      title="No results found"
      description={
        searchTerm
          ? `No results match "${searchTerm}". Try adjusting your search or filters.`
          : "Try adjusting your search or filters."
      }
      action={onClear ? { label: "Clear search", onClick: onClear, variant: "outline" } : undefined}
      className={className}
      size="sm"
    />
  );
}
