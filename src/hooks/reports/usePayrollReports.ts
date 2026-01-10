import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ReportFilters, PayrollRunSummary, PayrollDetailedRecord, PayslipRegisterRecord } from '@/types/reports';
import { format } from 'date-fns';

async function fetchPayrollRunSummary(filters: ReportFilters): Promise<PayrollRunSummary[]> {
  const { data: runs, error: runsError } = await supabase
    .from('payroll_runs')
    .select('*')
    .order('pay_period_start', { ascending: false });
  
  if (runsError) throw runsError;
  
  let filteredRuns = runs || [];
  if (filters.dateRange) {
    filteredRuns = filteredRuns.filter(run => 
      run.pay_period_start >= filters.dateRange!.start && 
      run.pay_period_end <= filters.dateRange!.end
    );
  }
  
  const runIds = filteredRuns.map(r => r.id);
  if (runIds.length === 0) return [];
  
  const { data: employees } = await supabase
    .from('payroll_run_employees')
    .select('payroll_run_id, employee_id, gross_pay, total_deductions, net_pay, gosi_deduction')
    .in('payroll_run_id', runIds);
  
  const { data: adjustments } = await supabase
    .from('payroll_run_adjustments')
    .select('*')
    .in('payroll_run_id', runIds);
  
  // Fetch employee currency codes
  const employeeIds = [...new Set((employees || []).map(e => e.employee_id))];
  const { data: empCurrencies } = await supabase
    .from('employees')
    .select('id, salary_currency_code, work_locations!work_location_id(currency)')
    .in('id', employeeIds);
  
  const currencyMap = new Map<string, string>();
  (empCurrencies || []).forEach(emp => {
    const currency = emp.salary_currency_code || 
      (emp.work_locations as { currency: string } | null)?.currency || 
      'BHD';
    currencyMap.set(emp.id, currency);
  });
  
  return filteredRuns.map(run => {
    const runEmployees = (employees || []).filter(e => e.payroll_run_id === run.id);
    const runAdjustments = (adjustments || []).filter(a => a.payroll_run_id === run.id);
    
    // Determine currencies in this run
    const currencies = new Set<string>();
    runEmployees.forEach(e => {
      const currency = currencyMap.get(e.employee_id) || 'BHD';
      currencies.add(currency);
    });
    
    const hasMixedCurrencies = currencies.size > 1;
    const currencyCode = currencies.size === 1 ? Array.from(currencies)[0] : 'Mixed';
    
    const loanDeductions = runAdjustments
      .filter(a => a.type === 'loan_deduction')
      .reduce((sum, a) => sum + Math.abs(a.amount || 0), 0);
    
    const totalGross = runEmployees.reduce((sum, e) => sum + (e.gross_pay || 0), 0);
    const totalDeductions = runEmployees.reduce((sum, e) => sum + (e.total_deductions || 0), 0);
    const totalNet = runEmployees.reduce((sum, e) => sum + (e.net_pay || 0), 0);
    const employeeGosiTotal = runEmployees.reduce((sum, e) => sum + (e.gosi_deduction || 0), 0);
    const employerGosiTotal = employeeGosiTotal * 1.2;
    
    return {
      id: run.id,
      payPeriodStart: run.pay_period_start,
      payPeriodEnd: run.pay_period_end,
      processedDate: run.processed_date || run.created_at,
      status: run.status,
      employeeCount: run.employee_count || runEmployees.length,
      currencyCode,
      hasMixedCurrencies,
      totalGross,
      totalDeductions,
      totalNetPay: totalNet,
      employeeGosiTotal,
      employerGosiTotal,
      loanDeductionsTotal: loanDeductions,
    };
  });
}

async function fetchPayrollDetailed(filters: ReportFilters): Promise<PayrollDetailedRecord[]> {
  let query = supabase.from('payroll_run_employees').select('*');
  
  if (filters.payrollRunId) {
    query = query.eq('payroll_run_id', filters.payrollRunId);
  }
  
  const { data, error } = await query;
  if (error) throw error;
  
  // Fetch employee currency codes
  const employeeIds = [...new Set((data || []).map(e => e.employee_id))];
  const { data: empCurrencies } = await supabase
    .from('employees')
    .select('id, salary_currency_code, work_locations!work_location_id(currency)')
    .in('id', employeeIds);
  
  const currencyMap = new Map<string, string>();
  (empCurrencies || []).forEach(emp => {
    const currency = emp.salary_currency_code || 
      (emp.work_locations as { currency: string } | null)?.currency || 
      'BHD';
    currencyMap.set(emp.id, currency);
  });
  
  const { data: adjustments } = await supabase
    .from('payroll_run_adjustments')
    .select('*')
    .eq('type', 'loan_deduction');
  
  const loanByEmployee = new Map<string, number>();
  (adjustments || []).forEach(a => {
    const current = loanByEmployee.get(a.employee_id) || 0;
    loanByEmployee.set(a.employee_id, current + Math.abs(a.amount || 0));
  });
  
  return (data || []).map((e): PayrollDetailedRecord => {
    const otherAllowances = e.other_allowances;
    const otherDeductions = e.other_deductions;
    const otherAllowancesTotal = typeof otherAllowances === 'object' && otherAllowances !== null && !Array.isArray(otherAllowances)
      ? Object.values(otherAllowances as Record<string, number>).reduce((sum, v) => sum + (typeof v === 'number' ? v : 0), 0)
      : 0;
    const otherDeductionsTotal = typeof otherDeductions === 'object' && otherDeductions !== null && !Array.isArray(otherDeductions)
      ? Object.values(otherDeductions as Record<string, number>).reduce((sum, v) => sum + (typeof v === 'number' ? v : 0), 0)
      : 0;
    
    const currencyCode = currencyMap.get(e.employee_id) || 'BHD';
    
    return {
      employeeId: e.employee_id,
      employeeCode: e.employee_code || '',
      employeeName: e.employee_name,
      department: e.department,
      position: e.position || '',
      currencyCode,
      baseSalary: e.base_salary,
      housingAllowance: e.housing_allowance,
      transportationAllowance: e.transportation_allowance,
      otherAllowances: otherAllowancesTotal,
      grossPay: e.gross_pay,
      employeeGosi: e.gosi_deduction,
      employerGosi: e.gosi_deduction * 1.2,
      loanDeductions: loanByEmployee.get(e.employee_id) || 0,
      otherDeductions: otherDeductionsTotal,
      totalDeductions: e.total_deductions,
      netPay: e.net_pay,
    };
  });
}

async function fetchPayslipRegister(filters: ReportFilters): Promise<PayslipRegisterRecord[]> {
  const { data: runs } = await supabase.from('payroll_runs').select('*');
  const { data: employees } = await supabase.from('payroll_run_employees').select('*');
  
  const results: PayslipRegisterRecord[] = [];
  
  (runs || []).forEach(run => {
    const runEmployees = (employees || []).filter(e => e.payroll_run_id === run.id);
    const payPeriod = `${format(new Date(run.pay_period_start), 'MMM d')} - ${format(new Date(run.pay_period_end), 'MMM d, yyyy')}`;
    
    runEmployees.forEach(emp => {
      results.push({
        payrollRunId: run.id,
        payPeriod,
        employeeId: emp.employee_id,
        employeeCode: emp.employee_code || '',
        employeeName: emp.employee_name,
        department: emp.department,
        payslipIssued: run.status === 'payslips_issued',
        issueDate: run.status === 'payslips_issued' ? run.processed_date : undefined,
      });
    });
  });
  
  return results;
}

export function usePayrollRunSummary(filters: ReportFilters) {
  return useQuery({
    queryKey: ['report-payroll-run-summary', filters],
    queryFn: () => fetchPayrollRunSummary(filters),
  });
}

export function usePayrollDetailed(filters: ReportFilters) {
  return useQuery({
    queryKey: ['report-payroll-detailed', filters],
    queryFn: () => fetchPayrollDetailed(filters),
  });
}

export function usePayslipRegister(filters: ReportFilters) {
  return useQuery({
    queryKey: ['report-payslip-register', filters],
    queryFn: () => fetchPayslipRegister(filters),
  });
}
