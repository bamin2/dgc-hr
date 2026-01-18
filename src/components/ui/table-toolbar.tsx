import * as React from "react";
import { cn } from "@/lib/utils";
import { Search, X, Filter, Download, MoreHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TableToolbarProps {
  /** Search input value */
  searchValue?: string;
  /** Callback when search changes */
  onSearchChange?: (value: string) => void;
  /** Search placeholder text */
  searchPlaceholder?: string;
  /** Filter components */
  filters?: React.ReactNode;
  /** Primary action buttons */
  actions?: React.ReactNode;
  /** Export action callback */
  onExport?: () => void;
  /** Additional class names */
  className?: string;
  /** Hide search input */
  hideSearch?: boolean;
}

/**
 * TableToolbar - Consistent toolbar for tables
 * 
 * Provides:
 * - Search input on the left
 * - Filters in the center (collapsible on mobile)
 * - Action buttons on the right
 * - Responsive layout
 * 
 * @example
 * <TableToolbar
 *   searchValue={search}
 *   onSearchChange={setSearch}
 *   searchPlaceholder="Search employees..."
 *   filters={<StatusFilter />}
 *   actions={<Button>Add Employee</Button>}
 *   onExport={handleExport}
 * />
 */
export function TableToolbar({
  searchValue = "",
  onSearchChange,
  searchPlaceholder = "Search...",
  filters,
  actions,
  onExport,
  className,
  hideSearch = false,
}: TableToolbarProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4",
        className
      )}
    >
      {/* Left side - Search and Filters */}
      <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
        {/* Search Input */}
        {!hideSearch && onSearchChange && (
          <div className="relative w-full sm:w-64 lg:w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 pr-9"
            />
            {searchValue && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
                onClick={() => onSearchChange("")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}

        {/* Filters */}
        {filters && (
          <div className="flex flex-wrap items-center gap-2">{filters}</div>
        )}
      </div>

      {/* Right side - Actions */}
      {(actions || onExport) && (
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Export Button */}
          {onExport && (
            <Button variant="outline" size="sm" onClick={onExport}>
              <Download className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Export</span>
            </Button>
          )}

          {/* Custom Actions */}
          {actions}
        </div>
      )}
    </div>
  );
}

/**
 * TableToolbarMobileActions - Overflow menu for mobile
 */
interface TableToolbarMobileActionsProps {
  actions: Array<{
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
    destructive?: boolean;
  }>;
}

export function TableToolbarMobileActions({
  actions,
}: TableToolbarMobileActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="sm:hidden">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {actions.map((action, index) => (
          <DropdownMenuItem
            key={index}
            onClick={action.onClick}
            className={action.destructive ? "text-destructive" : undefined}
          >
            {action.icon && <span className="mr-2">{action.icon}</span>}
            {action.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * TableToolbarFilterButton - Trigger for filter popover
 */
interface TableToolbarFilterButtonProps {
  activeCount?: number;
  onClick?: () => void;
}

export function TableToolbarFilterButton({
  activeCount = 0,
  onClick,
}: TableToolbarFilterButtonProps) {
  return (
    <Button variant="outline" size="sm" onClick={onClick}>
      <Filter className="h-4 w-4 mr-2" />
      Filters
      {activeCount > 0 && (
        <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
          {activeCount}
        </span>
      )}
    </Button>
  );
}
