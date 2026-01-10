import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ReportFilters, SalaryDistributionRecord, SalaryChangeRecord } from '@/types/reports';

interface EmployeeWithSalary {
  id: string;
  salary: number | null;
  department_id: string | null;
  work_location_id: string | null;
  departments: { name: string } | null;
  work_locations: { name: string } | null;
}

interface SalaryHistoryRecord {
  id: string;
  employee_id: string;
  previous_salary: number | null;
  new_salary: number | null;
  change_type: string;
  effective_date: string;
  changed_by: string | null;
  reason: string | null;
  employees: {
    first_name: string;
    last_name: string;
    employee_code: string | null;
    departments: { name: string } | null;
  } | null;
}

function calculateMedian(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

async function fetchSalaryDistribution(filters: ReportFilters): Promise<SalaryDistributionRecord[]> {
  const { data: employees, error } = await supabase
    .from('employees')
    .select(`
      id,
      salary,
      department_id,
      work_location_id,
      departments (name),
      work_locations:work_location_id (name)
    `)
    .eq('status', 'active');
  
  if (error) throw error;
  
  // Group by department
  const deptMap = new Map<string, { dept: string; location: string; salaries: number[] }>();
  
  (employees || []).forEach((emp: EmployeeWithSalary) => {
    if (!emp.salary) return;
    
    const deptName = emp.departments?.name || 'Unassigned';
    const locName = emp.work_locations?.name || 'No Location';
    const key = `${deptName}|${locName}`;
    
    if (!deptMap.has(key)) {
      deptMap.set(key, { dept: deptName, location: locName, salaries: [] });
    }
    deptMap.get(key)!.salaries.push(emp.salary);
  });
  
  // Apply filters
  let results = Array.from(deptMap.values());
  
  if (filters.departmentId) {
    const { data: dept } = await supabase
      .from('departments')
      .select('name')
      .eq('id', filters.departmentId)
      .single();
    if (dept) {
      results = results.filter(r => r.dept === dept.name);
    }
  }
  
  if (filters.locationId) {
    const { data: loc } = await supabase
      .from('work_locations')
      .select('name')
      .eq('id', filters.locationId)
      .single();
    if (loc) {
      results = results.filter(r => r.location === loc.name);
    }
  }
  
  return results.map(({ dept, location, salaries }) => ({
    department: dept,
    location,
    employeeCount: salaries.length,
    minSalary: Math.min(...salaries),
    maxSalary: Math.max(...salaries),
    avgSalary: Math.round(salaries.reduce((a, b) => a + b, 0) / salaries.length),
    medianSalary: calculateMedian(salaries),
    totalSalary: salaries.reduce((a, b) => a + b, 0),
  }));
}

async function fetchSalaryChangeHistory(filters: ReportFilters): Promise<SalaryChangeRecord[]> {
  const { data, error } = await supabase
    .from('salary_history')
    .select(`
      id,
      employee_id,
      previous_salary,
      new_salary,
      change_type,
      effective_date,
      changed_by,
      reason,
      employees (
        first_name,
        last_name,
        employee_code,
        departments (name)
      )
    `)
    .order('effective_date', { ascending: false });
  
  if (error) throw error;
  
  let records = data || [];
  
  // Apply date filter
  if (filters.dateRange) {
    records = records.filter(r => 
      r.effective_date >= filters.dateRange!.start && 
      r.effective_date <= filters.dateRange!.end
    );
  }
  
  // Fetch changed_by names
  const changerIds = [...new Set(records.map(r => r.changed_by).filter(Boolean))];
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, first_name, last_name')
    .in('id', changerIds);
  
  const profileMap = new Map((profiles || []).map(p => [p.id, `${p.first_name || ''} ${p.last_name || ''}`.trim()]));
  
  return records.map((r: SalaryHistoryRecord) => {
    const prevSalary = r.previous_salary || 0;
    const newSalary = r.new_salary || 0;
    const changeAmount = newSalary - prevSalary;
    const changePercentage = prevSalary > 0 ? (changeAmount / prevSalary) * 100 : 0;
    
    return {
      employeeId: r.employee_id,
      employeeCode: r.employees?.employee_code || '',
      employeeName: r.employees ? `${r.employees.first_name} ${r.employees.last_name}` : 'Unknown',
      department: r.employees?.departments?.name || 'Unassigned',
      effectiveDate: r.effective_date,
      previousSalary: prevSalary,
      newSalary: newSalary,
      changeAmount,
      changePercentage: Math.round(changePercentage * 100) / 100,
      changeType: r.change_type || 'adjustment',
      changedBy: r.changed_by ? profileMap.get(r.changed_by) || 'System' : 'System',
    };
  });
}

export function useSalaryDistribution(filters: ReportFilters) {
  return useQuery({
    queryKey: ['report-salary-distribution', filters],
    queryFn: () => fetchSalaryDistribution(filters),
  });
}

export function useSalaryChangeHistory(filters: ReportFilters) {
  return useQuery({
    queryKey: ['report-salary-change-history', filters],
    queryFn: () => fetchSalaryChangeHistory(filters),
  });
}
