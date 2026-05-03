import * as React from "react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

interface FormSectionProps {
  /** Section title */
  title: string;
  /** Optional description */
  description?: string;
  /** Form fields */
  children: React.ReactNode;
  /** Show separator above section (deprecated - use spacing instead) */
  separator?: boolean;
  /** Additional class names */
  className?: string;
  /** Content layout - grid for side-by-side fields */
  layout?: "stack" | "grid";
  /** Visual variant - surface adds subtle background container */
  variant?: "default" | "surface";
}

/**
 * FormSection - Consistent form grouping component
 * 
 * Provides:
 * - Section title with consistent typography
 * - Optional description
 * - Consistent spacing
 * - Optional separator
 * - Grid or stack layout for fields
 * 
 * @example
 * <FormSection 
 *   title="Personal Information" 
 *   description="Enter the employee's personal details"
 *   layout="grid"
 * >
 *   <FormField name="firstName" ... />
 *   <FormField name="lastName" ... />
 * </FormSection>
 */
export function FormSection({
  title,
  description,
  children,
  separator = false,
  className,
  layout = "stack",
  variant = "default",
}: FormSectionProps) {
  const contentClasses = cn(
    layout === "grid"
      ? "grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6"
      : "space-y-4"
  );

  return (
    <div className={cn("space-y-4", className)}>
      {/* Section Header */}
      <div className="space-y-1">
        <h3 className="text-base font-medium text-foreground">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>

      {/* Section Content */}
      {variant === "surface" ? (
        <div className="bg-white/60 dark:bg-white/5 rounded-xl p-4">
          <div className={contentClasses}>{children}</div>
        </div>
      ) : (
        <div className={contentClasses}>{children}</div>
      )}
    </div>
  );
}

/**
 * FormSectionDivider - Visual separator between form sections
 */
export function FormSectionDivider({ className }: { className?: string }) {
  return <Separator className={cn("my-6 sm:my-8", className)} />;
}

/**
 * FormFieldGroup - Group related fields horizontally
 */
interface FormFieldGroupProps {
  children: React.ReactNode;
  className?: string;
}

export function FormFieldGroup({ children, className }: FormFieldGroupProps) {
  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 gap-4", className)}>
      {children}
    </div>
  );
}

/**
 * FormActions - Consistent form action buttons container
 */
interface FormActionsProps {
  children: React.ReactNode;
  className?: string;
  /** Align actions to start, end, or space between */
  align?: "start" | "end" | "between";
}

export function FormActions({
  children,
  className,
  align = "end",
}: FormActionsProps) {
  return (
    <div
      className={cn(
        "flex flex-col-reverse sm:flex-row gap-3 pt-4 sm:pt-6",
        align === "start" && "sm:justify-start",
        align === "end" && "sm:justify-end",
        align === "between" && "sm:justify-between",
        className
      )}
    >
      {children}
    </div>
  );
}
