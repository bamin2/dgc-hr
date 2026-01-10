import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ReportFilters, LeaveBalanceRecord, LeaveRequestRecord } from '@/types/reports';
import { format } from 'date-fns';

interface LeaveBalanceRow {
  id: string;
  employee_id: string;
  leave_type_id: string;
  total_days: number;
  used_days: number | null;
  pending_days: number | null;
  year: number;
  employees: {
    first_name: string;
    last_name: string;
    employee_code: string | null;
    departments: { name: string } | null;
  } | null;
  leave_types: { name: string } | null;
}

interface LeaveRequestRow {
  id: string;
  employee_id: string;
  leave_type_id: string;
  start_date: string;
  end_date: string;
  days_count: number;
  status: string;
  reason: string | null;
  created_at: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  employees: {
    first_name: string;
    last_name: string;
    employee_code: string | null;
    departments: { name: string } | null;
  } | null;
  leave_types: { name: string } | null;
}

async function fetchLeaveBalances(filters: ReportFilters): Promise<LeaveBalanceRecord[]> {
  const year = filters.year || new Date().getFullYear();
  
  const { data, error } = await supabase
    .from('leave_balances')
    .select(`
      id,
      employee_id,
      leave_type_id,
      total_days,
      used_days,
      pending_days,
      year,
      employees (
        first_name,
        last_name,
        employee_code,
        departments!department_id (name)
      ),
      leave_types (name)
    `)
    .eq('year', year);
  
  if (error) throw error;
  
  let records = data || [];
  
  // Apply employee filter
  if (filters.employeeId) {
    records = records.filter(r => r.employee_id === filters.employeeId);
  }
  
  // Apply department filter
  if (filters.departmentId) {
    const { data: dept } = await supabase
      .from('departments')
      .select('name')
      .eq('id', filters.departmentId)
      .single();
    if (dept) {
      records = records.filter((r: LeaveBalanceRow) => r.employees?.departments?.name === dept.name);
    }
  }
  
  return records.map((r: LeaveBalanceRow) => {
    const entitled = r.total_days || 0;
    const taken = r.used_days || 0;
    const pending = r.pending_days || 0;
    
    return {
      employeeId: r.employee_id,
      employeeCode: r.employees?.employee_code || '',
      employeeName: r.employees ? `${r.employees.first_name} ${r.employees.last_name}` : 'Unknown',
      department: r.employees?.departments?.name || 'Unassigned',
      leaveType: r.leave_types?.name || 'Unknown',
      entitledDays: entitled,
      takenDays: taken,
      pendingDays: pending,
      remainingDays: entitled - taken - pending,
    };
  });
}

async function fetchLeaveRequests(filters: ReportFilters): Promise<LeaveRequestRecord[]> {
  const { data, error } = await supabase
    .from('leave_requests')
    .select(`
      id,
      employee_id,
      leave_type_id,
      start_date,
      end_date,
      days_count,
      status,
      reason,
      created_at,
      reviewed_by,
      reviewed_at
    `)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  
  // Fetch employee info separately
  const empIds = [...new Set((data || []).map(r => r.employee_id))];
  const { data: employees } = await supabase
    .from('employees')
    .select('id, first_name, last_name, employee_code, departments(name)')
    .in('id', empIds);
  
  const empMap = new Map((employees || []).map(e => [e.id, e]));
  
  // Fetch leave types
  const typeIds = [...new Set((data || []).map(r => r.leave_type_id))];
  const { data: leaveTypes } = await supabase
    .from('leave_types')
    .select('id, name')
    .in('id', typeIds);
  
  const typeMap = new Map((leaveTypes || []).map(t => [t.id, t.name]));
  
  let records = data || [];
  
  // Apply date filter
  if (filters.dateRange) {
    records = records.filter(r => 
      r.start_date >= filters.dateRange!.start && 
      r.start_date <= filters.dateRange!.end
    );
  }
  
  // Apply status filter
  if (filters.status) {
    records = records.filter(r => r.status === filters.status);
  }
  
  // Apply employee filter
  if (filters.employeeId) {
    records = records.filter(r => r.employee_id === filters.employeeId);
  }
  
  // Fetch approval steps for each request
  const requestIds = records.map(r => r.id);
  const { data: approvalSteps } = await supabase
    .from('request_approval_steps')
    .select('*')
    .eq('request_type', 'leave')
    .in('request_id', requestIds);
  
  const stepsMap = new Map<string, { manager?: string; hr?: string }>();
  (approvalSteps || []).forEach(step => {
    if (!stepsMap.has(step.request_id)) {
      stepsMap.set(step.request_id, {});
    }
    const entry = stepsMap.get(step.request_id)!;
    if (step.approver_type === 'manager') {
      entry.manager = step.status;
    } else if (step.approver_type === 'hr') {
      entry.hr = step.status;
    }
  });
  
  return records.map(r => {
    const approvals = stepsMap.get(r.id) || {};
    const emp = empMap.get(r.employee_id);
    
    return {
      requestId: r.id,
      employeeId: r.employee_id,
      employeeCode: emp?.employee_code || '',
      employeeName: emp ? `${emp.first_name} ${emp.last_name}` : 'Unknown',
      department: (emp?.departments as { name: string } | null)?.name || 'Unassigned',
      leaveType: typeMap.get(r.leave_type_id) || 'Unknown',
      startDate: r.start_date,
      endDate: r.end_date,
      daysCount: r.days_count,
      status: r.status,
      managerApproval: approvals.manager || 'N/A',
      hrApproval: approvals.hr || 'N/A',
      finalOutcome: r.status,
      submittedDate: r.created_at ? format(new Date(r.created_at), 'yyyy-MM-dd') : '',
    };
  });
}

export function useLeaveBalanceReport(filters: ReportFilters) {
  return useQuery({
    queryKey: ['report-leave-balance', filters],
    queryFn: () => fetchLeaveBalances(filters),
  });
}

export function useLeaveRequestsReport(filters: ReportFilters) {
  return useQuery({
    queryKey: ['report-leave-requests', filters],
    queryFn: () => fetchLeaveRequests(filters),
  });
}
