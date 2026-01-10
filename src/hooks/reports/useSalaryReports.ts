import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ReportFilters, SalaryDistributionRecord, SalaryChangeRecord } from '@/types/reports';
import { calculateAllEmployeesGrossPay, EmployeeGrossPay } from '@/lib/salaryUtils';

interface EmployeeWithDetails {
  id: string;
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
  // Get gross pay for all employees (basic + allowances)
  const grossPayData = await calculateAllEmployeesGrossPay();
  
  // Create a map for quick lookup
  const grossPayMap = new Map<string, EmployeeGrossPay>();
  grossPayData.forEach(gp => grossPayMap.set(gp.employeeId, gp));
  
  // Fetch employee department and location info
  const { data: employees, error } = await supabase
    .from('employees')
    .select(`
      id,
      department_id,
      work_location_id,
      departments!department_id (name),
      work_locations!work_location_id (name)
    `)
    .eq('status', 'active');
  
  if (error) throw error;
  
  // Group by department + location + currency
  const groupMap = new Map<string, { 
    dept: string; 
    location: string; 
    currencyCode: string;
    grossPays: number[] 
  }>();
  
  (employees || []).forEach((emp: EmployeeWithDetails) => {
    const grossPayInfo = grossPayMap.get(emp.id);
    if (!grossPayInfo || grossPayInfo.grossPay <= 0) return;
    
    const deptName = emp.departments?.name || 'Unassigned';
    const locName = emp.work_locations?.name || 'No Location';
    const currencyCode = grossPayInfo.currencyCode;
    
    // Group by dept + location + currency to keep currencies separate
    const key = `${deptName}|${locName}|${currencyCode}`;
    
    if (!groupMap.has(key)) {
      groupMap.set(key, { 
        dept: deptName, 
        location: locName, 
        currencyCode,
        grossPays: [] 
      });
    }
    groupMap.get(key)!.grossPays.push(grossPayInfo.grossPay);
  });
  
  // Apply filters
  let results = Array.from(groupMap.values());
  
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
  
  return results.map(({ dept, location, currencyCode, grossPays }) => ({
    department: dept,
    location,
    currencyCode,
    employeeCount: grossPays.length,
    minGrossPay: Math.min(...grossPays),
    maxGrossPay: Math.max(...grossPays),
    avgGrossPay: Math.round(grossPays.reduce((a, b) => a + b, 0) / grossPays.length),
    medianGrossPay: calculateMedian(grossPays),
    totalGrossPay: grossPays.reduce((a, b) => a + b, 0),
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
        salary_currency_code,
        departments!department_id (name),
        work_locations!work_location_id (currency)
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
  
  return records.map((r) => {
    const prevSalary = r.previous_salary || 0;
    const newSalary = r.new_salary || 0;
    const changeAmount = newSalary - prevSalary;
    const changePercentage = prevSalary > 0 ? (changeAmount / prevSalary) * 100 : 0;
    
    // Get currency from employee
    const emp = r.employees as {
      first_name: string;
      last_name: string;
      employee_code: string | null;
      salary_currency_code: string | null;
      departments: { name: string } | null;
      work_locations: { currency: string } | null;
    } | null;
    
    const currencyCode = emp?.salary_currency_code || 
      emp?.work_locations?.currency || 
      'BHD';
    
    return {
      employeeId: r.employee_id,
      employeeCode: emp?.employee_code || '',
      employeeName: emp ? `${emp.first_name} ${emp.last_name}` : 'Unknown',
      department: emp?.departments?.name || 'Unassigned',
      currencyCode,
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
