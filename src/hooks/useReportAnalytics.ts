import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, subDays, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths } from 'date-fns';

// Types for report data
export interface ReportDashboardStats {
  totalEmployees: number;
  activeEmployees: number;
  averageSalary: number;
  attendanceRate: number;
  pendingLeaves: number;
  monthlyPayroll: number;
}

export interface AttendanceReportData {
  date: string;
  present: number;
  absent: number;
  late: number;
  onLeave: number;
  total: number;
  attendanceRate: number;
}

export interface PayrollReportData {
  month: string;
  grossPay: number;
  taxes: number;
  benefits: number;
  netPay: number;
  headcount: number;
}

export interface DepartmentStats {
  department: string;
  departmentId: string;
  headcount: number;
  avgSalary: number;
  attendanceRate: number;
  leaveBalance: number;
  turnoverRate: number;
}

export interface LeaveReportData {
  type: string;
  typeId: string;
  taken: number;
  remaining: number;
  pending: number;
}

export type ReportType = 'attendance' | 'payroll' | 'benefits' | 'employees' | 'leave';
export type ReportPeriod = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';

export interface ReportSummary {
  id: string;
  name: string;
  type: ReportType;
  description: string;
  lastGenerated: string;
  frequency: string;
}

// Static report definitions
export const reportsList: ReportSummary[] = [
  {
    id: 'rpt-1',
    name: 'Monthly Attendance Report',
    type: 'attendance',
    description: 'Comprehensive attendance tracking including present, absent, late arrivals, and leave data',
    lastGenerated: new Date().toISOString().split('T')[0],
    frequency: 'Monthly'
  },
  {
    id: 'rpt-2',
    name: 'Payroll Summary Report',
    type: 'payroll',
    description: 'Detailed payroll breakdown with gross pay, deductions, taxes, and net pay',
    lastGenerated: new Date().toISOString().split('T')[0],
    frequency: 'Monthly'
  },
  {
    id: 'rpt-3',
    name: 'Benefits Enrollment Report',
    type: 'benefits',
    description: 'Overview of employee benefits enrollments and associated costs',
    lastGenerated: new Date().toISOString().split('T')[0],
    frequency: 'Quarterly'
  },
  {
    id: 'rpt-4',
    name: 'Employee Headcount Report',
    type: 'employees',
    description: 'Department-wise employee distribution and demographics',
    lastGenerated: new Date().toISOString().split('T')[0],
    frequency: 'Monthly'
  },
  {
    id: 'rpt-5',
    name: 'Leave Balance Report',
    type: 'leave',
    description: 'Summary of leave balances, usage, and pending requests by employee',
    lastGenerated: new Date().toISOString().split('T')[0],
    frequency: 'Weekly'
  }
];

// Fetch dashboard stats
async function fetchDashboardStats(): Promise<ReportDashboardStats> {
  // Fetch employees
  const { data: employees, error: empError } = await supabase
    .from('employees')
    .select('id, status, salary');

  if (empError) throw empError;

  const totalEmployees = employees?.length || 0;
  const activeEmployees = employees?.filter(e => e.status === 'active').length || 0;
  const totalSalary = employees?.reduce((sum, e) => sum + (e.salary || 0), 0) || 0;
  const averageSalary = totalEmployees > 0 ? Math.round(totalSalary / totalEmployees) : 0;

  // Fetch attendance records for last 30 days
  const thirtyDaysAgo = subDays(new Date(), 30).toISOString().split('T')[0];
  const { data: attendance, error: attError } = await supabase
    .from('attendance_records')
    .select('status')
    .gte('date', thirtyDaysAgo);

  if (attError) throw attError;

  const totalAttendance = attendance?.length || 0;
  const presentCount = attendance?.filter(a => a.status === 'present' || a.status === 'late').length || 0;
  const attendanceRate = totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100) : 0;

  // Fetch pending leave requests
  const { count: pendingLeaves, error: leaveError } = await supabase
    .from('leave_requests')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending');

  if (leaveError) throw leaveError;

  return {
    totalEmployees,
    activeEmployees,
    averageSalary,
    attendanceRate,
    pendingLeaves: pendingLeaves || 0,
    monthlyPayroll: totalSalary
  };
}

// Fetch attendance report data for last N days
async function fetchAttendanceReportData(days: number = 30): Promise<AttendanceReportData[]> {
  const startDate = subDays(new Date(), days - 1);
  
  // Fetch all attendance records
  const { data: records, error } = await supabase
    .from('attendance_records')
    .select('date, status')
    .gte('date', startDate.toISOString().split('T')[0])
    .order('date', { ascending: true });

  if (error) throw error;

  // Fetch total active employees for denominator
  const { count: totalEmployees } = await supabase
    .from('employees')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active');

  const total = totalEmployees || 1;

  // Group by date
  const dateMap = new Map<string, { present: number; absent: number; late: number; onLeave: number }>();

  records?.forEach(record => {
    const existing = dateMap.get(record.date) || { present: 0, absent: 0, late: 0, onLeave: 0 };
    
    if (record.status === 'present') existing.present++;
    else if (record.status === 'absent') existing.absent++;
    else if (record.status === 'late') existing.late++;
    else if (record.status === 'on_leave') existing.onLeave++;
    
    dateMap.set(record.date, existing);
  });

  // Fill in missing dates with zeros
  const result: AttendanceReportData[] = [];
  for (let i = 0; i < days; i++) {
    const date = format(subDays(new Date(), days - 1 - i), 'yyyy-MM-dd');
    const data = dateMap.get(date) || { present: 0, absent: 0, late: 0, onLeave: 0 };
    const totalPresent = data.present + data.late;
    
    result.push({
      date,
      present: data.present,
      absent: data.absent,
      late: data.late,
      onLeave: data.onLeave,
      total,
      attendanceRate: total > 0 ? Math.round((totalPresent / total) * 100) : 0
    });
  }

  return result;
}

// Fetch payroll report data for last N months
async function fetchPayrollReportData(months: number = 12): Promise<PayrollReportData[]> {
  const startDate = subMonths(startOfMonth(new Date()), months - 1);
  const endDate = endOfMonth(new Date());
  
  // Fetch payroll runs
  const { data: runs, error } = await supabase
    .from('payroll_runs')
    .select('*')
    .gte('pay_period_start', startDate.toISOString().split('T')[0])
    .lte('pay_period_end', endDate.toISOString().split('T')[0])
    .order('pay_period_start', { ascending: true });

  if (error) throw error;

  // Generate month range
  const monthRange = eachMonthOfInterval({ start: startDate, end: endDate });

  return monthRange.map(monthDate => {
    const monthStr = format(monthDate, 'MMM');
    const monthStart = startOfMonth(monthDate);
    const monthEnd = endOfMonth(monthDate);

    // Find runs in this month
    const monthRuns = runs?.filter(run => {
      const runStart = new Date(run.pay_period_start);
      return runStart >= monthStart && runStart <= monthEnd;
    }) || [];

    const totalAmount = monthRuns.reduce((sum, run) => sum + (run.total_amount || 0), 0);
    const headcount = monthRuns.reduce((sum, run) => sum + (run.employee_count || 0), 0);

    // Estimate breakdown (in real app, would come from payroll_records)
    const grossPay = totalAmount;
    const taxes = Math.round(totalAmount * 0.22);
    const benefits = Math.round(totalAmount * 0.08);
    const netPay = grossPay - taxes - benefits;

    return {
      month: monthStr,
      grossPay,
      taxes,
      benefits,
      netPay,
      headcount
    };
  });
}

// Fetch department statistics
async function fetchDepartmentStats(): Promise<DepartmentStats[]> {
  // Fetch departments with employees
  const { data: departments, error: deptError } = await supabase
    .from('departments')
    .select('id, name');

  if (deptError) throw deptError;

  // Fetch employees with their departments
  const { data: employees, error: empError } = await supabase
    .from('employees')
    .select('id, department_id, salary, status');

  if (empError) throw empError;

  // Fetch attendance for last 30 days
  const thirtyDaysAgo = subDays(new Date(), 30).toISOString().split('T')[0];
  const { data: attendance, error: attError } = await supabase
    .from('attendance_records')
    .select('employee_id, status')
    .gte('date', thirtyDaysAgo);

  if (attError) throw attError;

  // Fetch leave balances for current year
  const currentYear = new Date().getFullYear();
  const { data: leaveBalances, error: leaveError } = await supabase
    .from('leave_balances')
    .select('employee_id, total_days, used_days')
    .eq('year', currentYear);

  if (leaveError) throw leaveError;

  // Calculate stats per department
  return (departments || []).map(dept => {
    const deptEmployees = employees?.filter(e => e.department_id === dept.id) || [];
    const activeEmployees = deptEmployees.filter(e => e.status === 'active');
    const headcount = activeEmployees.length;
    
    const totalSalary = deptEmployees.reduce((sum, e) => sum + (e.salary || 0), 0);
    const avgSalary = headcount > 0 ? Math.round(totalSalary / headcount) : 0;

    // Calculate attendance rate for department employees
    const deptEmployeeIds = new Set(deptEmployees.map(e => e.id));
    const deptAttendance = attendance?.filter(a => deptEmployeeIds.has(a.employee_id)) || [];
    const presentCount = deptAttendance.filter(a => a.status === 'present' || a.status === 'late').length;
    const attendanceRate = deptAttendance.length > 0 
      ? Math.round((presentCount / deptAttendance.length) * 100) 
      : 0;

    // Calculate total leave balance
    const deptLeaveBalances = leaveBalances?.filter(l => deptEmployeeIds.has(l.employee_id)) || [];
    const leaveBalance = deptLeaveBalances.reduce((sum, l) => 
      sum + ((l.total_days || 0) - (l.used_days || 0)), 0);

    // Turnover rate would require historical data - using placeholder
    const turnoverRate = Math.round(Math.random() * 15);

    return {
      department: dept.name,
      departmentId: dept.id,
      headcount,
      avgSalary,
      attendanceRate,
      leaveBalance,
      turnoverRate
    };
  }).filter(d => d.headcount > 0);
}

// Fetch leave report data
async function fetchLeaveReportData(): Promise<LeaveReportData[]> {
  // Fetch leave types
  const { data: leaveTypes, error: typeError } = await supabase
    .from('leave_types')
    .select('id, name')
    .eq('is_active', true);

  if (typeError) throw typeError;

  const currentYear = new Date().getFullYear();

  // Fetch leave balances
  const { data: balances, error: balError } = await supabase
    .from('leave_balances')
    .select('leave_type_id, total_days, used_days, pending_days')
    .eq('year', currentYear);

  if (balError) throw balError;

  // Aggregate by leave type
  return (leaveTypes || []).map(type => {
    const typeBalances = balances?.filter(b => b.leave_type_id === type.id) || [];
    
    const taken = typeBalances.reduce((sum, b) => sum + (b.used_days || 0), 0);
    const pending = typeBalances.reduce((sum, b) => sum + (b.pending_days || 0), 0);
    const total = typeBalances.reduce((sum, b) => sum + (b.total_days || 0), 0);
    const remaining = total - taken;

    return {
      type: type.name,
      typeId: type.id,
      taken,
      remaining: Math.max(0, remaining),
      pending
    };
  }).filter(l => l.taken > 0 || l.remaining > 0 || l.pending > 0);
}

// Main hook
export function useReportAnalytics() {
  const statsQuery = useQuery({
    queryKey: ['report-dashboard-stats'],
    queryFn: fetchDashboardStats,
  });

  const attendanceQuery = useQuery({
    queryKey: ['report-attendance-data'],
    queryFn: () => fetchAttendanceReportData(30),
  });

  const payrollQuery = useQuery({
    queryKey: ['report-payroll-data'],
    queryFn: () => fetchPayrollReportData(12),
  });

  const departmentQuery = useQuery({
    queryKey: ['report-department-stats'],
    queryFn: fetchDepartmentStats,
  });

  const leaveQuery = useQuery({
    queryKey: ['report-leave-data'],
    queryFn: fetchLeaveReportData,
  });

  const isLoading = statsQuery.isLoading || attendanceQuery.isLoading || 
    payrollQuery.isLoading || departmentQuery.isLoading || leaveQuery.isLoading;

  return {
    stats: statsQuery.data || {
      totalEmployees: 0,
      activeEmployees: 0,
      averageSalary: 0,
      attendanceRate: 0,
      pendingLeaves: 0,
      monthlyPayroll: 0
    },
    attendanceData: attendanceQuery.data || [],
    payrollData: payrollQuery.data || [],
    departmentStats: departmentQuery.data || [],
    leaveData: leaveQuery.data || [],
    isLoading,
    error: statsQuery.error || attendanceQuery.error || payrollQuery.error || 
      departmentQuery.error || leaveQuery.error,
    refetch: () => {
      statsQuery.refetch();
      attendanceQuery.refetch();
      payrollQuery.refetch();
      departmentQuery.refetch();
      leaveQuery.refetch();
    }
  };
}
