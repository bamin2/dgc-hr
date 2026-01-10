import { Clock, Calendar, CalendarDays } from 'lucide-react';
import { OverviewMetricCard } from './OverviewMetricCard';
import { LeaveSnapshot } from '@/hooks/useReportsOverview';

interface LeaveSnapshotCardsProps {
  data: LeaveSnapshot;
  isLoading: boolean;
  onNavigate: (reportId: string) => void;
}

export function LeaveSnapshotCards({ data, isLoading, onNavigate }: LeaveSnapshotCardsProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Leave Snapshot</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <OverviewMetricCard
          title="Pending Approvals"
          value={data.pendingApprovals}
          subtitle="Awaiting review"
          icon={Clock}
          iconBg="bg-orange-100 dark:bg-orange-900/30"
          iconColor="text-orange-600 dark:text-orange-400"
          onClick={() => onNavigate('leave-requests')}
          badge={data.pendingApprovals > 0 ? { text: 'Action needed', variant: 'secondary' } : undefined}
          isLoading={isLoading}
        />
        
        <OverviewMetricCard
          title="On Leave Today"
          value={data.onLeaveToday}
          subtitle="Employees currently on leave"
          icon={Calendar}
          iconBg="bg-cyan-100 dark:bg-cyan-900/30"
          iconColor="text-cyan-600 dark:text-cyan-400"
          onClick={() => onNavigate('leave-requests')}
          isLoading={isLoading}
        />
        
        <OverviewMetricCard
          title="Leave Days Taken"
          value={data.daysTakenMTD}
          subtitle="Month to date"
          icon={CalendarDays}
          iconBg="bg-violet-100 dark:bg-violet-900/30"
          iconColor="text-violet-600 dark:text-violet-400"
          onClick={() => onNavigate('leave-balance')}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
