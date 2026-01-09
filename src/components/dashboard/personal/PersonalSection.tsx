import { usePersonalDashboard } from '@/hooks/usePersonalDashboard';
import { MyLeaveBalanceCard } from './MyLeaveBalanceCard';
import { NextPayrollCard } from './NextPayrollCard';
import { MyRequestsCard } from './MyRequestsCard';
import { MyLoansCard } from './MyLoansCard';
import { MyUpcomingTimeOffCard } from './MyUpcomingTimeOffCard';
import { PersonalQuickActions } from './PersonalQuickActions';
import { CalendarWidget, Announcements } from '@/components/dashboard';
import { User } from 'lucide-react';

export function PersonalSection() {
  const { data, isLoading } = usePersonalDashboard();

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <User className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">My Dashboard</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <MyLeaveBalanceCard 
          leaveBalances={data?.leaveBalances || []} 
          isLoading={isLoading} 
        />
        
        <NextPayrollCard 
          nextPayrollDate={data?.nextPayroll.date || null}
          lastNetSalary={data?.nextPayroll.lastNetSalary || null}
          isLoading={isLoading}
        />
        
        <MyRequestsCard 
          summary={data?.requestsSummary || { pending: 0, approved: 0, rejected: 0 }} 
          isLoading={isLoading} 
        />

        <MyLoansCard 
          loans={data?.activeLoans || []} 
          isLoading={isLoading} 
        />

        <MyUpcomingTimeOffCard 
          timeOff={data?.upcomingTimeOff || []} 
          isLoading={isLoading} 
        />

        <PersonalQuickActions />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <CalendarWidget />
        <Announcements />
      </div>
    </section>
  );
}
