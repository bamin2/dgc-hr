import { Users, UserPlus, UserMinus } from 'lucide-react';
import { OverviewMetricCard } from './OverviewMetricCard';
import { WorkforceSnapshot } from '@/hooks/useReportsOverview';

interface WorkforceSnapshotCardsProps {
  data: WorkforceSnapshot;
  isLoading: boolean;
  onNavigate: (reportId: string) => void;
}

export function WorkforceSnapshotCards({ data, isLoading, onNavigate }: WorkforceSnapshotCardsProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Workforce Snapshot</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <OverviewMetricCard
          title="Total Active Employees"
          value={data.totalActive}
          subtitle="Current headcount"
          icon={Users}
          iconBg="bg-indigo-100 dark:bg-indigo-900/30"
          iconColor="text-indigo-600 dark:text-indigo-400"
          onClick={() => onNavigate('employee-master')}
          isLoading={isLoading}
        />
        
        <OverviewMetricCard
          title="New Hires"
          value={data.newHires}
          subtitle="This month"
          icon={UserPlus}
          iconBg="bg-green-100 dark:bg-green-900/30"
          iconColor="text-green-600 dark:text-green-400"
          onClick={() => onNavigate('employee-master')}
          badge={data.newHires > 0 ? { text: 'Recent', variant: 'default' } : undefined}
          isLoading={isLoading}
        />
        
        <OverviewMetricCard
          title="Exits"
          value={data.exits}
          subtitle="This month"
          icon={UserMinus}
          iconBg="bg-red-100 dark:bg-red-900/30"
          iconColor="text-red-600 dark:text-red-400"
          onClick={() => onNavigate('employee-master')}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
