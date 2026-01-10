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
  salary_currency_code: string | null;
  is_subject_to_gosi: boolean | null;
}

interface WorkLocationGosi {
  id: string;
  name: string;
  currency: string | null;
  gosi_enabled: boolean | null;
  gosi_nationality_rates: GosiNationalityRate[] | null;
  gosi_base_calculation: string | null;
}

// Normalize nationality for matching (handles both full names and codes)
function normalizeNationality(nationality: string): string[] {
  const normalized = nationality.toLowerCase().trim();
  
  // Map of country codes to full names (and vice versa)
  const countryMap: Record<string, string[]> = {
    'bh': ['bh', 'bahrain', 'bahraini'],
    'sa': ['sa', 'saudi arabia', 'saudi', 'ksa'],
    'ae': ['ae', 'uae', 'united arab emirates', 'emirati'],
    'kw': ['kw', 'kuwait', 'kuwaiti'],
    'om': ['om', 'oman', 'omani'],
    'qa': ['qa', 'qatar', 'qatari'],
    'in': ['in', 'india', 'indian'],
    'pk': ['pk', 'pakistan', 'pakistani'],
    'ph': ['ph', 'philippines', 'filipino', 'filipina'],
    'eg': ['eg', 'egypt', 'egyptian'],
    'jo': ['jo', 'jordan', 'jordanian'],
    'lb': ['lb', 'lebanon', 'lebanese'],
    'sy': ['sy', 'syria', 'syrian'],
    'ye': ['ye', 'yemen', 'yemeni'],
    'bd': ['bd', 'bangladesh', 'bangladeshi'],
    'np': ['np', 'nepal', 'nepali', 'nepalese'],
    'lk': ['lk', 'sri lanka', 'sri lankan'],
  };
  
  // Return all possible matches for this nationality
  for (const [, variants] of Object.entries(countryMap)) {
    if (variants.includes(normalized)) {
      return variants;
    }
  }
  
  return [normalized];
}

async function fetchGosiContributions(filters: ReportFilters): Promise<GosiContributionRecord[]> {
  // Fetch employees subject to GOSI
  const { data: employees, error: empError } = await supabase
    .from('employees')
    .select('id, first_name, last_name, employee_code, nationality, work_location_id, gosi_registered_salary, salary, salary_currency_code, is_subject_to_gosi')
    .eq('status', 'active');
  
  if (empError) throw empError;
  
  // Fetch work locations with GOSI settings
  const { data: locations, error: locError } = await supabase
    .from('work_locations')
    .select('id, name, currency, gosi_enabled, gosi_nationality_rates, gosi_base_calculation');
  
  if (locError) throw locError;
  
  const locationMap = new Map<string, WorkLocationGosi>();
  (locations || []).forEach(loc => {
    locationMap.set(loc.id, {
      id: loc.id,
      name: loc.name,
      currency: loc.currency,
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
    
    // Get currency from employee or location
    const currencyCode = emp.salary_currency_code || location?.currency || 'BHD';
    
    // Find matching nationality rate
    let employeeRate = 0;
    let employerRate = 0;
    
    if (location?.gosi_nationality_rates && emp.nationality) {
      const nationalityVariants = normalizeNationality(emp.nationality);
      
      const matchingRate = location.gosi_nationality_rates.find(r => {
        const rateNationalityVariants = normalizeNationality(r.nationality);
        // Check if any variant matches
        return nationalityVariants.some(v => rateNationalityVariants.includes(v));
      });
      
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
      currencyCode,
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
