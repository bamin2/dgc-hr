import { useAdminDashboard } from '@/hooks/useAdminDashboard';
import { OrgOverviewCard } from './OrgOverviewCard';
import { PayrollStatusCard } from './PayrollStatusCard';
import { AllPendingApprovalsCard } from './AllPendingApprovalsCard';
import { UpcomingTimeOffOrgCard } from './UpcomingTimeOffOrgCard';
import { LoanExposureCard } from './LoanExposureCard';
import { LeaveTrendsCard } from './LeaveTrendsCard';
import { AdminQuickActions } from './AdminQuickActions';
import { Building } from 'lucide-react';

export function AdminSection() {
  const { data, isLoading } = useAdminDashboard();

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <Building className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">Organization</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <OrgOverviewCard 
          stats={data?.orgStats || { totalEmployees: 0, activeEmployees: 0, onLeaveEmployees: 0 }} 
          isLoading={isLoading} 
        />
        
        <PayrollStatusCard 
          status={data?.payrollStatus || { lastRunDate: null, lastRunAmount: null, nextPayrollDate: null }}
          isLoading={isLoading}
        />
        
        <AllPendingApprovalsCard 
          pendingApprovals={data?.pendingApprovals || { leaveRequests: 0, loanRequests: 0 }} 
          isLoading={isLoading} 
        />

        <UpcomingTimeOffOrgCard 
          upcomingTimeOff={data?.upcomingTimeOff || []} 
          isLoading={isLoading} 
        />

        <LoanExposureCard 
          loanExposure={data?.loanExposure || { totalOutstanding: 0, activeLoansCount: 0 }} 
          isLoading={isLoading} 
        />

        <LeaveTrendsCard 
          trends={data?.leaveTrends || { thisMonth: 0, lastMonth: 0, percentChange: 0 }} 
          isLoading={isLoading} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <AdminQuickActions />
      </div>
    </section>
  );
}
