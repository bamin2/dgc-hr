import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface TableSkeletonProps {
  /** Number of data columns (excluding checkbox) */
  columns: number;
  /** Number of skeleton rows to display */
  rows?: number;
  /** Whether to show a checkbox column */
  showCheckbox?: boolean;
  /** Whether first column should show avatar + text */
  showAvatar?: boolean;
  /** Custom column widths (optional) */
  columnWidths?: string[];
}

export function TableSkeleton({
  columns,
  rows = 8,
  showCheckbox = false,
  showAvatar = true,
  columnWidths,
}: TableSkeletonProps) {
  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            {showCheckbox && (
              <TableHead className="w-12">
                <Skeleton className="h-4 w-4" />
              </TableHead>
            )}
            {Array.from({ length: columns }).map((_, i) => (
              <TableHead key={i} style={columnWidths?.[i] ? { width: columnWidths[i] } : undefined}>
                <Skeleton className="h-4 w-20" />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <TableRow key={rowIndex}>
              {showCheckbox && (
                <TableCell>
                  <Skeleton className="h-4 w-4" />
                </TableCell>
              )}
              {Array.from({ length: columns }).map((_, colIndex) => (
                <TableCell key={colIndex}>
                  {colIndex === 0 && showAvatar ? (
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                      <div className="space-y-1.5">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-3 w-36" />
                      </div>
                    </div>
                  ) : (
                    <Skeleton 
                      className="h-4" 
                      style={{ width: `${Math.random() * 40 + 60}px` }} 
                    />
                  )}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

interface EmployeesLoadingSkeletonProps {
  showFilters?: boolean;
}

export function EmployeesLoadingSkeleton({ showFilters = true }: EmployeesLoadingSkeletonProps) {
  return (
    <div className="space-y-6">
      {/* Filters skeleton */}
      {showFilters && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <Skeleton className="h-10 w-full sm:w-80" />
          <div className="flex flex-wrap gap-3">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-10 w-44" />
          </div>
        </div>
      )}
      {/* Table skeleton */}
      <TableSkeleton columns={6} rows={8} showCheckbox showAvatar />
      {/* Pagination skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-40" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-9" />
          <Skeleton className="h-9 w-9" />
          <Skeleton className="h-9 w-20" />
        </div>
      </div>
    </div>
  );
}

export function AuditTableSkeleton() {
  return (
    <div className="space-y-4">
      <TableSkeleton columns={5} rows={10} showCheckbox={false} showAvatar={false} />
      {/* Pagination skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-32" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-9" />
          <Skeleton className="h-9 w-9" />
          <Skeleton className="h-9 w-20" />
        </div>
      </div>
    </div>
  );
}
