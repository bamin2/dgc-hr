import * as React from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

/**
 * PageLoadingSkeleton - Full page loading state
 */
interface PageLoadingSkeletonProps {
  showHeader?: boolean;
  className?: string;
}

export function PageLoadingSkeleton({
  showHeader = true,
  className,
}: PageLoadingSkeletonProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      {showHeader && (
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-5 w-72" />
        </div>
      )}

      {/* Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <CardLoadingSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

/**
 * CardLoadingSkeleton - Individual card loading state
 */
interface CardLoadingSkeletonProps {
  showHeader?: boolean;
  lines?: number;
  className?: string;
}

export function CardLoadingSkeleton({
  showHeader = true,
  lines = 3,
  className,
}: CardLoadingSkeletonProps) {
  return (
    <Card className={cn("animate-pulse", className)}>
      {showHeader && (
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
      )}
      <CardContent className={cn(!showHeader && "pt-6")}>
        <div className="space-y-3">
          {[...Array(lines)].map((_, i) => (
            <Skeleton
              key={i}
              className={cn("h-4", i === lines - 1 ? "w-3/4" : "w-full")}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * TableLoadingSkeleton - Table loading state
 */
interface TableLoadingSkeletonProps {
  rows?: number;
  columns?: number;
  showHeader?: boolean;
  className?: string;
}

export function TableLoadingSkeleton({
  rows = 5,
  columns = 4,
  showHeader = true,
  className,
}: TableLoadingSkeletonProps) {
  return (
    <div className={cn("w-full animate-pulse", className)}>
      {/* Header */}
      {showHeader && (
        <div className="flex gap-4 px-4 py-3 border-b">
          {[...Array(columns)].map((_, i) => (
            <Skeleton key={i} className="h-4 flex-1" />
          ))}
        </div>
      )}

      {/* Rows */}
      {[...Array(rows)].map((_, rowIndex) => (
        <div
          key={rowIndex}
          className="flex gap-4 px-4 py-4 border-b last:border-b-0"
        >
          {[...Array(columns)].map((_, colIndex) => (
            <Skeleton
              key={colIndex}
              className={cn(
                "h-4 flex-1",
                colIndex === 0 && "max-w-[200px]"
              )}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * FormLoadingSkeleton - Form loading state
 */
interface FormLoadingSkeletonProps {
  fields?: number;
  twoColumn?: boolean;
  className?: string;
}

export function FormLoadingSkeleton({
  fields = 4,
  twoColumn = true,
  className,
}: FormLoadingSkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse",
        twoColumn ? "grid grid-cols-1 md:grid-cols-2 gap-6" : "space-y-6",
        className
      )}
    >
      {[...Array(fields)].map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
    </div>
  );
}

/**
 * StatCardSkeleton - Dashboard stat card loading state
 */
export function StatCardSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn("animate-pulse", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-8 w-16" />
          </div>
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * ListLoadingSkeleton - List items loading state
 */
interface ListLoadingSkeletonProps {
  items?: number;
  showAvatar?: boolean;
  className?: string;
}

export function ListLoadingSkeleton({
  items = 5,
  showAvatar = true,
  className,
}: ListLoadingSkeletonProps) {
  return (
    <div className={cn("space-y-4 animate-pulse", className)}>
      {[...Array(items)].map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          {showAvatar && <Skeleton className="h-10 w-10 rounded-full" />}
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-8 w-20" />
        </div>
      ))}
    </div>
  );
}

/**
 * InlineLoadingSpinner - Small inline loading indicator
 */
interface InlineLoadingSpinnerProps {
  size?: "sm" | "default" | "lg";
  className?: string;
}

export function InlineLoadingSpinner({
  size = "default",
  className,
}: InlineLoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    default: "h-5 w-5",
    lg: "h-6 w-6",
  };

  return (
    <svg
      className={cn("animate-spin text-muted-foreground", sizeClasses[size], className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}
