import { useRole } from '@/contexts/RoleContext';
import { Skeleton } from '@/components/ui/skeleton';
import {
  BentoGrid,
  BentoCard,
  WelcomeCard,
  NotificationsCard,
  ApprovalsSummaryCard,
  TimeOffSnapshotCard,
  BusinessTripsCard,
  MyTeamCard,
  ScheduleCard,
} from './bento';

function CardSkeleton({ colSpan = 4 }: { colSpan?: 4 | 5 | 7 | 8 | 12 }) {
  return (
    <BentoCard colSpan={colSpan}>
      <div className="space-y-4">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-20 w-full rounded-xl" />
      </div>
    </BentoCard>
  );
}

export function DashboardRenderer() {
  const { 
    effectiveTeamMemberIds, 
    canEditEmployees, 
    isManager,
    isImpersonating, 
    isLoading 
  } = useRole();

  // Show team section if effective user has direct reports
  const showTeamSection = effectiveTeamMemberIds.length > 0;
  
  // Show approvals section if user has manager/HR/Admin role AND not impersonating
  const showApprovalsSection = (isManager || canEditEmployees) && !isImpersonating;

  if (isLoading) {
    return (
      <BentoGrid>
        <CardSkeleton colSpan={7} />
        <CardSkeleton colSpan={5} />
        <CardSkeleton colSpan={4} />
        <CardSkeleton colSpan={4} />
        <CardSkeleton colSpan={4} />
        <CardSkeleton colSpan={8} />
        <CardSkeleton colSpan={4} />
      </BentoGrid>
    );
  }

  return (
    <BentoGrid>
      {/* Row 1: Welcome + Notifications */}
      <WelcomeCard />
      <NotificationsCard />

      {/* Row 2: Approvals (conditional) + Time Off + Business Trips */}
      {showApprovalsSection && <ApprovalsSummaryCard />}
      <TimeOffSnapshotCard />
      <BusinessTripsCard />

      {/* Row 3: Schedule + My Team (conditional) */}
      <ScheduleCard />
      {showTeamSection && <MyTeamCard />}
    </BentoGrid>
  );
}
