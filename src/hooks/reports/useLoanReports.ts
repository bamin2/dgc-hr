import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ReportFilters, LoanSummaryRecord, LoanInstallmentRecord } from '@/types/reports';
import { format, addMonths } from 'date-fns';

async function fetchLoanSummary(filters: ReportFilters): Promise<LoanSummaryRecord[]> {
  const { data: loans, error } = await supabase
    .from('loans')
    .select('id, employee_id, principal_amount, installment_amount, duration_months, start_date, status')
    .order('start_date', { ascending: false });
  
  if (error) throw error;
  
  // Fetch employee info with currency
  const empIds = [...new Set((loans || []).map(l => l.employee_id))];
  const { data: employees } = await supabase
    .from('employees')
    .select('id, first_name, last_name, employee_code, salary_currency_code, departments!department_id(name), work_locations!work_location_id(currency)')
    .in('id', empIds);
  
  const empMap = new Map((employees || []).map(e => [e.id, e]));
  
  // Fetch all installments
  const loanIds = (loans || []).map(l => l.id);
  const { data: installments } = await supabase
    .from('loan_installments')
    .select('loan_id, amount, status')
    .in('loan_id', loanIds);
  
  const installmentsByLoan = new Map<string, { paid: number; remaining: number; paidCount: number; totalCount: number }>();
  (installments || []).forEach(inst => {
    if (!installmentsByLoan.has(inst.loan_id)) {
      installmentsByLoan.set(inst.loan_id, { paid: 0, remaining: 0, paidCount: 0, totalCount: 0 });
    }
    const entry = installmentsByLoan.get(inst.loan_id)!;
    entry.totalCount++;
    if (inst.status === 'paid') {
      entry.paid += inst.amount;
      entry.paidCount++;
    } else {
      entry.remaining += inst.amount;
    }
  });
  
  let records = loans || [];
  
  if (filters.status) {
    records = records.filter(l => l.status === filters.status);
  }
  
  if (filters.employeeId) {
    records = records.filter(l => l.employee_id === filters.employeeId);
  }
  
  return records.map(l => {
    const instData = installmentsByLoan.get(l.id) || { paid: 0, remaining: 0, paidCount: 0, totalCount: 0 };
    const durationMonths = l.duration_months || 0;
    const expectedEndDate = addMonths(new Date(l.start_date), durationMonths);
    const emp = empMap.get(l.employee_id);
    
    // Get currency from employee
    const currencyCode = emp?.salary_currency_code || 
      (emp?.work_locations as { currency: string } | null)?.currency || 
      'BHD';
    
    return {
      loanId: l.id,
      employeeId: l.employee_id,
      employeeCode: emp?.employee_code || '',
      employeeName: emp ? `${emp.first_name} ${emp.last_name}` : 'Unknown',
      department: (emp?.departments as { name: string } | null)?.name || 'Unassigned',
      currencyCode,
      originalAmount: l.principal_amount,
      outstandingBalance: instData.remaining,
      installmentAmount: l.installment_amount || 0,
      paidInstallments: instData.paidCount,
      remainingInstallments: instData.totalCount - instData.paidCount,
      status: l.status,
      startDate: l.start_date,
      expectedEndDate: format(expectedEndDate, 'yyyy-MM-dd'),
    };
  });
}

async function fetchLoanInstallments(filters: ReportFilters): Promise<LoanInstallmentRecord[]> {
  const { data, error } = await supabase
    .from('loan_installments')
    .select('id, loan_id, installment_number, due_date, amount, status, paid_at, paid_method, paid_in_payroll_run_id')
    .order('due_date', { ascending: false });
  
  if (error) throw error;
  
  // Fetch loan info with employee
  const loanIds = [...new Set((data || []).map(i => i.loan_id))];
  const { data: loans } = await supabase
    .from('loans')
    .select('id, employee_id')
    .in('id', loanIds);
  
  const loanMap = new Map((loans || []).map(l => [l.id, l]));
  
  // Fetch employees with currency
  const empIds = [...new Set((loans || []).map(l => l.employee_id))];
  const { data: employees } = await supabase
    .from('employees')
    .select('id, first_name, last_name, salary_currency_code, work_locations!work_location_id(currency)')
    .in('id', empIds);
  
  const empMap = new Map((employees || []).map(e => [e.id, e]));
  
  let records = data || [];
  
  if (filters.dateRange) {
    records = records.filter(r => 
      r.due_date >= filters.dateRange!.start && 
      r.due_date <= filters.dateRange!.end
    );
  }
  
  if (filters.status) {
    records = records.filter(r => r.status === filters.status);
  }
  
  return records.map(r => {
    const loan = loanMap.get(r.loan_id);
    const emp = loan ? empMap.get(loan.employee_id) : null;
    let paymentMethod: 'payroll' | 'manual' | 'pending' = 'pending';
    if (r.status === 'paid') {
      paymentMethod = r.paid_in_payroll_run_id ? 'payroll' : 'manual';
    }
    
    // Get currency from employee
    const currencyCode = emp?.salary_currency_code || 
      (emp?.work_locations as { currency: string } | null)?.currency || 
      'BHD';
    
    return {
      installmentId: r.id,
      loanId: r.loan_id,
      employeeId: loan?.employee_id || '',
      employeeName: emp ? `${emp.first_name} ${emp.last_name}` : 'Unknown',
      currencyCode,
      dueDate: r.due_date,
      dueMonth: format(new Date(r.due_date), 'MMM yyyy'),
      amount: r.amount,
      status: r.status,
      paidDate: r.paid_at || undefined,
      paymentMethod,
      payrollRunId: r.paid_in_payroll_run_id || undefined,
    };
  });
}

export function useLoanSummaryReport(filters: ReportFilters) {
  return useQuery({
    queryKey: ['report-loan-summary', filters],
    queryFn: () => fetchLoanSummary(filters),
  });
}

export function useLoanInstallmentsReport(filters: ReportFilters) {
  return useQuery({
    queryKey: ['report-loan-installments', filters],
    queryFn: () => fetchLoanInstallments(filters),
  });
}
