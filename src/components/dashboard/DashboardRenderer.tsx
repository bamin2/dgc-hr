import { useRole } from '@/contexts/RoleContext';
import { PersonalSection } from './personal';
import { TeamSection } from './team';
import { AdminSection } from './admin';
import { Skeleton } from '@/components/ui/skeleton';

export function DashboardRenderer() {
  const { teamMemberIds, canEditEmployees, isLoading } = useRole();

  // Show team section if user has direct reports
  const showTeamSection = teamMemberIds.length > 0;
  
  // Show admin section if user has HR or Admin role
  const showAdminSection = canEditEmployees;

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="space-y-4">
          <Skeleton className="h-6 w-32" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </div>
    );
  }

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
