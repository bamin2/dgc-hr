import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { Skeleton } from '@/components/ui/skeleton';

interface Column<T> {
  key: string;
  label: string;
  render: (item: T) => React.ReactNode;
  mobileLabel?: string; // Optional different label for mobile
  hideOnMobile?: boolean; // Hide this column on mobile
  className?: string; // Additional classes for the cell
}

interface ResponsiveTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (item: T) => void;
  mobileCardRender?: (item: T) => React.ReactNode; // Custom mobile card layout
  isLoading?: boolean;
  emptyMessage?: string;
  className?: string;
}

function TableSkeleton({ columns, rows = 5 }: { columns: number; rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          {Array.from({ length: columns }).map((_, j) => (
            <Skeleton key={j} className="h-12 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

function MobileCardSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-24 w-full" />
      ))}
    </div>
  );
}

export function ResponsiveTable<T extends { id: string }>({
  data,
  columns,
  onRowClick,
  mobileCardRender,
  isLoading = false,
  emptyMessage = 'No data available',
  className = '',
}: ResponsiveTableProps<T>) {
  const isMobile = useMediaQuery('(max-width: 768px)');

  // Loading state
  if (isLoading) {
    if (isMobile) {
      return <MobileCardSkeleton />;
    }
    return <TableSkeleton columns={columns.length} />;
  }

  // Empty state
  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  // Mobile: Custom card layout
  if (isMobile && mobileCardRender) {
    return (
      <div className={`space-y-3 ${className}`}>
        {data.map((item) => (
          <Card
            key={item.id}
            className={`transition-colors ${
              onRowClick ? 'cursor-pointer hover:bg-accent' : ''
            }`}
            onClick={() => onRowClick?.(item)}
          >
            <CardContent className="p-4">
              {mobileCardRender(item)}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Mobile: Stacked key-value layout
  if (isMobile) {
    const visibleColumns = columns.filter((col) => !col.hideOnMobile);
    
    return (
      <div className={`space-y-3 ${className}`}>
        {data.map((item) => (
          <Card
            key={item.id}
            className={`transition-colors ${
              onRowClick ? 'cursor-pointer hover:bg-accent' : ''
            }`}
            onClick={() => onRowClick?.(item)}
          >
            <CardContent className="p-4 space-y-2">
              {visibleColumns.map((col) => (
                <div key={col.key} className="flex justify-between items-start gap-4">
                  <span className="text-sm text-muted-foreground font-medium min-w-[100px]">
                    {col.mobileLabel || col.label}
                  </span>
                  <div className="text-sm font-medium text-right flex-1">
                    {col.render(item)}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Desktop: Standard table layout
  return (
    <div className={`rounded-md border ${className}`}>
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              <TableHead key={col.key} className={col.className}>
                {col.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => (
            <TableRow
              key={item.id}
              onClick={() => onRowClick?.(item)}
              className={onRowClick ? 'cursor-pointer' : ''}
            >
              {columns.map((col) => (
                <TableCell key={col.key} className={col.className}>
                  {col.render(item)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
