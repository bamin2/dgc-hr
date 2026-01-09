import { useRole } from '@/contexts/RoleContext';
import { PersonalSection } from './personal';
import { TeamSection } from './team';
import { AdminSection } from './admin';

export function DashboardRenderer() {
  const { teamMemberIds, canEditEmployees } = useRole();

  // Show team section if user has direct reports
  const showTeamSection = teamMemberIds.length > 0;
  
  // Show admin section if user has HR or Admin role
  const showAdminSection = canEditEmployees;

  return (
    <div className="space-y-8">
      {/* Personal Section - Always visible for all users */}
      <PersonalSection />

      {/* Team Section - Visible if user manages employees */}
      {showTeamSection && <TeamSection teamMemberIds={teamMemberIds} />}

      {/* Admin Section - Visible if user has HR or Admin role */}
      {showAdminSection && <AdminSection />}
    </div>
  );
}
