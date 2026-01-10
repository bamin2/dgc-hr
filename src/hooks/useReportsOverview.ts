import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { startOfMonth, endOfMonth, format } from 'date-fns';

export interface DateRange {
  start: Date;
  end: Date;
  label: string;
}

interface CurrencyAmount {
  currencyCode: string;
  amount: number;
}

export interface PayrollSnapshot {
  totalGross: CurrencyAmount[];
  totalNet: CurrencyAmount[];
  employerGosi: CurrencyAmount[];
  employeesPaid: number;
  pendingRuns: number;
  hasMixedCurrencies: boolean;
}

export interface WorkforceSnapshot {
  totalActive: number;
  newHires: number;
  exits: number;
}

export interface LeaveSnapshot {
  pendingApprovals: number;
  onLeaveToday: number;
  daysTakenMTD: number;
}

export interface LoanSnapshot {
  activeLoans: number;
  outstandingBalance: CurrencyAmount[];
  installmentsDueThisMonth: number;
  hasMixedCurrencies: boolean;
}

export interface InsightsData {
  highestPayrollDept: { name: string; amount: number; currencyCode: string } | null;
  mostLoansDept: { name: string; count: number } | null;
}

export interface ReportsOverviewData {
  payroll: PayrollSnapshot;
  workforce: WorkforceSnapshot;
  leave: LeaveSnapshot;
  loans: LoanSnapshot;
  insights: InsightsData;
}

export function useReportsOverview(dateRange: DateRange) {
  const startDate = format(dateRange.start, 'yyyy-MM-dd');
  const endDate = format(dateRange.end, 'yyyy-MM-dd');
  const today = format(new Date(), 'yyyy-MM-dd');
  const monthStart = format(startOfMonth(new Date()), 'yyyy-MM-dd');
  const monthEnd = format(endOfMonth(new Date()), 'yyyy-MM-dd');

  // Payroll Snapshot Query
  const payrollQuery = useQuery({
    queryKey: ['reports-overview-payroll', startDate, endDate],
    queryFn: async (): Promise<PayrollSnapshot> => {
      // Get finalized payroll runs for the period
      const { data: payrollRuns, error: runsError } = await supabase
        .from('payroll_runs')
        .select(`
          id,
          status,
          work_location:work_locations(currency_code)
        `)
        .in('status', ['finalized', 'payslips_issued'])
        .gte('pay_period_start', startDate)
        .lte('pay_period_end', endDate);

      if (runsError) throw runsError;

      const finalizedRunIds = payrollRuns?.map(r => r.id) || [];
      
      // Get pending runs count
      const { count: pendingCount, error: pendingError } = await supabase
        .from('payroll_runs')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'draft');
      
      if (pendingError) throw pendingError;

      if (finalizedRunIds.length === 0) {
        return {
          totalGross: [],
          totalNet: [],
          employerGosi: [],
          employeesPaid: 0,
          pendingRuns: pendingCount || 0,
          hasMixedCurrencies: false,
        };
      }

      // Get employee payroll data
      const { data: employeePayroll, error: empError } = await supabase
        .from('payroll_run_employees')
        .select(`
          employee_id,
          gross_pay,
          net_pay,
          gosi_deduction,
          payroll_run:payroll_runs!inner(
            id,
            work_location:work_locations(currency_code, employer_gosi_rate)
          )
        `)
        .in('payroll_run_id', finalizedRunIds);

      if (empError) throw empError;

      // Group by currency
      const grossByCurrency = new Map<string, number>();
      const netByCurrency = new Map<string, number>();
      const gosiByCurrency = new Map<string, number>();
      const employeeIds = new Set<string>();

      employeePayroll?.forEach(record => {
        const currencyCode = (record.payroll_run as any)?.work_location?.currency_code || 'SAR';
        const employerRate = (record.payroll_run as any)?.work_location?.employer_gosi_rate || 12;
        const employeeRate = 10; // Default employee rate
        
        // Calculate employer GOSI from employee GOSI
        const employeeGosi = record.gosi_deduction || 0;
        const employerGosi = employeeRate > 0 ? (employeeGosi / employeeRate) * employerRate : 0;

        grossByCurrency.set(currencyCode, (grossByCurrency.get(currencyCode) || 0) + (record.gross_pay || 0));
        netByCurrency.set(currencyCode, (netByCurrency.get(currencyCode) || 0) + (record.net_pay || 0));
        gosiByCurrency.set(currencyCode, (gosiByCurrency.get(currencyCode) || 0) + employerGosi);
        employeeIds.add(record.employee_id);
      });

      const totalGross = Array.from(grossByCurrency.entries()).map(([currencyCode, amount]) => ({ currencyCode, amount }));
      const totalNet = Array.from(netByCurrency.entries()).map(([currencyCode, amount]) => ({ currencyCode, amount }));
      const employerGosi = Array.from(gosiByCurrency.entries()).map(([currencyCode, amount]) => ({ currencyCode, amount }));

      return {
        totalGross,
        totalNet,
        employerGosi,
        employeesPaid: employeeIds.size,
        pendingRuns: pendingCount || 0,
        hasMixedCurrencies: totalGross.length > 1,
      };
    },
  });

  // Workforce Snapshot Query
  const workforceQuery = useQuery({
    queryKey: ['reports-overview-workforce', monthStart, monthEnd],
    queryFn: async (): Promise<WorkforceSnapshot> => {
      // Total active employees
      const { count: activeCount, error: activeError } = await supabase
        .from('employees')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      if (activeError) throw activeError;

      // New hires this month
      const { count: newHiresCount, error: hiresError } = await supabase
        .from('employees')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')
        .gte('join_date', monthStart)
        .lte('join_date', monthEnd);

      if (hiresError) throw hiresError;

      // Exits this month (resigned or terminated, updated this month)
      const { count: exitsCount, error: exitsError } = await supabase
        .from('employees')
        .select('*', { count: 'exact', head: true })
        .in('status', ['resigned', 'terminated'])
        .gte('updated_at', monthStart)
        .lte('updated_at', monthEnd);

      if (exitsError) throw exitsError;

      return {
        totalActive: activeCount || 0,
        newHires: newHiresCount || 0,
        exits: exitsCount || 0,
      };
    },
  });

  // Leave Snapshot Query
  const leaveQuery = useQuery({
    queryKey: ['reports-overview-leave', today, monthStart, monthEnd],
    queryFn: async (): Promise<LeaveSnapshot> => {
      // Pending leave approvals
      const { count: pendingCount, error: pendingError } = await supabase
        .from('leave_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      if (pendingError) throw pendingError;

      // Employees on leave today
      const { count: onLeaveCount, error: onLeaveError } = await supabase
        .from('leave_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved')
        .lte('start_date', today)
        .gte('end_date', today);

      if (onLeaveError) throw onLeaveError;

      // Total leave days taken MTD
      const { data: leaveDays, error: daysError } = await supabase
        .from('leave_requests')
        .select('days_count')
        .eq('status', 'approved')
        .gte('start_date', monthStart)
        .lte('start_date', monthEnd);

      if (daysError) throw daysError;

      const totalDays = leaveDays?.reduce((sum, r) => sum + (r.days_count || 0), 0) || 0;

      return {
        pendingApprovals: pendingCount || 0,
        onLeaveToday: onLeaveCount || 0,
        daysTakenMTD: totalDays,
      };
    },
  });

  // Loan Snapshot Query
  const loanQuery = useQuery({
    queryKey: ['reports-overview-loans', monthStart, monthEnd],
    queryFn: async (): Promise<LoanSnapshot> => {
      // Active loans count
      const { count: activeCount, error: activeError } = await supabase
        .from('loans')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      if (activeError) throw activeError;

      // Get active loans with their installments and employee currency
      const { data: activeLoans, error: loansError } = await supabase
        .from('loans')
        .select(`
          id,
          employee:employees(salary_currency_code),
          installments:loan_installments(amount, status)
        `)
        .eq('status', 'active');

      if (loansError) throw loansError;

      // Calculate outstanding balance by currency
      const balanceByCurrency = new Map<string, number>();
      activeLoans?.forEach(loan => {
        const currencyCode = (loan.employee as any)?.salary_currency_code || 'SAR';
        const outstanding = (loan.installments as any[])
          ?.filter(i => i.status !== 'paid')
          .reduce((sum, i) => sum + (i.amount || 0), 0) || 0;
        balanceByCurrency.set(currencyCode, (balanceByCurrency.get(currencyCode) || 0) + outstanding);
      });

      // Installments due this month
      const { count: dueCount, error: dueError } = await supabase
        .from('loan_installments')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'due')
        .gte('due_date', monthStart)
        .lte('due_date', monthEnd);

      if (dueError) throw dueError;

      const outstandingBalance = Array.from(balanceByCurrency.entries())
        .map(([currencyCode, amount]) => ({ currencyCode, amount }));

      return {
        activeLoans: activeCount || 0,
        outstandingBalance,
        installmentsDueThisMonth: dueCount || 0,
        hasMixedCurrencies: outstandingBalance.length > 1,
      };
    },
  });

  // Insights Query
  const insightsQuery = useQuery({
    queryKey: ['reports-overview-insights', startDate, endDate],
    queryFn: async (): Promise<InsightsData> => {
      // Highest payroll cost department
      const { data: payrollRuns } = await supabase
        .from('payroll_runs')
        .select('id, work_location:work_locations(currency_code)')
        .in('status', ['finalized', 'payslips_issued'])
        .gte('pay_period_start', startDate)
        .lte('pay_period_end', endDate);

      const runIds = payrollRuns?.map(r => r.id) || [];

      let highestPayrollDept: InsightsData['highestPayrollDept'] = null;

      if (runIds.length > 0) {
        const { data: payrollData } = await supabase
          .from('payroll_run_employees')
          .select(`
            gross_pay,
            employee:employees!inner(
              department:departments(id, name),
              salary_currency_code
            )
          `)
          .in('payroll_run_id', runIds);

        const deptTotals = new Map<string, { name: string; amount: number; currencyCode: string }>();
        payrollData?.forEach(record => {
          const dept = (record.employee as any)?.department;
          const currencyCode = (record.employee as any)?.salary_currency_code || 'SAR';
          if (dept) {
            const existing = deptTotals.get(dept.id);
            if (existing) {
              existing.amount += record.gross_pay || 0;
            } else {
              deptTotals.set(dept.id, { name: dept.name, amount: record.gross_pay || 0, currencyCode });
            }
          }
        });

        let maxDept: { name: string; amount: number; currencyCode: string } | null = null;
        deptTotals.forEach(dept => {
          if (!maxDept || dept.amount > maxDept.amount) {
            maxDept = dept;
          }
        });
        highestPayrollDept = maxDept;
      }

      // Department with most active loans
      const { data: loansData } = await supabase
        .from('loans')
        .select(`
          id,
          employee:employees!inner(
            department:departments(id, name)
          )
        `)
        .eq('status', 'active');

      const loansByDept = new Map<string, { name: string; count: number }>();
      loansData?.forEach(loan => {
        const dept = (loan.employee as any)?.department;
        if (dept) {
          const existing = loansByDept.get(dept.id);
          if (existing) {
            existing.count += 1;
          } else {
            loansByDept.set(dept.id, { name: dept.name, count: 1 });
          }
        }
      });

      let mostLoansDept: InsightsData['mostLoansDept'] = null;
      loansByDept.forEach(dept => {
        if (!mostLoansDept || dept.count > mostLoansDept.count) {
          mostLoansDept = dept;
        }
      });

      return {
        highestPayrollDept,
        mostLoansDept,
      };
    },
  });

  const isLoading = payrollQuery.isLoading || workforceQuery.isLoading || 
                    leaveQuery.isLoading || loanQuery.isLoading || insightsQuery.isLoading;

  const refetch = () => {
    payrollQuery.refetch();
    workforceQuery.refetch();
    leaveQuery.refetch();
    loanQuery.refetch();
    insightsQuery.refetch();
  };

  return {
    data: {
      payroll: payrollQuery.data || {
        totalGross: [],
        totalNet: [],
        employerGosi: [],
        employeesPaid: 0,
        pendingRuns: 0,
        hasMixedCurrencies: false,
      },
      workforce: workforceQuery.data || {
        totalActive: 0,
        newHires: 0,
        exits: 0,
      },
      leave: leaveQuery.data || {
        pendingApprovals: 0,
        onLeaveToday: 0,
        daysTakenMTD: 0,
      },
      loans: loanQuery.data || {
        activeLoans: 0,
        outstandingBalance: [],
        installmentsDueThisMonth: 0,
        hasMixedCurrencies: false,
      },
      insights: insightsQuery.data || {
        highestPayrollDept: null,
        mostLoansDept: null,
      },
    },
    isLoading,
    refetch,
  };
}
