import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useRole } from '@/contexts/RoleContext';
import { queryKeys } from '@/lib/queryKeys';

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
  };
}

function calculateNextPayrollDate(payrollDayOfMonth: number): string {
  const today = new Date();
  const currentDay = today.getDate();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  let nextPayrollDate: Date;
  
  if (currentDay < payrollDayOfMonth) {
    // Payroll is still this month
    nextPayrollDate = new Date(currentYear, currentMonth, payrollDayOfMonth);
  } else {
    // Payroll is next month
    nextPayrollDate = new Date(currentYear, currentMonth + 1, payrollDayOfMonth);
  }

  // Handle months with fewer days than payrollDayOfMonth
  const lastDayOfMonth = new Date(nextPayrollDate.getFullYear(), nextPayrollDate.getMonth() + 1, 0).getDate();
  if (payrollDayOfMonth > lastDayOfMonth) {
    nextPayrollDate.setDate(lastDayOfMonth);
  }

  return nextPayrollDate.toISOString().split('T')[0];
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
        const { data: profile } = await supabase
          .from('profiles')
          .select('employee_id')
          .eq('id', user.id)
          .single();

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

      const currentYear = new Date().getFullYear();
      const today = new Date().toISOString().split('T')[0];

      // Fetch all data in parallel
      const [
        employeeRes,
        leaveBalancesRes,
        leaveRequestsRes,
        loansRes,
        companySettingsRes,
      ] = await Promise.all([
        // Employee with work location for currency
        supabase
          .from('employees')
          .select('work_location:work_locations(currency)')
          .eq('id', employeeId)
          .single(),
        
        // Leave balances - filter by visible_to_employees
        supabase
          .from('leave_balances')
          .select(`
            *,
            leave_type:leave_types!inner (id, name, color, visible_to_employees)
          `)
          .eq('employee_id', employeeId)
          .eq('year', currentYear)
          .eq('leave_type.visible_to_employees', true),
        
        // Leave requests for summary and upcoming - include reason
        supabase
          .from('leave_requests')
          .select(`
            id, status, start_date, end_date, days_count, reason,
            leave_type:leave_types (name)
          `)
          .eq('employee_id', employeeId)
          .gte('start_date', `${currentYear}-01-01`),
        
        // Active loans
        supabase
          .from('loans')
          .select(`
            id, principal_amount, status,
            loan_installments (due_date, amount, status)
          `)
          .eq('employee_id', employeeId)
          .in('status', ['active', 'approved']),
        
        // Company settings for payroll day
        supabase
          .from('company_settings')
          .select('payroll_day_of_month')
          .limit(1)
          .single(),
      ]);

      // Get employee currency
      const loanCurrency = (employeeRes.data?.work_location as any)?.currency || 'SAR';

      // Process leave balances (already filtered by visible_to_employees in query)
      const leaveBalances = (leaveBalancesRes.data || []).map((b: any) => ({
        leaveTypeId: b.leave_type_id,
        leaveTypeName: b.leave_type?.name || 'Unknown',
        color: b.leave_type?.color || '#3b82f6',
        total: b.total_days,
        used: b.used_days || 0,
        pending: b.pending_days || 0,
        remaining: b.total_days - (b.used_days || 0) - (b.pending_days || 0),
      }));

      // Process requests summary - exclude public holidays
      const requests = (leaveRequestsRes.data || []).filter(
        (r: any) => r.leave_type?.name !== 'Public Holiday'
      );
      const requestsSummary = {
        pending: requests.filter((r: any) => r.status === 'pending').length,
        approved: requests.filter((r: any) => r.status === 'approved').length,
        rejected: requests.filter((r: any) => r.status === 'rejected').length,
      };

      // Process upcoming time off (approved & future) - include reason
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
        
        const outstandingBalance = dueInstallments.reduce(
          (sum: number, i: any) => sum + Number(i.amount),
          0
        );

        return {
          id: loan.id,
          principalAmount: loan.principal_amount,
          outstandingBalance,
          nextInstallmentDate: dueInstallments[0]?.due_date || null,
          nextInstallmentAmount: dueInstallments[0]?.amount || null,
        };
      });

      // Calculate next payroll based on company settings
      const payrollDayOfMonth = companySettingsRes.data?.payroll_day_of_month || 25;
      const nextPayrollDate = calculateNextPayrollDate(payrollDayOfMonth);

      return {
        employeeId,
        leaveBalances,
        requestsSummary,
        upcomingTimeOff,
        activeLoans,
        loanCurrency,
        nextPayroll: {
          date: nextPayrollDate,
          lastNetSalary: null, // Would need to query payroll_run_employees
        },
      };
    },
    enabled: !!effectiveEmployeeId || !!user?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
