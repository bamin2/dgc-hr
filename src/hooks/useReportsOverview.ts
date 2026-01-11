import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { startOfMonth, endOfMonth, format } from 'date-fns';
import { measureAsync } from '@/lib/perf';

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
    queryFn: () => measureAsync('ReportsOverview: payroll', async (): Promise<PayrollSnapshot> => {
      // Run both queries in parallel
      const [payrollRunsResult, pendingResult] = await Promise.all([
        supabase
          .from('payroll_runs')
          .select(`id, status, work_location:work_locations(currency)`)
          .in('status', ['finalized', 'payslips_issued'])
          .gte('pay_period_start', startDate)
          .lte('pay_period_end', endDate),
        supabase
          .from('payroll_runs')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'draft'),
      ]);

      if (payrollRunsResult.error) throw payrollRunsResult.error;
      if (pendingResult.error) throw pendingResult.error;

      const payrollRuns = payrollRunsResult.data;
      const pendingCount = pendingResult.count;
      const finalizedRunIds = payrollRuns?.map(r => r.id) || [];

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
            work_location:work_locations(currency, gosi_nationality_rates)
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
        const currencyCode = (record.payroll_run as any)?.work_location?.currency || 'SAR';
        const gosiRates = (record.payroll_run as any)?.work_location?.gosi_nationality_rates;
        const employerRate = gosiRates?.saudi?.employerRate || gosiRates?.gcc?.employerRate || 12;
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
    }),
  });
  // Workforce Snapshot Query
  const workforceQuery = useQuery({
    queryKey: ['reports-overview-workforce', monthStart, monthEnd],
    queryFn: () => measureAsync('ReportsOverview: workforce', async (): Promise<WorkforceSnapshot> => {
      // Run all 3 queries in parallel
      const [activeResult, hiresResult, exitsResult] = await Promise.all([
        supabase
          .from('employees')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'active'),
        supabase
          .from('employees')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'active')
          .gte('join_date', monthStart)
          .lte('join_date', monthEnd),
        supabase
          .from('employees')
          .select('*', { count: 'exact', head: true })
          .in('status', ['resigned', 'terminated'])
          .gte('updated_at', monthStart)
          .lte('updated_at', monthEnd),
      ]);

      if (activeResult.error) throw activeResult.error;
      if (hiresResult.error) throw hiresResult.error;
      if (exitsResult.error) throw exitsResult.error;

      return {
        totalActive: activeResult.count || 0,
        newHires: hiresResult.count || 0,
        exits: exitsResult.count || 0,
      };
    }),
  });

  // Leave Snapshot Query
  const leaveQuery = useQuery({
    queryKey: ['reports-overview-leave', today, monthStart, monthEnd],
    queryFn: () => measureAsync('ReportsOverview: leave', async (): Promise<LeaveSnapshot> => {
      // Run all 3 queries in parallel
      const [pendingResult, onLeaveResult, leaveDaysResult] = await Promise.all([
        supabase
          .from('leave_requests')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending'),
        supabase
          .from('leave_requests')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'approved')
          .lte('start_date', today)
          .gte('end_date', today),
        supabase
          .from('leave_requests')
          .select('days_count')
          .eq('status', 'approved')
          .gte('start_date', monthStart)
          .lte('start_date', monthEnd),
      ]);

      if (pendingResult.error) throw pendingResult.error;
      if (onLeaveResult.error) throw onLeaveResult.error;
      if (leaveDaysResult.error) throw leaveDaysResult.error;

      const totalDays = leaveDaysResult.data?.reduce((sum, r) => sum + (r.days_count || 0), 0) || 0;

      return {
        pendingApprovals: pendingResult.count || 0,
        onLeaveToday: onLeaveResult.count || 0,
        daysTakenMTD: totalDays,
      };
    }),
  });

  // Loan Snapshot Query
  const loanQuery = useQuery({
    queryKey: ['reports-overview-loans', monthStart, monthEnd],
    queryFn: () => measureAsync('ReportsOverview: loans', async (): Promise<LoanSnapshot> => {
      // Run all 3 queries in parallel
      const [activeCountResult, activeLoansResult, dueCountResult] = await Promise.all([
        supabase
          .from('loans')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'active'),
        supabase
          .from('loans')
          .select(`
            id,
            employee:employees(salary_currency_code),
            installments:loan_installments(amount, status)
          `)
          .eq('status', 'active'),
        supabase
          .from('loan_installments')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'due')
          .gte('due_date', monthStart)
          .lte('due_date', monthEnd),
      ]);

      if (activeCountResult.error) throw activeCountResult.error;
      if (activeLoansResult.error) throw activeLoansResult.error;
      if (dueCountResult.error) throw dueCountResult.error;

      // Calculate outstanding balance by currency
      const balanceByCurrency = new Map<string, number>();
      activeLoansResult.data?.forEach(loan => {
        const currencyCode = (loan.employee as any)?.salary_currency_code || 'SAR';
        const outstanding = (loan.installments as any[])
          ?.filter(i => i.status !== 'paid')
          .reduce((sum, i) => sum + (i.amount || 0), 0) || 0;
        balanceByCurrency.set(currencyCode, (balanceByCurrency.get(currencyCode) || 0) + outstanding);
      });

      const outstandingBalance = Array.from(balanceByCurrency.entries())
        .map(([currencyCode, amount]) => ({ currencyCode, amount }));

      return {
        activeLoans: activeCountResult.count || 0,
        outstandingBalance,
        installmentsDueThisMonth: dueCountResult.count || 0,
        hasMixedCurrencies: outstandingBalance.length > 1,
      };
    }),
  });

  // Insights Query
  const insightsQuery = useQuery({
    queryKey: ['reports-overview-insights', startDate, endDate],
    queryFn: () => measureAsync('ReportsOverview: insights', async (): Promise<InsightsData> => {
      // First fetch payroll runs to get IDs
      const { data: payrollRuns } = await supabase
        .from('payroll_runs')
        .select('id, work_location:work_locations(currency)')
        .in('status', ['finalized', 'payslips_issued'])
        .gte('pay_period_start', startDate)
        .lte('pay_period_end', endDate);

      const runIds = payrollRuns?.map(r => r.id) || [];

      // Run payroll data and loans queries in parallel
      const [payrollDataResult, loansDataResult] = await Promise.all([
        runIds.length > 0
          ? supabase
              .from('payroll_run_employees')
              .select(`
                gross_pay,
                employee:employees!inner(
                  department:departments(id, name),
                  salary_currency_code
                )
              `)
              .in('payroll_run_id', runIds)
          : Promise.resolve({ data: null, error: null }),
        supabase
          .from('loans')
          .select(`
            id,
            employee:employees!inner(
              department:departments(id, name)
            )
          `)
          .eq('status', 'active'),
      ]);

      // Process payroll data for highest cost department
      let highestPayrollDept: InsightsData['highestPayrollDept'] = null;
      if (payrollDataResult.data) {
        const deptTotals = new Map<string, { name: string; amount: number; currencyCode: string }>();
        payrollDataResult.data.forEach(record => {
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

      // Process loans data for most loans department
      const loansByDept = new Map<string, { name: string; count: number }>();
      loansDataResult.data?.forEach(loan => {
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
    }),
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
