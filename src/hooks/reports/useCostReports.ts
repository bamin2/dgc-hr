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

import { getCountryCodeByName } from '@/data/countries';

interface WorkLocationWithGosi {
  id: string;
  currency: string;
  gosi_enabled: boolean | null;
  gosi_nationality_rates: Array<{ nationality: string; employeeRate: number; employerRate: number }> | null;
}

interface EmployeeWithDetails {
  id: string;
  employee_code: string | null;
  first_name: string;
  last_name: string;
  salary: number | null;
  salary_currency_code: string | null;
  nationality: string | null;
  gosi_registered_salary: number | null;
  is_subject_to_gosi: boolean | null;
  department_id: string | null;
  department: { name: string } | null;
  position: { title: string } | null;
  work_location: WorkLocationWithGosi | null;
}

/**
 * Fetch CTC Report data - based on current employee master data
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
  const emptySummary: CTCSummary = {
    totalCtcMonthly: 0,
    totalCtcYearly: 0,
    totalGrossPay: 0,
    totalEmployerGosi: 0,
    totalEmployerBenefitsCost: 0,
    employeeCount: 0,
  };

  // Build employee query
  const statusFilter = (filters.status || 'active') as 'active' | 'on_boarding' | 'on_leave' | 'probation' | 'resigned' | 'terminated';
  
  let employeeQuery = supabase
    .from('employees')
    .select(`
      id, employee_code, first_name, last_name, salary, nationality,
      gosi_registered_salary, is_subject_to_gosi, salary_currency_code, department_id,
      department:departments!employees_department_id_fkey(name),
      position:positions!employees_position_id_fkey(title),
      work_location:work_locations!employees_work_location_id_fkey(id, currency, gosi_enabled, gosi_nationality_rates)
    `)
    .eq('status', statusFilter);

  // Apply location filter
  if (filters.locationId) {
    employeeQuery = employeeQuery.eq('work_location_id', filters.locationId);
  }

  // Apply department filter
  if (filters.departmentId) {
    employeeQuery = employeeQuery.eq('department_id', filters.departmentId);
  }

  const { data: employees, error: empError } = await employeeQuery;

  if (empError) throw empError;
  if (!employees || employees.length === 0) {
    return { records: [], summary: emptySummary };
  }

  const employeeIds = employees.map(e => e.id);

  // Apply role-based filtering
  let filteredEmployees = employees as EmployeeWithDetails[];
  if (!isHrAdmin && isManager && effectiveEmployeeId) {
    filteredEmployees = filteredEmployees.filter(e => teamMemberIds.includes(e.id));
  }

  if (filteredEmployees.length === 0) {
    return { records: [], summary: emptySummary };
  }

  const filteredIds = filteredEmployees.map(e => e.id);

  // Fetch allowances for filtered employees
  const { data: allowances, error: allowError } = await supabase
    .from('employee_allowances')
    .select(`
      employee_id,
      custom_amount,
      custom_name,
      allowance_template:allowance_templates(name, amount, amount_type, percentage_of)
    `)
    .in('employee_id', filteredIds);

  if (allowError) throw allowError;

  // Fetch active benefit enrollments WITH dependent count
  const { data: benefitEnrollments, error: benefitError } = await supabase
    .from('benefit_enrollments')
    .select(`
      employee_id, 
      employer_contribution,
      benefit_beneficiaries(id)
    `)
    .in('employee_id', filteredIds)
    .eq('status', 'active');

  if (benefitError) throw benefitError;

  // Build maps
  const allowanceMap = new Map<string, Array<{ name: string; amount: number }>>();
  (allowances || []).forEach(a => {
    const empId = a.employee_id;
    if (!allowanceMap.has(empId)) {
      allowanceMap.set(empId, []);
    }
    const list = allowanceMap.get(empId)!;
    
    if (a.custom_amount && a.custom_amount > 0) {
      list.push({ name: a.custom_name || 'Custom Allowance', amount: a.custom_amount });
    } else if (a.allowance_template) {
      const template = a.allowance_template as { name: string; amount: number; amount_type: string; percentage_of: string | null };
      // Note: For percentage-based, we'll calculate in the record loop when we have base salary
      list.push({
        name: template.name,
        amount: template.amount_type === 'fixed' ? template.amount : -1, // -1 = percentage, handle later
        // Store metadata for percentage calculation
        ...(template.amount_type === 'percentage' ? { _percentage: template.amount, _of: template.percentage_of } : {}),
      });
    }
  });

  // Build benefits map - include cost for employee + dependents
  const benefitsMap = new Map<string, number>();
  (benefitEnrollments || []).forEach(be => {
    const current = benefitsMap.get(be.employee_id) || 0;
    const dependentCount = Array.isArray(be.benefit_beneficiaries) 
      ? be.benefit_beneficiaries.length 
      : 0;
    const totalPersons = 1 + dependentCount; // Employee + dependents
    const totalEmployerCost = be.employer_contribution * totalPersons;
    benefitsMap.set(be.employee_id, current + totalEmployerCost);
  });

  // Build CTC records
  const records: CTCRecord[] = filteredEmployees.map((emp) => {
    const baseSalary = emp.salary || 0;
    const currency = emp.salary_currency_code || emp.work_location?.currency || 'BHD';

    // Calculate allowances
    const rawAllowances = allowanceMap.get(emp.id) || [];
    const allowancesBreakdown: AllowanceBreakdownItem[] = rawAllowances.map(a => {
      if ((a as unknown as { _percentage?: number })._percentage !== undefined) {
        const pct = (a as unknown as { _percentage: number })._percentage;
        const of = (a as unknown as { _of?: string })._of;
        if (of === 'base_salary') {
          return { name: a.name, amount: (baseSalary * pct) / 100 };
        }
        return { name: a.name, amount: 0 };
      }
      return { name: a.name, amount: a.amount };
    }).filter(a => a.amount > 0);

    const allowancesTotal = allowancesBreakdown.reduce((sum, a) => sum + a.amount, 0);
    const grossPay = baseSalary + allowancesTotal;

    // Calculate employer GOSI using work location rates
    let employerGosi = 0;
    const workLocation = emp.work_location;
    if (emp.is_subject_to_gosi && workLocation?.gosi_enabled) {
      const gosiBase = emp.gosi_registered_salary || baseSalary;
      const rates = workLocation.gosi_nationality_rates || [];
      const nationalityCode = getCountryCodeByName(emp.nationality || '');
      const matchingRate = rates.find(r => r.nationality === nationalityCode);
      
      if (matchingRate) {
        employerGosi = (gosiBase * (matchingRate.employerRate ?? 0)) / 100;
      }
    }

    // Get employer benefits cost
    const employerBenefitsCost = benefitsMap.get(emp.id) || 0;

    // Calculate CTC
    const ctcMonthly = grossPay + employerGosi + employerBenefitsCost;
    const ctcYearly = ctcMonthly * 12;

    // Convert to BHD if needed
    let convertedBaseSalary = baseSalary;
    let convertedGrossPay = grossPay;
    let convertedEmployerGosi = employerGosi;
    let convertedCtcMonthly = ctcMonthly;
    let convertedCtcYearly = ctcYearly;
    let wasConverted = false;
    let conversionInfo: CTCRecord['conversionInfo'] = undefined;

    if (currency !== 'BHD' && fxRateMap.size > 0) {
      const conversion = convertToBaseCurrency(grossPay, currency, fxRateMap);
      if (conversion) {
        const rate = conversion.rate;
        convertedBaseSalary = baseSalary / rate;
        convertedGrossPay = grossPay / rate;
        convertedEmployerGosi = employerGosi / rate;
        convertedCtcMonthly = ctcMonthly / rate;
        convertedCtcYearly = ctcYearly / rate;
        wasConverted = true;
        conversionInfo = {
          rate,
          effectiveDate: conversion.effectiveDate,
          fromCurrency: currency,
        };
        // Convert allowances
        allowancesBreakdown.forEach(a => {
          a.amount = a.amount / rate;
        });
      }
    }

    const allowancesTotalConverted = allowancesBreakdown.reduce((sum, a) => sum + a.amount, 0);

    return {
      employeeId: emp.id,
      employeeCode: emp.employee_code || '',
      employeeName: `${emp.first_name} ${emp.last_name}`,
      department: emp.department?.name || '',
      position: emp.position?.title || '',
      originalCurrency: currency,
      basicSalary: convertedBaseSalary,
      allowancesTotal: allowancesTotalConverted,
      allowancesBreakdown,
      grossPay: convertedGrossPay,
      employerGosi: convertedEmployerGosi,
      employerBenefitsCost,
      ctcMonthly: convertedCtcMonthly,
      ctcYearly: convertedCtcYearly,
      wasConverted,
      conversionInfo,
    };
  });

  // Calculate summary
  const summary: CTCSummary = {
    totalCtcMonthly: records.reduce((sum, r) => sum + r.ctcMonthly, 0),
    totalCtcYearly: records.reduce((sum, r) => sum + r.ctcYearly, 0),
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
