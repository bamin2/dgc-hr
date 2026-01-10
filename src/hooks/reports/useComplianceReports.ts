import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ReportFilters, GosiContributionRecord } from '@/types/reports';
import { GosiNationalityRate } from '@/hooks/useWorkLocations';

interface EmployeeGosi {
  id: string;
  first_name: string;
  last_name: string;
  employee_code: string | null;
  nationality: string | null;
  work_location_id: string | null;
  gosi_registered_salary: number | null;
  salary: number | null;
  is_subject_to_gosi: boolean | null;
}

interface WorkLocationGosi {
  id: string;
  name: string;
  gosi_enabled: boolean | null;
  gosi_nationality_rates: GosiNationalityRate[] | null;
  gosi_base_calculation: string | null;
}

async function fetchGosiContributions(filters: ReportFilters): Promise<GosiContributionRecord[]> {
  // Fetch employees subject to GOSI
  const { data: employees, error: empError } = await supabase
    .from('employees')
    .select('id, first_name, last_name, employee_code, nationality, work_location_id, gosi_registered_salary, salary, is_subject_to_gosi')
    .eq('status', 'active');
  
  if (empError) throw empError;
  
  // Fetch work locations with GOSI settings
  const { data: locations, error: locError } = await supabase
    .from('work_locations')
    .select('id, name, gosi_enabled, gosi_nationality_rates, gosi_base_calculation');
  
  if (locError) throw locError;
  
  const locationMap = new Map<string, WorkLocationGosi>();
  (locations || []).forEach(loc => {
    locationMap.set(loc.id, {
      id: loc.id,
      name: loc.name,
      gosi_enabled: loc.gosi_enabled,
      gosi_nationality_rates: loc.gosi_nationality_rates as unknown as GosiNationalityRate[] | null,
      gosi_base_calculation: loc.gosi_base_calculation,
    });
  });
  
  let records = (employees || []).filter((e: EmployeeGosi) => e.is_subject_to_gosi);
  
  // Apply location filter
  if (filters.locationId) {
    records = records.filter(e => e.work_location_id === filters.locationId);
  }
  
  // Apply employee filter
  if (filters.employeeId) {
    records = records.filter(e => e.id === filters.employeeId);
  }
  
  return records.map((emp: EmployeeGosi) => {
    const location = emp.work_location_id ? locationMap.get(emp.work_location_id) : null;
    const gosiSalary = emp.gosi_registered_salary || emp.salary || 0;
    
    // Find matching nationality rate
    let employeeRate = 0;
    let employerRate = 0;
    
    if (location?.gosi_nationality_rates && emp.nationality) {
      const nationalityLower = emp.nationality.toLowerCase();
      const matchingRate = location.gosi_nationality_rates.find(
        r => r.nationality.toLowerCase() === nationalityLower
      );
      if (matchingRate) {
        // Handle backward compatibility
        employeeRate = matchingRate.employeeRate ?? (matchingRate as { percentage?: number }).percentage ?? 0;
        employerRate = matchingRate.employerRate ?? 0;
      }
    }
    
    const employeeContribution = (gosiSalary * employeeRate) / 100;
    const employerContribution = (gosiSalary * employerRate) / 100;
    
    return {
      employeeId: emp.id,
      employeeCode: emp.employee_code || '',
      employeeName: `${emp.first_name} ${emp.last_name}`,
      nationality: emp.nationality || 'Unknown',
      location: location?.name || 'No Location',
      gosiRegisteredSalary: gosiSalary,
      employeeRate,
      employerRate,
      employeeContribution,
      employerContribution,
      totalContribution: employeeContribution + employerContribution,
    };
  });
}

export function useGosiContributionReport(filters: ReportFilters) {
  return useQuery({
    queryKey: ['report-gosi-contribution', filters],
    queryFn: () => fetchGosiContributions(filters),
  });
}

// Calculate totals for the report
export function calculateGosiTotals(records: GosiContributionRecord[]) {
  return {
    totalGosiSalary: records.reduce((sum, r) => sum + r.gosiRegisteredSalary, 0),
    totalEmployeeContribution: records.reduce((sum, r) => sum + r.employeeContribution, 0),
    totalEmployerContribution: records.reduce((sum, r) => sum + r.employerContribution, 0),
    totalContribution: records.reduce((sum, r) => sum + r.totalContribution, 0),
    employeeCount: records.length,
  };
}
