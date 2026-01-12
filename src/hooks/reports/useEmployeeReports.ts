import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ReportFilters, EmployeeMasterRecord } from '@/types/reports';

interface EmployeeRow {
  id: string;
  employee_code: string | null;
  first_name: string;
  last_name: string;
  email: string;
  employment_type: string | null;
  worker_type: string | null;
  nationality: string | null;
  join_date: string | null;
  status: string;
  manager_id: string | null;
  departments: { name: string } | null;
  positions: { title: string } | null;
  work_locations: { name: string } | null;
}

async function fetchEmployeeMaster(filters: ReportFilters): Promise<EmployeeMasterRecord[]> {
  const { data: employees, error } = await supabase
    .from('employees')
    .select(`
      id,
      employee_code,
      first_name,
      last_name,
      email,
      employment_type,
      worker_type,
      nationality,
      join_date,
      status,
      manager_id,
      departments!department_id (name),
      positions (title),
      work_locations:work_location_id (name)
    `)
    .order('first_name');
  
  if (error) throw error;
  
  let records = employees || [];
  
  // Apply join date filter - exclude employees who joined after the report date range
  if (filters.dateRange) {
    records = records.filter(e => !e.join_date || e.join_date <= filters.dateRange!.end);
  }
  
  // Apply status filter
  if (filters.status) {
    records = records.filter(e => e.status === filters.status);
  }
  
  // Apply department filter
  if (filters.departmentId) {
    const { data: dept } = await supabase
      .from('departments')
      .select('name')
      .eq('id', filters.departmentId)
      .single();
    if (dept) {
      records = records.filter((e: EmployeeRow) => e.departments?.name === dept.name);
    }
  }
  
  // Apply location filter
  if (filters.locationId) {
    const { data: loc } = await supabase
      .from('work_locations')
      .select('name')
      .eq('id', filters.locationId)
      .single();
    if (loc) {
      records = records.filter((e: EmployeeRow) => e.work_locations?.name === loc.name);
    }
  }
  
  // Fetch manager names
  const managerIds = [...new Set(records.map(e => e.manager_id).filter(Boolean))];
  const { data: managers } = await supabase
    .from('employees')
    .select('id, first_name, last_name')
    .in('id', managerIds);
  
  const managerMap = new Map((managers || []).map(m => [m.id, `${m.first_name} ${m.last_name}`]));
  
  return records.map((e: EmployeeRow) => ({
    employeeId: e.id,
    employeeCode: e.employee_code || '',
    firstName: e.first_name,
    lastName: e.last_name,
    fullName: `${e.first_name} ${e.last_name}`,
    email: e.email,
    department: e.departments?.name || 'Unassigned',
    position: e.positions?.title || 'No Position',
    employmentType: e.employment_type || 'N/A',
    workerType: e.worker_type || 'N/A',
    location: e.work_locations?.name || 'No Location',
    nationality: e.nationality || 'N/A',
    joinDate: e.join_date || '',
    status: e.status,
    managerName: e.manager_id ? managerMap.get(e.manager_id) : undefined,
  }));
}

export function useEmployeeMasterReport(filters: ReportFilters) {
  return useQuery({
    queryKey: ['report-employee-master', filters],
    queryFn: () => fetchEmployeeMaster(filters),
  });
}
