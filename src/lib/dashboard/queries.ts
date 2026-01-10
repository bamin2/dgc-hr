/**
 * Shared Dashboard Supabase Queries
 * Reusable query builders for dashboard data
 */

import { supabase } from '@/integrations/supabase/client';

/**
 * Fetch company settings (payroll day, etc.)
 */
export async function fetchCompanySettings() {
  return supabase
    .from('company_settings')
    .select('payroll_day_of_month')
    .limit(1)
    .single();
}

/**
 * Fetch HQ location for currency
 */
export async function fetchHQCurrency() {
  return supabase
    .from('work_locations')
    .select('currency')
    .eq('is_hq', true)
    .limit(1)
    .single();
}

/**
 * Fetch pending leave requests count
 */
export async function fetchPendingLeaveRequests(employeeIds?: string[]) {
  let query = supabase
    .from('leave_requests')
    .select('id')
    .eq('status', 'pending');
  
  if (employeeIds && employeeIds.length > 0) {
    query = query.in('employee_id', employeeIds);
  }
  
  return query;
}

/**
 * Fetch upcoming time off with employee details
 */
export async function fetchUpcomingTimeOff(
  todayStr: string,
  limit: number = 10,
  employeeIds?: string[]
) {
  let query = supabase
    .from('leave_requests')
    .select(`
      id, start_date, end_date, days_count,
      employee:employees!leave_requests_employee_id_fkey (id, first_name, last_name),
      leave_type:leave_types (id, name)
    `)
    .eq('status', 'approved')
    .gte('start_date', todayStr)
    .order('start_date', { ascending: true })
    .limit(limit);
  
  if (employeeIds && employeeIds.length > 0) {
    query = query.in('employee_id', employeeIds);
  }
  
  return query;
}

/**
 * Fetch active loans with installments
 */
export async function fetchActiveLoans(employeeId?: string) {
  let query = supabase
    .from('loans')
    .select(`
      id, principal_amount, status,
      loan_installments (due_date, amount, status)
    `)
    .in('status', ['active', 'approved']);
  
  if (employeeId) {
    query = query.eq('employee_id', employeeId);
  }
  
  return query;
}

/**
 * Fetch all employees for org stats
 */
export async function fetchAllEmployees() {
  return supabase
    .from('employees')
    .select('id, status');
}

/**
 * Fetch last completed payroll run
 */
export async function fetchLastPayrollRun() {
  return supabase
    .from('payroll_runs')
    .select('processed_date, total_amount, pay_period_end')
    .eq('status', 'completed')
    .order('processed_date', { ascending: false })
    .limit(1);
}

/**
 * Fetch pending loan requests count
 */
export async function fetchPendingLoanRequests() {
  return supabase
    .from('loans')
    .select('id')
    .eq('status', 'requested');
}

/**
 * Fetch leave requests by date range
 */
export async function fetchLeaveRequestsByDateRange(
  startDate: string,
  endDate?: string
) {
  let query = supabase
    .from('leave_requests')
    .select('id')
    .eq('status', 'approved')
    .gte('start_date', startDate);
  
  if (endDate) {
    query = query.lte('start_date', endDate);
  }
  
  return query;
}

/**
 * Fetch employee leave balances for current year
 */
export async function fetchEmployeeLeaveBalances(employeeId: string, year: number) {
  return supabase
    .from('leave_balances')
    .select(`
      *,
      leave_type:leave_types!inner (id, name, color, visible_to_employees)
    `)
    .eq('employee_id', employeeId)
    .eq('year', year)
    .eq('leave_type.visible_to_employees', true);
}

/**
 * Fetch employee leave requests for year
 */
export async function fetchEmployeeLeaveRequests(employeeId: string, year: number) {
  return supabase
    .from('leave_requests')
    .select(`
      id, status, start_date, end_date, days_count, reason,
      leave_type:leave_types (name)
    `)
    .eq('employee_id', employeeId)
    .gte('start_date', `${year}-01-01`);
}

/**
 * Fetch employee with work location (for currency)
 */
export async function fetchEmployeeWithLocation(employeeId: string) {
  return supabase
    .from('employees')
    .select('work_location:work_locations(currency)')
    .eq('id', employeeId)
    .single();
}

/**
 * Fetch user profile to get employee ID
 */
export async function fetchUserProfile(userId: string) {
  return supabase
    .from('profiles')
    .select('employee_id')
    .eq('id', userId)
    .single();
}
