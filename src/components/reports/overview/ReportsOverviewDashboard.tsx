import { useState } from 'react';
import { startOfMonth, endOfMonth, subMonths, startOfQuarter, startOfYear, format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useReportsOverview, DateRange } from '@/hooks/useReportsOverview';
import { PayrollSnapshotCards } from './PayrollSnapshotCards';
import { WorkforceSnapshotCards } from './WorkforceSnapshotCards';
import { LeaveSnapshotCards } from './LeaveSnapshotCards';
import { LoanSnapshotCards } from './LoanSnapshotCards';
import { InsightsSection } from './InsightsSection';

interface ReportsOverviewDashboardProps {
  onNavigate: (reportId: string) => void;
}

const datePresets: { label: string; getRange: () => DateRange }[] = [
  {
    label: 'This Month',
    getRange: () => ({
      start: startOfMonth(new Date()),
      end: endOfMonth(new Date()),
      label: 'This Month',
    }),
  },
  {
    label: 'Last Month',
    getRange: () => {
      const lastMonth = subMonths(new Date(), 1);
      return {
        start: startOfMonth(lastMonth),
        end: endOfMonth(lastMonth),
        label: 'Last Month',
      };
    },
  },
  {
    label: 'This Quarter',
    getRange: () => ({
      start: startOfQuarter(new Date()),
      end: new Date(),
      label: 'This Quarter',
    }),
  },
  {
    label: 'Year to Date',
    getRange: () => ({
      start: startOfYear(new Date()),
      end: new Date(),
      label: 'Year to Date',
    }),
  },
];

export function ReportsOverviewDashboard({ onNavigate }: ReportsOverviewDashboardProps) {
  const [dateRange, setDateRange] = useState<DateRange>(datePresets[0].getRange());
  const { data, isLoading } = useReportsOverview(dateRange);

  const handlePresetSelect = (preset: typeof datePresets[0]) => {
    setDateRange(preset.getRange());
  };

  return (
    <div className="space-y-8">
      {/* Date Range Selector */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            Showing data for: {format(dateRange.start, 'MMM d, yyyy')} - {format(dateRange.end, 'MMM d, yyyy')}
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <CalendarIcon className="h-4 w-4" />
              {dateRange.label}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {datePresets.map((preset) => (
              <DropdownMenuItem
                key={preset.label}
                onClick={() => handlePresetSelect(preset)}
              >
                {preset.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Payroll Snapshot */}
      <PayrollSnapshotCards 
        data={data.payroll} 
        isLoading={isLoading} 
        onNavigate={onNavigate} 
      />

      {/* Workforce Snapshot */}
      <WorkforceSnapshotCards 
        data={data.workforce} 
        isLoading={isLoading} 
        onNavigate={onNavigate} 
      />

      {/* Leave Snapshot */}
      <LeaveSnapshotCards 
        data={data.leave} 
        isLoading={isLoading} 
        onNavigate={onNavigate} 
      />

      {/* Loan Snapshot */}
      <LoanSnapshotCards 
        data={data.loans} 
        isLoading={isLoading} 
        onNavigate={onNavigate} 
      />

      {/* Insights */}
      <InsightsSection 
        data={data.insights} 
        isLoading={isLoading} 
        onNavigate={onNavigate} 
      />
    </div>
  );
}
