import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface MyPayslip {
  id: string;
  payPeriodStart: string;
  payPeriodEnd: string;
  grossPay: number;
  netPay: number;
  currency: string;
  issuedAt: string;
}

export function useMyPayslips(employeeId: string | undefined) {
  return useQuery({
    queryKey: ['my-payslips', employeeId],
    queryFn: async (): Promise<MyPayslip[]> => {
      if (!employeeId) return [];

      // Fetch payslips with payroll run info
      const { data, error } = await supabase
        .from('payroll_run_employees')
        .select(`
          id,
          gross_pay,
          net_pay,
          created_at,
          payroll_run:payroll_runs!payroll_run_employees_payroll_run_id_fkey(
            pay_period_start,
            pay_period_end,
            status,
            location:work_locations(currency)
          )
        `)
        .eq('employee_id', employeeId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Filter to only include issued payslips and map to our interface
      const issuedPayslips = (data || [])
        .filter((record) => {
          const payrollRun = record.payroll_run as {
            pay_period_start: string;
            pay_period_end: string;
            status: string;
            location: { currency: string } | null;
          } | null;
          return payrollRun?.status === 'payslips_issued';
        })
        .map((record) => {
          const payrollRun = record.payroll_run as {
            pay_period_start: string;
            pay_period_end: string;
            status: string;
            location: { currency: string } | null;
          } | null;

          return {
            id: record.id,
            payPeriodStart: payrollRun?.pay_period_start || '',
            payPeriodEnd: payrollRun?.pay_period_end || '',
            grossPay: Number(record.gross_pay) || 0,
            netPay: Number(record.net_pay) || 0,
            currency: payrollRun?.location?.currency || 'SAR',
            issuedAt: record.created_at || '',
          };
        });

      return issuedPayslips;
    },
    enabled: !!employeeId,
  });
}
