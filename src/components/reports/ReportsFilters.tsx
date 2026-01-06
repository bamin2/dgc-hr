import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Search, CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { ReportType, ReportPeriod } from '@/hooks/useReportAnalytics';
import { DateRange } from 'react-day-picker';

interface ReportsFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  typeFilter: ReportType | 'all';
  onTypeChange: (value: ReportType | 'all') => void;
  periodFilter: ReportPeriod;
  onPeriodChange: (value: ReportPeriod) => void;
  dateRange?: DateRange;
  onDateRangeChange?: (range: DateRange | undefined) => void;
  showDateRange?: boolean;
}

export const ReportsFilters = ({
  searchQuery,
  onSearchChange,
  typeFilter,
  onTypeChange,
  periodFilter,
  onPeriodChange,
  dateRange,
  onDateRangeChange,
  showDateRange = false
}: ReportsFiltersProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search reports..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>
      
      <Select value={typeFilter} onValueChange={(v) => onTypeChange(v as ReportType | 'all')}>
        <SelectTrigger className="w-full sm:w-[160px]">
          <SelectValue placeholder="Report Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          <SelectItem value="attendance">Attendance</SelectItem>
          <SelectItem value="payroll">Payroll</SelectItem>
          <SelectItem value="benefits">Benefits</SelectItem>
          <SelectItem value="employees">Employees</SelectItem>
          <SelectItem value="leave">Leave</SelectItem>
        </SelectContent>
      </Select>

      <Select value={periodFilter} onValueChange={(v) => onPeriodChange(v as ReportPeriod)}>
        <SelectTrigger className="w-full sm:w-[140px]">
          <SelectValue placeholder="Period" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="daily">Daily</SelectItem>
          <SelectItem value="weekly">Weekly</SelectItem>
          <SelectItem value="monthly">Monthly</SelectItem>
          <SelectItem value="quarterly">Quarterly</SelectItem>
          <SelectItem value="yearly">Yearly</SelectItem>
          <SelectItem value="custom">Custom</SelectItem>
        </SelectContent>
      </Select>

      {showDateRange && onDateRangeChange && (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'w-full sm:w-[240px] justify-start text-left font-normal',
                !dateRange && 'text-muted-foreground'
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange?.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, 'LLL dd')} - {format(dateRange.to, 'LLL dd, y')}
                  </>
                ) : (
                  format(dateRange.from, 'LLL dd, y')
                )
              ) : (
                'Pick a date range'
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange?.from}
              selected={dateRange}
              onSelect={onDateRangeChange}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
};
