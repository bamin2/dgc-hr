/**
 * Cost Reports Hooks
 * CTC (Cost-to-Company) and Payroll Variance reports
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useRole } from '@/contexts/RoleContext';
import { 
  CTCRecord, 
  CTCSummary, 
  PayrollVarianceRecord, 
  PayrollVarianceSummary,
  CostReportFilters,
  VarianceReasonTag,
  AllowanceBreakdownItem,
} from '@/types/reports';
import { useFxRatesForCurrencies, convertToBaseCurrency } from '@/hooks/useFxRates';
import { parseISO } from 'date-fns';

interface EmployeeCurrencyInfo {
  id: string;
  salary_currency_code: string | null;
  work_locations: { currency: string } | null;
  is_subject_to_gosi: boolean | null;
  nationality: string | null;
  work_location_id: string | null;
}

interface BenefitEnrollmentInfo {
  employee_id: string;
  employer_contribution: number;
}

/**
 * Fetch CTC Report data
 */
async function fetchCTCReport(
  filters: CostReportFilters,
  fxRateMap: Map<string, { rate: number; effectiveDate: string }>,
  userId: string | undefined,
  isManager: boolean,
  isHrAdmin: boolean,
  effectiveEmployeeId: string | undefined,
  teamMemberIds: string[]
): Promise<{ records: CTCRecord[]; summary: CTCSummary }> {
  // Determine payroll run to use
  let payrollRunId = filters.payrollRunId;
  
  if (!payrollRunId && filters.month) {
    // Find payroll run for the given month
    const monthStart = `${filters.month}-01`;
    const { data: runs } = await supabase
      .from('payroll_runs')
      .select('id')
      .gte('pay_period_start', monthStart)
      .lte('pay_period_start', `${filters.month}-31`)
      .eq('location_id', filters.locationId || '')
      .in('status', ['completed', 'payslips_issued'])
      .limit(1);
    
    if (runs && runs.length > 0) {
      payrollRunId = runs[0].id;
    }
  }

  if (!payrollRunId) {
    // Get the most recent completed payroll run for the location
    let query = supabase
      .from('payroll_runs')
      .select('id')
      .in('status', ['completed', 'payslips_issued'])
      .order('pay_period_end', { ascending: false })
      .limit(1);
    
    if (filters.locationId) {
      query = query.eq('location_id', filters.locationId);
    }
    
    const { data: runs } = await query;
    if (runs && runs.length > 0) {
      payrollRunId = runs[0].id;
    }
  }

  if (!payrollRunId) {
    return { records: [], summary: { totalCTC: 0, totalGrossPay: 0, totalEmployerGosi: 0, totalEmployerBenefitsCost: 0, employeeCount: 0 } };
  }

  // Fetch payroll run employees
  const { data: payrollEmployees, error } = await supabase
    .from('payroll_run_employees')
    .select('*')
    .eq('payroll_run_id', payrollRunId);

  if (error) throw error;
  if (!payrollEmployees || payrollEmployees.length === 0) {
    return { records: [], summary: { totalCTC: 0, totalGrossPay: 0, totalEmployerGosi: 0, totalEmployerBenefitsCost: 0, employeeCount: 0 } };
  }

  const employeeIds = payrollEmployees.map(e => e.employee_id);

  // Fetch employee currency and GOSI info
  const { data: employeeInfo } = await supabase
    .from('employees')
    .select('id, salary_currency_code, is_subject_to_gosi, nationality, work_location_id, department_id, work_locations!work_location_id(currency)')
    .in('id', employeeIds);

  const employeeMap = new Map<string, EmployeeCurrencyInfo>();
  (employeeInfo || []).forEach(emp => {
    employeeMap.set(emp.id, emp as EmployeeCurrencyInfo);
  });

  // Fetch GOSI rates - use a simpler approach with location settings
  const { data: locations } = await supabase
    .from('work_locations')
    .select('id, gosi_employer_rate_saudi, gosi_employer_rate_non_saudi');

  const gosiRateMap = new Map<string, { saudi: number; nonSaudi: number }>();
  (locations || []).forEach((loc) => {
    gosiRateMap.set(loc.id, {
      saudi: loc.gosi_employer_rate_saudi || 0.12,
      nonSaudi: loc.gosi_employer_rate_non_saudi || 0.02,
    });
  });

  // Fetch employer benefit contributions
  const { data: benefitEnrollments } = await supabase
    .from('benefit_enrollments')
    .select('employee_id, employer_contribution')
    .in('employee_id', employeeIds)
    .eq('status', 'active');

  const benefitsMap = new Map<string, number>();
  (benefitEnrollments || []).forEach((be: BenefitEnrollmentInfo) => {
    const current = benefitsMap.get(be.employee_id) || 0;
    benefitsMap.set(be.employee_id, current + be.employer_contribution);
  });

  // Apply role-based filtering
  let filteredEmployees = payrollEmployees;
  if (!isHrAdmin && isManager && effectiveEmployeeId) {
    // Manager can only see direct reports
    filteredEmployees = payrollEmployees.filter(e => teamMemberIds.includes(e.employee_id));
  }

  // Apply department filter
  if (filters.departmentId) {
    const deptEmployeeIds = (employeeInfo || [])
      .filter(e => e.department_id === filters.departmentId)
      .map(e => e.id);
    filteredEmployees = filteredEmployees.filter(e => deptEmployeeIds.includes(e.employee_id));
  }

  // Apply status filter
  if (filters.status) {
    const { data: statusEmployees } = await supabase
      .from('employees')
      .select('id')
      .eq('status', filters.status as 'active' | 'on_boarding' | 'on_leave' | 'probation' | 'resigned' | 'terminated')
      .in('id', employeeIds);
    
    const statusIds = new Set((statusEmployees || []).map(e => e.id));
    filteredEmployees = filteredEmployees.filter(e => statusIds.has(e.employee_id));
  }

  // Build CTC records
  const records: CTCRecord[] = filteredEmployees.map((emp) => {
    const empInfo = employeeMap.get(emp.employee_id);
    const currency = empInfo?.salary_currency_code || 
      empInfo?.work_locations?.currency || 'BHD';

    // Parse allowances breakdown
    const allowancesBreakdown: AllowanceBreakdownItem[] = [];
    if (emp.housing_allowance > 0) {
      allowancesBreakdown.push({ name: 'Housing', amount: emp.housing_allowance });
    }
    if (emp.transportation_allowance > 0) {
      allowancesBreakdown.push({ name: 'Transportation', amount: emp.transportation_allowance });
    }
    const otherAllowances = emp.other_allowances;
    if (otherAllowances && typeof otherAllowances === 'object' && !Array.isArray(otherAllowances)) {
      Object.entries(otherAllowances as Record<string, unknown>).forEach(([name, amount]) => {
        if (typeof amount === 'number' && amount > 0) {
          allowancesBreakdown.push({ name, amount });
        }
      });
    }

    const allowancesTotal = allowancesBreakdown.reduce((sum, a) => sum + a.amount, 0);
    
    // Calculate employer GOSI
    let employerGosi = 0;
    if (empInfo?.is_subject_to_gosi) {
      const nationalityType = empInfo.nationality?.toLowerCase().includes('saudi') ? 'saudi' : 'nonSaudi';
      const locationRates = gosiRateMap.get(empInfo.work_location_id || '');
      const employerRate = locationRates ? locationRates[nationalityType] : 0.12;
      
      const gosiBase = emp.base_salary;
      employerGosi = gosiBase * employerRate;
    }

    // Get employer benefits cost
    const employerBenefitsCost = benefitsMap.get(emp.employee_id) || 0;

    // Convert to BHD if needed
    let basicSalary = emp.base_salary;
    let grossPay = emp.gross_pay;
    let wasConverted = false;
    let conversionInfo: CTCRecord['conversionInfo'] = undefined;

    if (currency !== 'BHD' && fxRateMap.size > 0) {
      const conversion = convertToBaseCurrency(emp.gross_pay, currency, fxRateMap);
      if (conversion) {
        grossPay = conversion.convertedAmount;
        basicSalary = emp.base_salary / conversion.rate;
        employerGosi = employerGosi / conversion.rate;
        wasConverted = true;
        conversionInfo = {
          rate: conversion.rate,
          effectiveDate: conversion.effectiveDate,
          fromCurrency: currency,
        };
        // Convert allowances
        allowancesBreakdown.forEach(a => {
          a.amount = a.amount / conversion.rate;
        });
      }
    }

    const allowancesTotalConverted = allowancesBreakdown.reduce((sum, a) => sum + a.amount, 0);
    const ctcTotal = grossPay + employerGosi + employerBenefitsCost;

    return {
      employeeId: emp.employee_id,
      employeeCode: emp.employee_code || '',
      employeeName: emp.employee_name,
      department: emp.department,
      position: emp.position || '',
      originalCurrency: currency,
      basicSalary,
      allowancesTotal: allowancesTotalConverted,
      allowancesBreakdown,
      grossPay,
      employerGosi,
      employerBenefitsCost,
      ctcTotal,
      wasConverted,
      conversionInfo,
    };
  });

  // Calculate summary
  const summary: CTCSummary = {
    totalCTC: records.reduce((sum, r) => sum + r.ctcTotal, 0),
    totalGrossPay: records.reduce((sum, r) => sum + r.grossPay, 0),
    totalEmployerGosi: records.reduce((sum, r) => sum + r.employerGosi, 0),
    totalEmployerBenefitsCost: records.reduce((sum, r) => sum + r.employerBenefitsCost, 0),
    employeeCount: records.length,
  };

  return { records, summary };
}

/**
 * Fetch Payroll Variance Report data
 */
async function fetchPayrollVarianceReport(
  filters: CostReportFilters,
  fxRateMap: Map<string, { rate: number; effectiveDate: string }>,
  userId: string | undefined,
  isManager: boolean,
  isHrAdmin: boolean,
  effectiveEmployeeId: string | undefined,
  teamMemberIds: string[]
): Promise<{ records: PayrollVarianceRecord[]; summary: PayrollVarianceSummary }> {
  if (!filters.payrollRunId) {
    return { 
      records: [], 
      summary: { 
        currentTotalGross: 0, 
        previousTotalGross: 0, 
        deltaAmount: 0, 
        deltaPercent: 0,
        currentHeadcount: 0,
        previousHeadcount: 0,
        headcountDelta: 0,
      } 
    };
  }

  // Get current payroll run details
  const { data: currentRun } = await supabase
    .from('payroll_runs')
    .select('*')
    .eq('id', filters.payrollRunId)
    .single();

  if (!currentRun) {
    return { 
      records: [], 
      summary: { 
        currentTotalGross: 0, 
        previousTotalGross: 0, 
        deltaAmount: 0, 
        deltaPercent: 0,
        currentHeadcount: 0,
        previousHeadcount: 0,
        headcountDelta: 0,
      } 
    };
  }

  // Get compare payroll run (either specified or previous month)
  let compareRunId = filters.comparePayrollRunId;
  if (!compareRunId) {
    // Find the previous payroll run for the same location
    const { data: prevRuns } = await supabase
      .from('payroll_runs')
      .select('id')
      .eq('location_id', currentRun.location_id)
      .lt('pay_period_end', currentRun.pay_period_start)
      .in('status', ['completed', 'payslips_issued'])
      .order('pay_period_end', { ascending: false })
      .limit(1);
    
    if (prevRuns && prevRuns.length > 0) {
      compareRunId = prevRuns[0].id;
    }
  }

  if (!compareRunId) {
    // No comparison available - return current run data only
    const { data: currentEmployees } = await supabase
      .from('payroll_run_employees')
      .select('*')
      .eq('payroll_run_id', filters.payrollRunId);

    const currentTotal = (currentEmployees || []).reduce((sum, e) => sum + (e.gross_pay || 0), 0);
    
    return { 
      records: [], 
      summary: { 
        currentTotalGross: currentTotal, 
        previousTotalGross: 0, 
        deltaAmount: currentTotal, 
        deltaPercent: 100,
        currentHeadcount: (currentEmployees || []).length,
        previousHeadcount: 0,
        headcountDelta: (currentEmployees || []).length,
      } 
    };
  }

  // Fetch both payroll runs' employees
  const [currentResult, compareResult] = await Promise.all([
    supabase.from('payroll_run_employees').select('*').eq('payroll_run_id', filters.payrollRunId),
    supabase.from('payroll_run_employees').select('*').eq('payroll_run_id', compareRunId),
  ]);

  const currentEmployees = currentResult.data || [];
  const compareEmployees = compareResult.data || [];

  const allEmployeeIds = [...new Set([
    ...currentEmployees.map(e => e.employee_id),
    ...compareEmployees.map(e => e.employee_id),
  ])];

  // Fetch employee info for currency conversion and filtering
  const { data: employeeInfo } = await supabase
    .from('employees')
    .select('id, salary_currency_code, department_id, join_date, status, work_locations!work_location_id(currency)')
    .in('id', allEmployeeIds);

  const employeeMap = new Map<string, EmployeeCurrencyInfo & { department_id?: string; join_date?: string; status?: string }>();
  (employeeInfo || []).forEach(emp => {
    employeeMap.set(emp.id, emp as EmployeeCurrencyInfo & { department_id?: string; join_date?: string; status?: string });
  });

  // Fetch salary history for the period
  const { data: salaryHistory } = await supabase
    .from('salary_history')
    .select('employee_id, effective_date, previous_salary, new_salary')
    .in('employee_id', allEmployeeIds)
    .gte('effective_date', currentRun.pay_period_start)
    .lte('effective_date', currentRun.pay_period_end);

  const salaryChanges = new Set((salaryHistory || []).map(sh => sh.employee_id));

  // Fetch loan installments for both periods using loans table
  const { data: loans } = await supabase
    .from('loans')
    .select('id, employee_id')
    .in('employee_id', allEmployeeIds);

  const loanIds = (loans || []).map(l => l.id);
  const loanEmployeeMap = new Map((loans || []).map(l => [l.id, l.employee_id]));

  const { data: loanInstallments } = loanIds.length > 0 
    ? await supabase
        .from('loan_installments')
        .select('loan_id, amount, due_date, status')
        .in('loan_id', loanIds)
        .in('status', ['pending', 'deducted'])
    : { data: [] };

  // Build maps for loan installments by period
  const currentPeriodStart = parseISO(currentRun.pay_period_start);
  const currentPeriodEnd = parseISO(currentRun.pay_period_end);
  
  const currentLoanMap = new Map<string, number>();
  const previousLoanMap = new Map<string, number>();

  (loanInstallments || []).forEach((li) => {
    const empId = loanEmployeeMap.get(li.loan_id) || '';
    const dueDate = parseISO(li.due_date);
    
    if (dueDate >= currentPeriodStart && dueDate <= currentPeriodEnd) {
      currentLoanMap.set(empId, (currentLoanMap.get(empId) || 0) + li.amount);
    } else {
      previousLoanMap.set(empId, (previousLoanMap.get(empId) || 0) + li.amount);
    }
  });

  // Fetch payroll adjustments
  const { data: adjustments } = await supabase
    .from('payroll_run_adjustments')
    .select('*')
    .in('payroll_run_id', [filters.payrollRunId, compareRunId]);

  const currentAdjustments = new Set(
    (adjustments || [])
      .filter(a => a.payroll_run_id === filters.payrollRunId)
      .map(a => a.employee_id)
  );

  // Build variance records
  const currentMap = new Map(currentEmployees.map(e => [e.employee_id, e]));
  const compareMap = new Map(compareEmployees.map(e => [e.employee_id, e]));

  // Apply role-based filtering
  let filteredEmployeeIds = allEmployeeIds;
  if (!isHrAdmin && isManager && effectiveEmployeeId) {
    filteredEmployeeIds = allEmployeeIds.filter(id => teamMemberIds.includes(id));
  }

  // Apply department filter
  if (filters.departmentId) {
    filteredEmployeeIds = filteredEmployeeIds.filter(id => {
      const emp = employeeMap.get(id);
      return emp?.department_id === filters.departmentId;
    });
  }

  const records: PayrollVarianceRecord[] = [];

  filteredEmployeeIds.forEach(employeeId => {
    const current = currentMap.get(employeeId);
    const previous = compareMap.get(employeeId);
    const empInfo = employeeMap.get(employeeId);
    const currency = empInfo?.salary_currency_code || 
      (empInfo as { work_locations?: { currency: string } })?.work_locations?.currency || 'BHD';

    // Get values (0 if employee wasn't in that run)
    let currentGross = current?.gross_pay || 0;
    let previousGross = previous?.gross_pay || 0;
    let currentBasic = current?.base_salary || 0;
    let previousBasic = previous?.base_salary || 0;

    // Convert to BHD if needed
    if (currency !== 'BHD' && fxRateMap.size > 0) {
      const conversion = convertToBaseCurrency(1, currency, fxRateMap);
      if (conversion) {
        currentGross = currentGross / conversion.rate;
        previousGross = previousGross / conversion.rate;
        currentBasic = currentBasic / conversion.rate;
        previousBasic = previousBasic / conversion.rate;
      }
    }

    const delta = currentGross - previousGross;
    const deltaPercent = previousGross > 0 ? (delta / previousGross) * 100 : (currentGross > 0 ? 100 : 0);

    // Skip if no change
    if (Math.abs(delta) < 0.01) return;

    // Determine reasons
    const reasons: VarianceReasonTag[] = [];

    // Joiner/Leaver
    if (!previous && current) {
      reasons.push('joiner');
    } else if (previous && !current) {
      reasons.push('leaver');
    }

    // Salary change
    if (salaryChanges.has(employeeId)) {
      reasons.push('salary_change');
    } else if (currentBasic !== previousBasic && Math.abs(currentBasic - previousBasic) > 0.01) {
      reasons.push('salary_change');
    }

    // Loan changes
    const currentLoan = currentLoanMap.get(employeeId) || 0;
    const previousLoan = previousLoanMap.get(employeeId) || 0;
    if (currentLoan > 0 && previousLoan === 0) {
      reasons.push('loan_started');
    } else if (currentLoan === 0 && previousLoan > 0) {
      reasons.push('loan_ended');
    } else if (Math.abs(currentLoan - previousLoan) > 0.01) {
      reasons.push('loan_changed');
    }

    // Payroll adjustment
    if (currentAdjustments.has(employeeId)) {
      reasons.push('adjustment');
    }

    // Allowance change (if not already explained by salary change)
    const currentAllowances = (current?.housing_allowance || 0) + (current?.transportation_allowance || 0);
    const previousAllowances = (previous?.housing_allowance || 0) + (previous?.transportation_allowance || 0);
    if (Math.abs(currentAllowances - previousAllowances) > 0.01 && !reasons.includes('salary_change')) {
      reasons.push('allowance_change');
    }

    // If no reasons found but there's a change, mark as adjustment
    if (reasons.length === 0 && Math.abs(delta) > 0.01) {
      reasons.push('adjustment');
    }

    records.push({
      employeeId,
      employeeCode: current?.employee_code || previous?.employee_code || '',
      employeeName: current?.employee_name || previous?.employee_name || 'Unknown',
      department: current?.department || previous?.department || '',
      previousGrossPay: previousGross,
      currentGrossPay: currentGross,
      deltaBHD: delta,
      deltaPercent,
      reasons,
      details: {
        previousBasic: previous?.base_salary || 0,
        currentBasic: current?.base_salary || 0,
        previousAllowances,
        currentAllowances,
        previousDeductions: previous?.total_deductions || 0,
        currentDeductions: current?.total_deductions || 0,
        previousLoanInstallment: previousLoan,
        currentLoanInstallment: currentLoan,
      },
    });
  });

  // Calculate summary
  const currentTotal = currentEmployees.reduce((sum, e) => {
    const empInfo = employeeMap.get(e.employee_id);
    const currency = empInfo?.salary_currency_code || 
      (empInfo as { work_locations?: { currency: string } })?.work_locations?.currency || 'BHD';
    let gross = e.gross_pay || 0;
    if (currency !== 'BHD' && fxRateMap.size > 0) {
      const conversion = convertToBaseCurrency(gross, currency, fxRateMap);
      if (conversion) {
        gross = conversion.convertedAmount;
      }
    }
    return sum + gross;
  }, 0);

  const previousTotal = compareEmployees.reduce((sum, e) => {
    const empInfo = employeeMap.get(e.employee_id);
    const currency = empInfo?.salary_currency_code || 
      (empInfo as { work_locations?: { currency: string } })?.work_locations?.currency || 'BHD';
    let gross = e.gross_pay || 0;
    if (currency !== 'BHD' && fxRateMap.size > 0) {
      const conversion = convertToBaseCurrency(gross, currency, fxRateMap);
      if (conversion) {
        gross = conversion.convertedAmount;
      }
    }
    return sum + gross;
  }, 0);

  const summary: PayrollVarianceSummary = {
    currentTotalGross: currentTotal,
    previousTotalGross: previousTotal,
    deltaAmount: currentTotal - previousTotal,
    deltaPercent: previousTotal > 0 ? ((currentTotal - previousTotal) / previousTotal) * 100 : 0,
    currentHeadcount: currentEmployees.length,
    previousHeadcount: compareEmployees.length,
    headcountDelta: currentEmployees.length - compareEmployees.length,
  };

  // Sort by absolute delta descending
  records.sort((a, b) => Math.abs(b.deltaBHD) - Math.abs(a.deltaBHD));

  return { records, summary };
}

/**
 * Hook for CTC Report
 */
export function useCTCReport(filters: CostReportFilters) {
  const { user } = useAuth();
  const { hasRole, isManager, teamMemberIds, effectiveEmployeeId } = useRole();
  const isHrAdmin = hasRole('hr') || hasRole('admin');

  // Get unique currencies needed for conversion
  const { data: currencies } = useQuery({
    queryKey: ['employee-currencies', filters.locationId],
    queryFn: async () => {
      let query = supabase.from('employees').select('salary_currency_code');
      if (filters.locationId) {
        query = query.eq('work_location_id', filters.locationId);
      }
      const { data } = await query;
      const codes = [...new Set((data || []).map(e => e.salary_currency_code).filter(Boolean))];
      return codes as string[];
    },
    staleTime: 5 * 60 * 1000,
  });

  // Get FX rates
  const { data: fxRateMap } = useFxRatesForCurrencies(currencies || [], filters.dateRange?.end ? new Date(filters.dateRange.end) : undefined);

  return useQuery({
    queryKey: ['report-ctc', filters, user?.id, isManager, isHrAdmin],
    queryFn: () => fetchCTCReport(
      filters, 
      fxRateMap || new Map(), 
      user?.id, 
      isManager, 
      isHrAdmin, 
      effectiveEmployeeId,
      teamMemberIds
    ),
    staleTime: 5 * 60 * 1000,
    enabled: !!fxRateMap,
  });
}

/**
 * Hook for Payroll Variance Report
 */
export function usePayrollVarianceReport(filters: CostReportFilters) {
  const { user } = useAuth();
  const { hasRole, isManager, teamMemberIds, effectiveEmployeeId } = useRole();
  const isHrAdmin = hasRole('hr') || hasRole('admin');

  // Get unique currencies needed for conversion
  const { data: currencies } = useQuery({
    queryKey: ['employee-currencies', filters.locationId],
    queryFn: async () => {
      let query = supabase.from('employees').select('salary_currency_code');
      if (filters.locationId) {
        query = query.eq('work_location_id', filters.locationId);
      }
      const { data } = await query;
      const codes = [...new Set((data || []).map(e => e.salary_currency_code).filter(Boolean))];
      return codes as string[];
    },
    staleTime: 5 * 60 * 1000,
  });

  // Get FX rates
  const { data: fxRateMap } = useFxRatesForCurrencies(currencies || [], filters.dateRange?.end ? new Date(filters.dateRange.end) : undefined);

  return useQuery({
    queryKey: ['report-payroll-variance', filters, user?.id, isManager, isHrAdmin],
    queryFn: () => fetchPayrollVarianceReport(
      filters, 
      fxRateMap || new Map(), 
      user?.id, 
      isManager, 
      isHrAdmin, 
      effectiveEmployeeId,
      teamMemberIds
    ),
    staleTime: 5 * 60 * 1000,
    enabled: !!fxRateMap && !!filters.payrollRunId,
  });
}

/**
 * Hook to fetch payroll runs for a location (for filter dropdowns)
 */
export function usePayrollRunsForLocation(locationId?: string) {
  return useQuery({
    queryKey: ['payroll-runs-by-location', locationId],
    queryFn: async () => {
      let query = supabase
        .from('payroll_runs')
        .select('id, pay_period_start, pay_period_end, status, location_id')
        .in('status', ['completed', 'payslips_issued'])
        .order('pay_period_end', { ascending: false })
        .limit(24);
      
      if (locationId) {
        query = query.eq('location_id', locationId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });
}
