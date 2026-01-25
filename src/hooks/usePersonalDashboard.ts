import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useRole } from '@/contexts/RoleContext';
import { queryKeys } from '@/lib/queryKeys';
import {
  calculateNextPayrollDate,
  getTodayString,
  getCurrentYear,
  calculateOutstandingBalance,
  getFirstTierMax,
} from '@/lib/dashboard';
import {
  fetchCompanySettings,
  fetchEmployeeWithLocation,
  fetchEmployeeLeaveBalances,
  fetchEmployeeLeaveRequests,
  fetchActiveLoans,
  fetchUserProfile,
} from '@/lib/dashboard';

export interface PersonalDashboardData {
  employeeId: string | null;
  leaveBalances: {
    leaveTypeId: string;
    leaveTypeName: string;
    color: string;
    total: number;
    used: number;
    pending: number;
    remaining: number;
  }[];
  requestsSummary: {
    pending: number;
    approved: number;
    rejected: number;
  };
  upcomingTimeOff: {
    id: string;
    startDate: string;
    endDate: string;
    leaveTypeName: string;
    daysCount: number;
    reason: string | null;
  }[];
  activeLoans: {
    id: string;
    principalAmount: number;
    outstandingBalance: number;
    nextInstallmentDate: string | null;
    nextInstallmentAmount: number | null;
  }[];
  loanCurrency: string;
  nextPayroll: {
    date: string | null;
    lastNetSalary: number | null;
    wasAdjusted?: boolean;
    originalDay?: number;
    adjustmentReason?: string;
  };
}

export function usePersonalDashboard() {
  const { user } = useAuth();
  const { isImpersonating, effectiveEmployeeId } = useRole();

  return useQuery({
    queryKey: [...queryKeys.dashboard.personal, effectiveEmployeeId, isImpersonating],
    queryFn: async (): Promise<PersonalDashboardData> => {
      // Use effectiveEmployeeId directly if impersonating, otherwise look up from profile
      let employeeId = effectiveEmployeeId;

      if (!employeeId && user?.id && !isImpersonating) {
        const { data: profile } = await fetchUserProfile(user.id);
        employeeId = profile?.employee_id ?? null;
      }

      if (!employeeId) {
        return {
          employeeId: null,
          leaveBalances: [],
          requestsSummary: { pending: 0, approved: 0, rejected: 0 },
          upcomingTimeOff: [],
          activeLoans: [],
          loanCurrency: 'SAR',
          nextPayroll: { date: null, lastNetSalary: null },
        };
      }

      const currentYear = getCurrentYear();
      const today = getTodayString();

      // Fetch all data in parallel using shared queries
      const [
        employeeRes,
        leaveBalancesRes,
        leaveRequestsRes,
        loansRes,
        companySettingsRes,
      ] = await Promise.all([
        fetchEmployeeWithLocation(employeeId),
        fetchEmployeeLeaveBalances(employeeId, currentYear),
        fetchEmployeeLeaveRequests(employeeId, currentYear),
        fetchActiveLoans(employeeId),
        fetchCompanySettings(),
      ]);

      // Get employee currency from work location
      const workLocation = employeeRes.data?.work_location as { currency?: string } | null;
      const loanCurrency = workLocation?.currency || 'SAR';

      // Process leave balances
      const leaveBalances = (leaveBalancesRes.data || []).map((b: any) => {
        const leaveType = b.leave_type;
        const hasTiers = leaveType?.has_salary_deduction && 
                         Array.isArray(leaveType?.salary_deduction_tiers) && 
                         leaveType.salary_deduction_tiers.length > 0;
        
        // For tiered leave types (like Sick Leave), use first tier's max as display total
        let displayTotal = b.total_days;
        if (hasTiers) {
          const firstTierMax = getFirstTierMax(leaveType.salary_deduction_tiers);
          if (firstTierMax !== null) {
            displayTotal = firstTierMax;
          }
        }
        
        const used = b.used_days || 0;
        const pending = b.pending_days || 0;
        
        return {
          leaveTypeId: b.leave_type_id,
          leaveTypeName: leaveType?.name || 'Unknown',
          color: leaveType?.color || '#14b8a6',
          total: displayTotal,
          used: used,
          pending: pending,
          remaining: Math.max(0, displayTotal - used - pending),
        };
      });

      // Process requests summary - exclude public holidays
      const requests = (leaveRequestsRes.data || []).filter(
        (r: any) => r.leave_type?.name !== 'Public Holiday'
      );
      const requestsSummary = {
        pending: requests.filter((r: any) => r.status === 'pending').length,
        approved: requests.filter((r: any) => r.status === 'approved').length,
        rejected: requests.filter((r: any) => r.status === 'rejected').length,
      };

      // Process upcoming time off (approved & future)
      const upcomingTimeOff = requests
        .filter((r: any) => r.status === 'approved' && r.start_date >= today)
        .map((r: any) => ({
          id: r.id,
          startDate: r.start_date,
          endDate: r.end_date,
          leaveTypeName: r.leave_type?.name || 'Leave',
          daysCount: r.days_count,
          reason: r.reason || null,
        }))
        .sort((a: any, b: any) => a.startDate.localeCompare(b.startDate))
        .slice(0, 5);

      // Process active loans
      const activeLoans = (loansRes.data || []).map((loan: any) => {
        const dueInstallments = (loan.loan_installments || [])
          .filter((i: any) => i.status === 'due')
          .sort((a: any, b: any) => a.due_date.localeCompare(b.due_date));
        
        return {
          id: loan.id,
          principalAmount: loan.principal_amount,
          outstandingBalance: calculateOutstandingBalance(loan.loan_installments || []),
          nextInstallmentDate: dueInstallments[0]?.due_date || null,
          nextInstallmentAmount: dueInstallments[0]?.amount || null,
        };
      });

      // Calculate next payroll (adjust for weekends)
      const payrollDayOfMonth = companySettingsRes.data?.payroll_day_of_month || 25;
      const weekendDays = companySettingsRes.data?.weekend_days || [5, 6];
      const payrollResult = calculateNextPayrollDate(payrollDayOfMonth, weekendDays);

      return {
        employeeId,
        leaveBalances,
        requestsSummary,
        upcomingTimeOff,
        activeLoans,
        loanCurrency,
        nextPayroll: {
          date: payrollResult.date,
          lastNetSalary: null,
          wasAdjusted: payrollResult.wasAdjusted,
          originalDay: payrollResult.originalDay,
          adjustmentReason: payrollResult.adjustmentReason,
        },
      };
    },
    enabled: !!effectiveEmployeeId || !!user?.id,
    staleTime: 1000 * 60 * 5,
    retry: 0,  // Don't retry auth-dependent queries
  });
}
