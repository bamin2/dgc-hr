import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, RefreshCw, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { DateRange } from 'react-day-picker';
import { ReportFilters } from '@/types/reports';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ReportFiltersBarProps {
  filters: ReportFilters;
  onFiltersChange: (filters: ReportFilters) => void;
  onRefresh?: () => void;
  isLoading?: boolean;
  showLocation?: boolean;
  showDepartment?: boolean;
  showEmployee?: boolean;
  showStatus?: boolean;
  showPayrollRun?: boolean;
  showYear?: boolean;
  statusOptions?: { value: string; label: string }[];
}

interface LocationOption {
  id: string;
  name: string;
}

interface DepartmentOption {
  id: string;
  name: string;
}

interface EmployeeOption {
  id: string;
  first_name: string;
  last_name: string;
  employee_code: string | null;
}

interface PayrollRunOption {
  id: string;
  pay_period_start: string;
  pay_period_end: string;
  status: string;
}

async function fetchLocations(): Promise<LocationOption[]> {
  const { data, error } = await supabase
    .from('work_locations')
    .select('id, name');
  if (error) throw error;
  return (data || [])
    .filter(loc => loc.id) // Only active ones would have ids
    .map(loc => ({ id: loc.id, name: loc.name }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

async function fetchDepartments(): Promise<DepartmentOption[]> {
  const { data, error } = await supabase
    .from('departments')
    .select('id, name');
  if (error) throw error;
  return (data || [])
    .map(d => ({ id: d.id, name: d.name }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

async function fetchEmployees(): Promise<EmployeeOption[]> {
  const { data, error } = await supabase
    .from('employees')
    .select('id, first_name, last_name, employee_code, status');
  if (error) throw error;
  return (data || [])
    .filter(e => e.status === 'active')
    .map(e => ({ id: e.id, first_name: e.first_name, last_name: e.last_name, employee_code: e.employee_code }))
    .sort((a, b) => a.first_name.localeCompare(b.first_name));
}

async function fetchPayrollRuns(): Promise<PayrollRunOption[]> {
  const { data, error } = await supabase
    .from('payroll_runs')
    .select('id, pay_period_start, pay_period_end, status');
  if (error) throw error;
  return (data || [])
    .filter(r => r.status === 'completed' || r.status === 'payslips_issued')
    .map(r => ({ id: r.id, pay_period_start: r.pay_period_start, pay_period_end: r.pay_period_end, status: r.status }))
    .sort((a, b) => b.pay_period_start.localeCompare(a.pay_period_start))
    .slice(0, 24);
}

export function ReportFiltersBar({
  filters,
  onFiltersChange,
  onRefresh,
  isLoading,
  showLocation = false,
  showDepartment = false,
  showEmployee = false,
  showStatus = false,
  showPayrollRun = false,
  showYear = false,
  statusOptions = [],
}: ReportFiltersBarProps) {
  // Fetch work locations
  const locationsQuery = useQuery({
    queryKey: ['work-locations-filter'],
    queryFn: fetchLocations,
    enabled: showLocation,
  });
  const locations = locationsQuery.data || [];

  // Fetch departments
  const departmentsQuery = useQuery({
    queryKey: ['departments-filter'],
    queryFn: fetchDepartments,
    enabled: showDepartment,
  });
  const departments = departmentsQuery.data || [];

  // Fetch employees
  const employeesQuery = useQuery({
    queryKey: ['employees-filter'],
    queryFn: fetchEmployees,
    enabled: showEmployee,
  });
  const employees = employeesQuery.data || [];

  // Fetch payroll runs
  const payrollRunsQuery = useQuery({
    queryKey: ['payroll-runs-filter'],
    queryFn: fetchPayrollRuns,
    enabled: showPayrollRun,
  });
  const payrollRuns = payrollRunsQuery.data || [];

  const dateRange: DateRange | undefined = filters.dateRange
    ? {
        from: new Date(filters.dateRange.start),
        to: new Date(filters.dateRange.end),
      }
    : undefined;

  const handleDateRangeChange = (range: DateRange | undefined) => {
    if (range?.from && range?.to) {
      onFiltersChange({
        ...filters,
        dateRange: {
          start: format(range.from, 'yyyy-MM-dd'),
          end: format(range.to, 'yyyy-MM-dd'),
        },
      });
    } else if (!range) {
      onFiltersChange({ ...filters, dateRange: undefined });
    }
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = Object.values(filters).some(v => v !== undefined);

  // Generate year options (last 5 years)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - i);

  return (
    <div className="flex flex-wrap items-center gap-3 p-4 bg-muted/30 rounded-lg border">
      {/* Date Range */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              'w-[220px] justify-start text-left font-normal',
              !dateRange && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateRange?.from ? (
              dateRange.to ? (
                <>
                  {format(dateRange.from, 'MMM d')} - {format(dateRange.to, 'MMM d, yyyy')}
                </>
              ) : (
                format(dateRange.from, 'MMM d, yyyy')
              )
            ) : (
              'Select date range'
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={dateRange?.from}
            selected={dateRange}
            onSelect={handleDateRangeChange}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>

      {/* Year Filter */}
      {showYear && (
        <Select
          value={filters.year?.toString() || 'all'}
          onValueChange={(v) => onFiltersChange({ ...filters, year: v === 'all' ? undefined : parseInt(v) })}
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Years</SelectItem>
            {yearOptions.map(year => (
              <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Location Filter */}
      {showLocation && (
        <Select
          value={filters.locationId || 'all'}
          onValueChange={(v) => onFiltersChange({ ...filters, locationId: v === 'all' ? undefined : v })}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Locations" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Locations</SelectItem>
            {locations.map(loc => (
              <SelectItem key={loc.id} value={loc.id}>{loc.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Department Filter */}
      {showDepartment && (
        <Select
          value={filters.departmentId || 'all'}
          onValueChange={(v) => onFiltersChange({ ...filters, departmentId: v === 'all' ? undefined : v })}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Departments" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {departments.map(dept => (
              <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Employee Filter */}
      {showEmployee && (
        <Select
          value={filters.employeeId || 'all'}
          onValueChange={(v) => onFiltersChange({ ...filters, employeeId: v === 'all' ? undefined : v })}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="All Employees" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Employees</SelectItem>
            {employees.map(emp => (
              <SelectItem key={emp.id} value={emp.id}>
                {emp.first_name} {emp.last_name} {emp.employee_code && `(${emp.employee_code})`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Payroll Run Filter */}
      {showPayrollRun && (
        <Select
          value={filters.payrollRunId || 'all'}
          onValueChange={(v) => onFiltersChange({ ...filters, payrollRunId: v === 'all' ? undefined : v })}
        >
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="All Payroll Runs" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Payroll Runs</SelectItem>
            {payrollRuns.map(run => (
              <SelectItem key={run.id} value={run.id}>
                {format(new Date(run.pay_period_start), 'MMM yyyy')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Status Filter */}
      {showStatus && statusOptions.length > 0 && (
        <Select
          value={filters.status || 'all'}
          onValueChange={(v) => onFiltersChange({ ...filters, status: v === 'all' ? undefined : v })}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {statusOptions.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 ml-auto">
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
        {onRefresh && (
          <Button variant="outline" size="sm" onClick={onRefresh} disabled={isLoading}>
            <RefreshCw className={cn('h-4 w-4 mr-1', isLoading && 'animate-spin')} />
            Refresh
          </Button>
        )}
      </div>
    </div>
  );
}
