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
          iconBg="bg-info/10"
          iconColor="text-info"
          onClick={() => onNavigate('employee-master')}
          isLoading={isLoading}
        />
        
        <OverviewMetricCard
          title="New Hires"
          value={data.newHires}
          subtitle="This month"
          icon={UserPlus}
          iconBg="bg-success/10"
          iconColor="text-success"
          onClick={() => onNavigate('employee-master')}
          badge={data.newHires > 0 ? { text: 'Recent', variant: 'default' } : undefined}
          isLoading={isLoading}
        />
        
        <OverviewMetricCard
          title="Exits"
          value={data.exits}
          subtitle="This month"
          icon={UserMinus}
          iconBg="bg-destructive/10"
          iconColor="text-destructive"
          onClick={() => onNavigate('employee-master')}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
