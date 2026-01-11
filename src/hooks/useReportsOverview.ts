import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { measureAsync } from '@/lib/perf';
import { queryPresets } from '@/lib/queryOptions';

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

const defaultData: ReportsOverviewData = {
  payroll: {
    totalGross: [],
    totalNet: [],
    employerGosi: [],
    employeesPaid: 0,
    pendingRuns: 0,
    hasMixedCurrencies: false,
  },
  workforce: {
    totalActive: 0,
    newHires: 0,
    exits: 0,
  },
  leave: {
    pendingApprovals: 0,
    onLeaveToday: 0,
    daysTakenMTD: 0,
  },
  loans: {
    activeLoans: 0,
    outstandingBalance: [],
    installmentsDueThisMonth: 0,
    hasMixedCurrencies: false,
  },
  insights: {
    highestPayrollDept: null,
    mostLoansDept: null,
  },
};

export function useReportsOverview(dateRange: DateRange) {
  const startDate = format(dateRange.start, 'yyyy-MM-dd');
  const endDate = format(dateRange.end, 'yyyy-MM-dd');

  const query = useQuery({
    queryKey: ['reports-overview', startDate, endDate],
    queryFn: () => measureAsync('ReportsOverview: RPC', async (): Promise<ReportsOverviewData> => {
      const { data, error } = await supabase.rpc('get_reports_overview', {
        p_start_date: startDate,
        p_end_date: endDate,
      });

      if (error) throw error;

      // Parse JSONB response - cast to unknown first then to our type
      const result = data as unknown as {
        payroll: PayrollSnapshot;
        workforce: WorkforceSnapshot;
        leave: LeaveSnapshot;
        loans: LoanSnapshot;
        insights: InsightsData;
      };

      return {
        payroll: result.payroll,
        workforce: result.workforce,
        leave: result.leave,
        loans: result.loans,
        insights: result.insights,
      };
    }),
    ...queryPresets.userData, // 2 min staleTime, 10 min gcTime
  });

  return {
    data: query.data || defaultData,
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
}
