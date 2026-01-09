import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

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
  }[];
  activeLoans: {
    id: string;
    principalAmount: number;
    outstandingBalance: number;
    nextInstallmentDate: string | null;
    nextInstallmentAmount: number | null;
  }[];
  nextPayroll: {
    date: string | null;
    lastNetSalary: number | null;
  };
}

export function usePersonalDashboard() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['personal-dashboard', user?.id],
    queryFn: async (): Promise<PersonalDashboardData> => {
      if (!user?.id) {
        return {
          employeeId: null,
          leaveBalances: [],
          requestsSummary: { pending: 0, approved: 0, rejected: 0 },
          upcomingTimeOff: [],
          activeLoans: [],
          nextPayroll: { date: null, lastNetSalary: null },
        };
      }

      // Get employee ID
      const { data: profile } = await supabase
        .from('profiles')
        .select('employee_id')
        .eq('id', user.id)
        .single();

      const employeeId = profile?.employee_id;

      if (!employeeId) {
        return {
          employeeId: null,
          leaveBalances: [],
          requestsSummary: { pending: 0, approved: 0, rejected: 0 },
          upcomingTimeOff: [],
          activeLoans: [],
          nextPayroll: { date: null, lastNetSalary: null },
        };
      }

      const currentYear = new Date().getFullYear();
      const today = new Date().toISOString().split('T')[0];

      // Fetch all data in parallel
      const [
        leaveBalancesRes,
        leaveRequestsRes,
        loansRes,
        payrollRes,
      ] = await Promise.all([
        // Leave balances
        supabase
          .from('leave_balances')
          .select(`
            *,
            leave_type:leave_types (id, name, color)
          `)
          .eq('employee_id', employeeId)
          .eq('year', currentYear),
        
        // Leave requests for summary and upcoming
        supabase
          .from('leave_requests')
          .select(`
            id, status, start_date, end_date, days_count,
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
        
        // Last payroll run
        supabase
          .from('payroll_runs')
          .select('pay_period_end, processed_date')
          .eq('status', 'completed')
          .order('processed_date', { ascending: false })
          .limit(1),
      ]);

      // Process leave balances
      const leaveBalances = (leaveBalancesRes.data || []).map((b: any) => ({
        leaveTypeId: b.leave_type_id,
        leaveTypeName: b.leave_type?.name || 'Unknown',
        color: b.leave_type?.color || '#3b82f6',
        total: b.total_days,
        used: b.used_days || 0,
        pending: b.pending_days || 0,
        remaining: b.total_days - (b.used_days || 0) - (b.pending_days || 0),
      }));

      // Process requests summary
      const requests = leaveRequestsRes.data || [];
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

      // Process next payroll (estimate next month from last run)
      const lastPayroll = payrollRes.data?.[0];
      let nextPayrollDate: string | null = null;
      if (lastPayroll?.pay_period_end) {
        const lastEnd = new Date(lastPayroll.pay_period_end);
        const nextEnd = new Date(lastEnd);
        nextEnd.setMonth(nextEnd.getMonth() + 1);
        nextPayrollDate = nextEnd.toISOString().split('T')[0];
      }

      return {
        employeeId,
        leaveBalances,
        requestsSummary,
        upcomingTimeOff,
        activeLoans,
        nextPayroll: {
          date: nextPayrollDate,
          lastNetSalary: null, // Would need to query payroll_run_employees
        },
      };
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
