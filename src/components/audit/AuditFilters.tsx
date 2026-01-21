import { useState, useEffect } from "react";
import { Search, X, Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { HierarchicalCalendar } from "@/components/ui/hierarchical-calendar";
import { cn } from "@/lib/utils";
import type { AuditLogFilters, EntityType, ActionType } from "@/hooks/useAuditLogs";
import { useEmployees } from "@/hooks/useEmployees";
import { useDebounce } from "@/hooks/useDebounce";

interface AuditFiltersProps {
  filters: AuditLogFilters;
  onFiltersChange: (filters: AuditLogFilters) => void;
}

const ENTITY_TYPE_OPTIONS: { value: EntityType | 'all'; label: string }[] = [
  { value: 'all', label: 'All Categories' },
  { value: 'employee', label: 'Employee Profile' },
  { value: 'compensation', label: 'Compensation' },
  { value: 'leave_request', label: 'Leave Requests' },
  { value: 'leave_balance', label: 'Leave Balances' },
  { value: 'loan', label: 'Loans' },
  { value: 'document', label: 'Documents' },
];

const ACTION_TYPE_OPTIONS: { value: ActionType | 'all'; label: string }[] = [
  { value: 'all', label: 'All Actions' },
  { value: 'create', label: 'Created' },
  { value: 'update', label: 'Updated' },
  { value: 'delete', label: 'Deleted' },
  { value: 'approve', label: 'Approved' },
  { value: 'reject', label: 'Rejected' },
  { value: 'upload', label: 'Uploaded' },
  { value: 'skip', label: 'Skipped' },
];

export function AuditFilters({ filters, onFiltersChange }: AuditFiltersProps) {
  const [searchValue, setSearchValue] = useState(filters.search || '');
  const { data: employees } = useEmployees();
  
  // Debounce search to avoid querying on every keystroke
  const debouncedSearch = useDebounce(searchValue, 300);

  // Auto-submit search when debounced value changes
  useEffect(() => {
    // Only update if the debounced value differs from current filter
    if (debouncedSearch !== (filters.search || '')) {
      onFiltersChange({ ...filters, search: debouncedSearch || undefined });
    }
  }, [debouncedSearch]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleClearFilters = () => {
    setSearchValue('');
    onFiltersChange({});
  };

  const hasActiveFilters = Boolean(
    filters.employeeId ||
    (filters.entityType && filters.entityType !== 'all') ||
    (filters.action && filters.action !== 'all') ||
    filters.dateFrom ||
    filters.dateTo ||
    filters.search
  );

  return (
    <div className="space-y-4">
      {/* Search - now auto-submits with debounce */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by description or field name..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        {/* Employee Filter */}
        <Select
          value={filters.employeeId || 'all'}
          onValueChange={(value) =>
            onFiltersChange({
              ...filters,
              employeeId: value === 'all' ? undefined : value,
            })
          }
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="All Employees" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Employees</SelectItem>
            {employees?.map((emp) => (
              <SelectItem key={emp.id} value={emp.id}>
                {emp.firstName} {emp.lastName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Entity Type Filter */}
        <Select
          value={filters.entityType || 'all'}
          onValueChange={(value) =>
            onFiltersChange({
              ...filters,
              entityType: value as EntityType | 'all',
            })
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            {ENTITY_TYPE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Action Type Filter */}
        <Select
          value={filters.action || 'all'}
          onValueChange={(value) =>
            onFiltersChange({
              ...filters,
              action: value as ActionType | 'all',
            })
          }
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="All Actions" />
          </SelectTrigger>
          <SelectContent>
            {ACTION_TYPE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Date From */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[150px] justify-start text-left font-normal",
                !filters.dateFrom && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {filters.dateFrom ? format(filters.dateFrom, "MMM d, yyyy") : "From Date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <HierarchicalCalendar
              selected={filters.dateFrom}
              onSelect={(date) =>
                onFiltersChange({ ...filters, dateFrom: date || undefined })
              }
              initialFocus
            />
          </PopoverContent>
        </Popover>

        {/* Date To */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[150px] justify-start text-left font-normal",
                !filters.dateTo && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {filters.dateTo ? format(filters.dateTo, "MMM d, yyyy") : "To Date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <HierarchicalCalendar
              selected={filters.dateTo}
              onSelect={(date) =>
                onFiltersChange({ ...filters, dateTo: date || undefined })
              }
              initialFocus
            />
          </PopoverContent>
        </Popover>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="text-muted-foreground"
          >
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}
