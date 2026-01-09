import { useRole } from '@/contexts/RoleContext';
import { PersonalSection } from './personal';
import { TeamSection } from './team';
import { AdminSection } from './admin';
import { Skeleton } from '@/components/ui/skeleton';

function SectionSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-6 w-32" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
      </div>
    </div>
  );
}

export function DashboardRenderer() {
  const { 
    effectiveTeamMemberIds, 
    canEditEmployees, 
    isImpersonating, 
    isLoading 
  } = useRole();

  // Show team section if effective user has direct reports
  const showTeamSection = effectiveTeamMemberIds.length > 0;
  
  // Show admin section if user has HR or Admin role AND not impersonating
  const showAdminSection = canEditEmployees && !isImpersonating;

  return (
    <div className="space-y-8">
      {/* Personal Section - Always visible for all users */}
      {/* Shows immediately - has its own loading states */}
      <PersonalSection />

      {/* Team Section - Visible if effective user manages employees */}
      {/* Shows placeholder while role is loading, then renders or hides */}
      {isLoading ? (
        <SectionSkeleton />
      ) : (
        showTeamSection && <TeamSection teamMemberIds={effectiveTeamMemberIds} />
      )}

      {/* Admin Section - Visible if user has HR or Admin role (hidden during impersonation) */}
      {/* Shows placeholder while role is loading, then renders or hides */}
      {isLoading ? (
        <SectionSkeleton />
      ) : (
        showAdminSection && <AdminSection />
      )}
    </div>
  );
}
