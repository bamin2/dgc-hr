/**
 * Salary Calculation Utilities
 * Functions to calculate Total Gross Pay (basic + allowances) for employees
 */

import { supabase } from '@/integrations/supabase/client';

export interface EmployeeGrossPay {
  employeeId: string;
  basicSalary: number;
  totalAllowances: number;
  grossPay: number;
  currencyCode: string;
}

export interface AllowanceDetail {
  name: string;
  amount: number;
  isPercentage: boolean;
}

interface EmployeeAllowanceRecord {
  id: string;
  employee_id: string;
  custom_amount: number | null;
  custom_name: string | null;
  percentage: number | null;
  effective_date: string | null;
  end_date: string | null;
  allowance_template_id: string | null;
  allowance_templates: {
    name: string;
    amount: number;
    amount_type: string;
    percentage_of: string | null;
  } | null;
}

/**
 * Calculate the total allowances for an employee
 */
export function calculateAllowanceAmount(
  allowance: EmployeeAllowanceRecord,
  basicSalary: number
): number {
  // Use custom amount if set
  if (allowance.custom_amount !== null && allowance.custom_amount > 0) {
    return allowance.custom_amount;
  }

  // Use percentage of basic salary if set
  if (allowance.percentage !== null && allowance.percentage > 0) {
    return (allowance.percentage / 100) * basicSalary;
  }

  // Use template values
  if (allowance.allowance_templates) {
    const template = allowance.allowance_templates;
    if (template.amount_type === 'percentage' && template.percentage_of === 'base_salary') {
      return (template.amount / 100) * basicSalary;
    }
    return template.amount;
  }

  return 0;
}

/**
 * Check if an allowance is active on a given date
 */
export function isAllowanceActive(
  allowance: EmployeeAllowanceRecord,
  asOfDate: Date
): boolean {
  const effectiveDate = allowance.effective_date 
    ? new Date(allowance.effective_date) 
    : new Date(0);
  
  const endDate = allowance.end_date 
    ? new Date(allowance.end_date) 
    : null;

  return asOfDate >= effectiveDate && (endDate === null || asOfDate <= endDate);
}

/**
 * Calculate gross pay for a single employee
 */
export async function calculateEmployeeGrossPay(
  employeeId: string,
  asOfDate: Date = new Date()
): Promise<EmployeeGrossPay | null> {
  // Fetch employee basic salary and currency
  const { data: employee, error: empError } = await supabase
    .from('employees')
    .select(`
      id,
      salary,
      salary_currency_code,
      work_locations!work_location_id (currency)
    `)
    .eq('id', employeeId)
    .single();

  if (empError || !employee) return null;

  const basicSalary = employee.salary || 0;
  const currencyCode = employee.salary_currency_code || 
    (employee.work_locations as any)?.currency || 
    'BHD';

  // Fetch active allowances
  const { data: allowances, error: allowError } = await supabase
    .from('employee_allowances')
    .select(`
      id,
      employee_id,
      custom_amount,
      custom_name,
      percentage,
      effective_date,
      end_date,
      allowance_template_id,
      allowance_templates (
        name,
        amount,
        amount_type,
        percentage_of
      )
    `)
    .eq('employee_id', employeeId);

  if (allowError) {
    console.error('Error fetching allowances:', allowError);
    return {
      employeeId,
      basicSalary,
      totalAllowances: 0,
      grossPay: basicSalary,
      currencyCode,
    };
  }

  // Filter active allowances and calculate total
  const activeAllowances = (allowances || []).filter(a => 
    isAllowanceActive(a as EmployeeAllowanceRecord, asOfDate)
  );

  const totalAllowances = activeAllowances.reduce((sum, allowance) => {
    return sum + calculateAllowanceAmount(allowance as EmployeeAllowanceRecord, basicSalary);
  }, 0);

  return {
    employeeId,
    basicSalary,
    totalAllowances,
    grossPay: basicSalary + totalAllowances,
    currencyCode,
  };
}

/**
 * Calculate gross pay for all active employees
 */
export async function calculateAllEmployeesGrossPay(
  asOfDate: Date = new Date()
): Promise<EmployeeGrossPay[]> {
  // Fetch all active employees with their salaries and currencies
  const { data: employees, error: empError } = await supabase
    .from('employees')
    .select(`
      id,
      salary,
      salary_currency_code,
      work_locations!work_location_id (currency)
    `)
    .eq('status', 'active');

  if (empError || !employees) {
    console.error('Error fetching employees:', empError);
    return [];
  }

  // Fetch all allowances in one query for efficiency
  const employeeIds = employees.map(e => e.id);
  const { data: allAllowances, error: allowError } = await supabase
    .from('employee_allowances')
    .select(`
      id,
      employee_id,
      custom_amount,
      custom_name,
      percentage,
      effective_date,
      end_date,
      allowance_template_id,
      allowance_templates (
        name,
        amount,
        amount_type,
        percentage_of
      )
    `)
    .in('employee_id', employeeIds);

  if (allowError) {
    console.error('Error fetching allowances:', allowError);
  }

  // Group allowances by employee
  const allowancesByEmployee = new Map<string, EmployeeAllowanceRecord[]>();
  (allAllowances || []).forEach(a => {
    const list = allowancesByEmployee.get(a.employee_id) || [];
    list.push(a as EmployeeAllowanceRecord);
    allowancesByEmployee.set(a.employee_id, list);
  });

  // Calculate gross pay for each employee
  return employees.map(emp => {
    const basicSalary = emp.salary || 0;
    const currencyCode = emp.salary_currency_code || 
      (emp.work_locations as any)?.currency || 
      'BHD';

    const employeeAllowances = allowancesByEmployee.get(emp.id) || [];
    const activeAllowances = employeeAllowances.filter(a => 
      isAllowanceActive(a, asOfDate)
    );

    const totalAllowances = activeAllowances.reduce((sum, allowance) => {
      return sum + calculateAllowanceAmount(allowance, basicSalary);
    }, 0);

    return {
      employeeId: emp.id,
      basicSalary,
      totalAllowances,
      grossPay: basicSalary + totalAllowances,
      currencyCode,
    };
  });
}

/**
 * Format currency with the correct symbol based on currency code
 */
export function formatCurrencyWithCode(amount: number | null | undefined, currencyCode: string): string {
  const symbols: Record<string, string> = {
    'BHD': 'BD',
    'SAR': 'SAR',
    'AED': 'AED',
    'KWD': 'KWD',
    'OMR': 'OMR',
    'QAR': 'QAR',
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
  };

  const symbol = symbols[currencyCode] || currencyCode;
  
  // Handle null/undefined amounts
  const safeAmount = amount ?? 0;
  
  // Format number with appropriate decimals
  const decimals = ['BHD', 'KWD', 'OMR'].includes(currencyCode) ? 3 : 2;
  const formatted = safeAmount.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return `${symbol} ${formatted}`;
}

/**
 * Get the currency symbol for a currency code
 */
export function getCurrencySymbol(currencyCode: string): string {
  const symbols: Record<string, string> = {
    'BHD': 'BD',
    'SAR': 'SAR',
    'AED': 'AED',
    'KWD': 'KWD',
    'OMR': 'OMR',
    'QAR': 'QAR',
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
  };
  return symbols[currencyCode] || currencyCode;
}
