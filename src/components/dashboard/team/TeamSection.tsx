import { useTeamDashboard } from '@/hooks/useTeamDashboard';
import { TeamOverviewCard } from './TeamOverviewCard';
import { TeamTimeOffCard } from './TeamTimeOffCard';
import { PendingApprovalsCard } from './PendingApprovalsCard';
import { UsersRound } from 'lucide-react';

interface TeamSectionProps {
  teamMemberIds: string[];
}

export function TeamSection({ teamMemberIds }: TeamSectionProps) {
  const { data, isLoading } = useTeamDashboard(teamMemberIds);

  if (teamMemberIds.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <UsersRound className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">My Team</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <TeamOverviewCard 
          teamMemberCount={data?.teamMemberCount || 0} 
          isLoading={isLoading} 
        />
        
        <TeamTimeOffCard 
          upcomingTimeOff={data?.upcomingTimeOff || []} 
          isLoading={isLoading} 
        />
        
        <PendingApprovalsCard 
          pendingApprovals={data?.pendingApprovals || { leaveRequests: 0 }} 
          isLoading={isLoading} 
        />
      </div>
    </section>
  );
}
