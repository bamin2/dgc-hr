import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

interface Breadcrumb {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  /** Main page title */
  title: string;
  /** Optional subtitle/description */
  subtitle?: string;
  /** Breadcrumb navigation */
  breadcrumbs?: Breadcrumb[];
  /** Action buttons (right side) */
  actions?: React.ReactNode;
  /** Additional class names */
  className?: string;
  /** Children rendered below title (e.g., tabs, filters) */
  children?: React.ReactNode;
}

/**
 * PageHeader - Consistent page header component
 * 
 * Provides:
 * - Standardized title typography
 * - Optional subtitle
 * - Optional breadcrumb navigation
 * - Action buttons aligned to the right
 * - Responsive stacking on mobile
 * 
 * @example
 * <PageHeader
 *   title="Employees"
 *   subtitle="Manage your team members"
 *   breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Employees" }]}
 *   actions={<Button>Add Employee</Button>}
 * />
 */
export function PageHeader({
  title,
  subtitle,
  breadcrumbs,
  actions,
  className,
  children,
}: PageHeaderProps) {
  return (
    <div className={cn("mb-6 sm:mb-8", className)}>
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-3">
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={index}>
              {index > 0 && <ChevronRight className="h-4 w-4" />}
              {crumb.href ? (
                <Link
                  to={crumb.href}
                  className="hover:text-foreground transition-colors"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-foreground font-medium">{crumb.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}

      {/* Title Row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm sm:text-base text-muted-foreground">
              {subtitle}
            </p>
          )}
        </div>

        {/* Actions */}
        {actions && (
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {actions}
          </div>
        )}
      </div>

      {/* Additional content (tabs, filters, etc.) */}
      {children && <div className="mt-4 sm:mt-6">{children}</div>}
    </div>
  );
}

/**
 * PageHeaderSkeleton - Loading state for PageHeader
 */
export function PageHeaderSkeleton() {
  return (
    <div className="mb-6 sm:mb-8 animate-pulse">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="h-7 sm:h-8 w-48 bg-muted rounded" />
          <div className="h-5 w-64 bg-muted rounded" />
        </div>
        <div className="flex gap-2">
          <div className="h-10 w-24 bg-muted rounded" />
          <div className="h-10 w-32 bg-muted rounded" />
        </div>
      </div>
    </div>
  );
}
