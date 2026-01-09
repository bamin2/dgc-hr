import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import {
  calculateNextPayrollDate,
  getTodayString,
  getFirstDayOfCurrentMonth,
  getFirstDayOfLastMonth,
  getLastDayOfLastMonth,
  formatEmployeeName,
  calculatePercentChange,
  calculateOutstandingBalance,
} from '@/lib/dashboard';
import {
  fetchAllEmployees,
  fetchLastPayrollRun,
  fetchPendingLeaveRequests,
  fetchPendingLoanRequests,
  fetchActiveLoans,
  fetchUpcomingTimeOff,
  fetchLeaveRequestsByDateRange,
  fetchCompanySettings,
  fetchHQCurrency,
} from '@/lib/dashboard';

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
  hqCurrency: string;
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
    queryKey: queryKeys.dashboard.admin,
    queryFn: async (): Promise<AdminDashboardData> => {
      const todayStr = getTodayString();
      const firstDayThisMonth = getFirstDayOfCurrentMonth();
      const firstDayLastMonth = getFirstDayOfLastMonth();
      const lastDayLastMonth = getLastDayOfLastMonth();

      // Fetch all data in parallel using shared queries
      const [
        employeesRes,
        payrollRes,
        pendingLeaveRes,
        pendingLoansRes,
        loansRes,
        upcomingTimeOffRes,
        thisMonthLeaveRes,
        lastMonthLeaveRes,
        companySettingsRes,
        hqLocationRes,
      ] = await Promise.all([
        fetchAllEmployees(),
        fetchLastPayrollRun(),
        fetchPendingLeaveRequests(),
        fetchPendingLoanRequests(),
        fetchActiveLoans(),
        fetchUpcomingTimeOff(todayStr, 10),
        fetchLeaveRequestsByDateRange(firstDayThisMonth),
        fetchLeaveRequestsByDateRange(firstDayLastMonth, lastDayLastMonth),
        fetchCompanySettings(),
        fetchHQCurrency(),
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
      const payrollDayOfMonth = companySettingsRes.data?.payroll_day_of_month || 25;
      const nextPayrollDate = calculateNextPayrollDate(payrollDayOfMonth);

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
        totalOutstanding += calculateOutstandingBalance(loan.loan_installments || []);
      });

      const loanExposure = {
        totalOutstanding,
        activeLoansCount: loans.length,
      };

      // Get HQ currency
      const hqCurrency = hqLocationRes.data?.currency || 'BHD';

      // Process upcoming time off
      const upcomingTimeOff = (upcomingTimeOffRes.data || []).map((r: any) => ({
        employeeId: r.employee?.id,
        employeeName: formatEmployeeName(r.employee?.first_name, r.employee?.last_name),
        startDate: r.start_date,
        endDate: r.end_date,
        daysCount: r.days_count,
      }));

      // Process leave trends
      const thisMonthCount = thisMonthLeaveRes.data?.length || 0;
      const lastMonthCount = lastMonthLeaveRes.data?.length || 0;

      const leaveTrends = {
        thisMonth: thisMonthCount,
        lastMonth: lastMonthCount,
        percentChange: calculatePercentChange(thisMonthCount, lastMonthCount),
      };

      return {
        orgStats,
        payrollStatus,
        pendingApprovals,
        loanExposure,
        hqCurrency,
        upcomingTimeOff,
        leaveTrends,
      };
    },
    staleTime: 1000 * 60 * 5,
  });
}
