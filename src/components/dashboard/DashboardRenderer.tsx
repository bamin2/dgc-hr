import { useRole } from '@/contexts/RoleContext';
import { useIsMobile } from '@/hooks/use-mobile';
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
  MobileGreetingCard,
  MobileStatusCards,
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

/**
 * Mobile Dashboard - Lightweight status-focused companion
 * Shows greeting, quick status cards, and recent notifications
 * No charts, reports, or configuration widgets
 */
function MobileDashboard() {
  return (
    <BentoGrid>
      {/* Greeting + Current Date */}
      <MobileGreetingCard />
      
      {/* Quick Status Cards - Next Leave, Pending, Loan Balance */}
      <MobileStatusCards />
      
      {/* Recent Notifications - 4 items with large touch targets */}
      <NotificationsCard variant="compact" itemCount={4} />
    </BentoGrid>
  );
}

/**
 * Desktop Dashboard - Full control center
 * Shows all cards including manager/admin sections
 */
function DesktopDashboard() {
  const { 
    effectiveTeamMemberIds, 
    canEditEmployees, 
    isManager,
    isImpersonating, 
  } = useRole();

  // Show team section if effective user has direct reports
  const showTeamSection = effectiveTeamMemberIds.length > 0;
  
  // Show approvals section if user has manager/HR/Admin role AND not impersonating
  const showApprovalsSection = (isManager || canEditEmployees) && !isImpersonating;

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

export function DashboardRenderer() {
  const { isLoading } = useRole();
  const isMobile = useIsMobile();

  if (isLoading) {
    return (
      <BentoGrid>
        {isMobile ? (
          <>
            <CardSkeleton colSpan={12} />
            <CardSkeleton colSpan={12} />
            <CardSkeleton colSpan={12} />
          </>
        ) : (
          <>
            <CardSkeleton colSpan={7} />
            <CardSkeleton colSpan={5} />
            <CardSkeleton colSpan={4} />
            <CardSkeleton colSpan={4} />
            <CardSkeleton colSpan={4} />
            <CardSkeleton colSpan={8} />
            <CardSkeleton colSpan={4} />
          </>
        )}
      </BentoGrid>
    );
  }

  // Mobile: Slim, action-focused companion
  if (isMobile) {
    return <MobileDashboard />;
  }

  // Desktop: Full control center
  return <DesktopDashboard />;
}
