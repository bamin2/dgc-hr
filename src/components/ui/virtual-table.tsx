import * as React from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { cn } from "@/lib/utils";

interface VirtualTableProps<T> {
  /** Array of items to render */
  items: T[];
  /** Render function for each row */
  renderRow: (item: T, index: number) => React.ReactNode;
  /** Estimated height of each row in pixels */
  estimatedRowHeight?: number;
  /** Number of items to render outside of viewport */
  overscan?: number;
  /** Class name for the container */
  className?: string;
  /** Class name for each row wrapper */
  rowClassName?: string;
  /** Height of the container (required for virtualization) */
  height?: number | string;
  /** Key extractor function */
  getItemKey?: (item: T, index: number) => string | number;
}

/**
 * Virtual table component for efficiently rendering large lists
 * Only renders visible rows + overscan for performance
 * 
 * @example
 * <VirtualTable
 *   items={employees}
 *   estimatedRowHeight={48}
 *   height={400}
 *   getItemKey={(emp) => emp.id}
 *   renderRow={(employee, index) => (
 *     <EmployeeRow employee={employee} />
 *   )}
 * />
 */
export function VirtualTable<T>({
  items,
  renderRow,
  estimatedRowHeight = 48,
  overscan = 5,
  className,
  rowClassName,
  height = 400,
  getItemKey,
}: VirtualTableProps<T>) {
  const parentRef = React.useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimatedRowHeight,
    overscan,
    getItemKey: getItemKey 
      ? (index) => getItemKey(items[index], index) 
      : undefined,
  });

  const virtualItems = virtualizer.getVirtualItems();

  return (
    <div
      ref={parentRef}
      className={cn("overflow-auto", className)}
      style={{ height }}
    >
      <div
        className="relative w-full"
        style={{ height: `${virtualizer.getTotalSize()}px` }}
      >
        {virtualItems.map((virtualRow) => {
          const item = items[virtualRow.index];
          return (
            <div
              key={virtualRow.key}
              data-index={virtualRow.index}
              ref={virtualizer.measureElement}
              className={cn("absolute left-0 top-0 w-full", rowClassName)}
              style={{
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              {renderRow(item, virtualRow.index)}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Hook version for more control over virtualization
 * 
 * @example
 * const { parentRef, virtualItems, totalSize } = useVirtualList({
 *   count: items.length,
 *   estimatedRowHeight: 48,
 * });
 */
export function useVirtualList({
  count,
  estimatedRowHeight = 48,
  overscan = 5,
}: {
  count: number;
  estimatedRowHeight?: number;
  overscan?: number;
}) {
  const parentRef = React.useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimatedRowHeight,
    overscan,
  });

  return {
    parentRef,
    virtualItems: virtualizer.getVirtualItems(),
    totalSize: virtualizer.getTotalSize(),
    measureElement: virtualizer.measureElement,
  };
}