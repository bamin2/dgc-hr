import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface AdminDashboardData {
  orgStats: {
    totalEmployees: number;
    activeEmployees: number;
    onLeaveEmployees: number;
  };
  payrollStatus: {
    lastRunDate: string | null;
    lastRunAmount: number | null;
    nextPayrollDate: string | null;
  };
  pendingApprovals: {
    leaveRequests: number;
    loanRequests: number;
  };
  loanExposure: {
    totalOutstanding: number;
    activeLoansCount: number;
  };
  upcomingTimeOff: {
    employeeId: string;
    employeeName: string;
    startDate: string;
    endDate: string;
    daysCount: number;
  }[];
  leaveTrends: {
    thisMonth: number;
    lastMonth: number;
    percentChange: number;
  };
}

export function useAdminDashboard() {
  return useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: async (): Promise<AdminDashboardData> => {
      const today = new Date();
      const firstDayThisMonth = new Date(today.getFullYear(), today.getMonth(), 1)
        .toISOString().split('T')[0];
      const firstDayLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)
        .toISOString().split('T')[0];
      const lastDayLastMonth = new Date(today.getFullYear(), today.getMonth(), 0)
        .toISOString().split('T')[0];
      const todayStr = today.toISOString().split('T')[0];

      // Fetch all data in parallel
      const [
        employeesRes,
        payrollRes,
        pendingLeaveRes,
        pendingLoansRes,
        loansRes,
        upcomingTimeOffRes,
        thisMonthLeaveRes,
        lastMonthLeaveRes,
      ] = await Promise.all([
        // Employee stats
        supabase
          .from('employees')
          .select('id, status'),
        
        // Last payroll run
        supabase
          .from('payroll_runs')
          .select('processed_date, total_amount, pay_period_end')
          .eq('status', 'completed')
          .order('processed_date', { ascending: false })
          .limit(1),
        
        // Pending leave requests
        supabase
          .from('leave_requests')
          .select('id')
          .eq('status', 'pending'),
        
        // Pending loan requests
        supabase
          .from('loans')
          .select('id')
          .eq('status', 'requested'),
        
        // Active loans for exposure
        supabase
          .from('loans')
          .select(`
            id,
            loan_installments (amount, status)
          `)
          .eq('status', 'active'),
        
        // Upcoming time off (org-wide)
        supabase
          .from('leave_requests')
          .select(`
            id, start_date, end_date, days_count,
            employee:employees (id, first_name, last_name)
          `)
          .eq('status', 'approved')
          .gte('start_date', todayStr)
          .order('start_date', { ascending: true })
          .limit(10),
        
        // This month leaves
        supabase
          .from('leave_requests')
          .select('id')
          .eq('status', 'approved')
          .gte('start_date', firstDayThisMonth),
        
        // Last month leaves
        supabase
          .from('leave_requests')
          .select('id')
          .eq('status', 'approved')
          .gte('start_date', firstDayLastMonth)
          .lte('start_date', lastDayLastMonth),
      ]);

      // Process employee stats
      const employees = employeesRes.data || [];
      const orgStats = {
        totalEmployees: employees.length,
        activeEmployees: employees.filter((e: any) => e.status === 'active').length,
        onLeaveEmployees: employees.filter((e: any) => e.status === 'on_leave').length,
      };

      // Process payroll status
      const lastPayroll = payrollRes.data?.[0];
      let nextPayrollDate: string | null = null;
      if (lastPayroll?.pay_period_end) {
        const lastEnd = new Date(lastPayroll.pay_period_end);
        const nextEnd = new Date(lastEnd);
        nextEnd.setMonth(nextEnd.getMonth() + 1);
        nextPayrollDate = nextEnd.toISOString().split('T')[0];
      }

      const payrollStatus = {
        lastRunDate: lastPayroll?.processed_date || null,
        lastRunAmount: lastPayroll?.total_amount ? Number(lastPayroll.total_amount) : null,
        nextPayrollDate,
      };

      // Process pending approvals
      const pendingApprovals = {
        leaveRequests: pendingLeaveRes.data?.length || 0,
        loanRequests: pendingLoansRes.data?.length || 0,
      };

      // Process loan exposure
      const loans = loansRes.data || [];
      let totalOutstanding = 0;
      loans.forEach((loan: any) => {
        const dueInstallments = (loan.loan_installments || [])
          .filter((i: any) => i.status === 'due');
        totalOutstanding += dueInstallments.reduce(
          (sum: number, i: any) => sum + Number(i.amount),
          0
        );
      });

      const loanExposure = {
        totalOutstanding,
        activeLoansCount: loans.length,
      };

      // Process upcoming time off
      const upcomingTimeOff = (upcomingTimeOffRes.data || []).map((r: any) => ({
        employeeId: r.employee?.id,
        employeeName: `${r.employee?.first_name || ''} ${r.employee?.last_name || ''}`.trim(),
        startDate: r.start_date,
        endDate: r.end_date,
        daysCount: r.days_count,
      }));

      // Process leave trends
      const thisMonthCount = thisMonthLeaveRes.data?.length || 0;
      const lastMonthCount = lastMonthLeaveRes.data?.length || 0;
      const percentChange = lastMonthCount > 0
        ? Math.round(((thisMonthCount - lastMonthCount) / lastMonthCount) * 100)
        : 0;

      const leaveTrends = {
        thisMonth: thisMonthCount,
        lastMonth: lastMonthCount,
        percentChange,
      };

      return {
        orgStats,
        payrollStatus,
        pendingApprovals,
        loanExposure,
        upcomingTimeOff,
        leaveTrends,
      };
    },
    staleTime: 1000 * 60 * 5,
  });
}
