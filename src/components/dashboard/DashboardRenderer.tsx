import { useRole } from '@/contexts/RoleContext';
import { PersonalSection } from './personal';
import { TeamSection } from './team';
import { AdminSection } from './admin';

export function DashboardRenderer() {
  const { effectiveTeamMemberIds, canEditEmployees, isImpersonating } = useRole();

  // Show team section if effective user has direct reports
  const showTeamSection = effectiveTeamMemberIds.length > 0;
  
  // Show admin section if user has HR or Admin role AND not impersonating
  const showAdminSection = canEditEmployees && !isImpersonating;

  return (
    <div className="space-y-8">
      {/* Personal Section - Always visible for all users */}
      <PersonalSection />

      {/* Team Section - Visible if effective user manages employees */}
      {showTeamSection && <TeamSection teamMemberIds={effectiveTeamMemberIds} />}

      {/* Admin Section - Visible if user has HR or Admin role (hidden during impersonation) */}
      {showAdminSection && <AdminSection />}
    </div>
  );
}
