import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SalaryStats {
  totalPayroll: number;
  averageSalary: number;
  medianSalary: number;
  minSalary: number;
  maxSalary: number;
  employeeCount: number;
}

export interface DepartmentSalary {
  department: string;
  departmentId: string;
  totalPayroll: number;
  avgSalary: number;
  headcount: number;
  minSalary: number;
  maxSalary: number;
  percentOfTotal: number;
}

export interface SalaryDistribution {
  range: string;
  count: number;
  min: number;
  max: number;
}

export interface SalaryTrend {
  month: string;
  adjustments: number;
  promotions: number;
  annualReviews: number;
  totalIncrease: number;
}

export interface ChangeTypeBreakdown {
  type: string;
  label: string;
  count: number;
  totalAmount: number;
}

export interface SalaryAnalytics {
  stats: SalaryStats;
  departmentSalaries: DepartmentSalary[];
  salaryDistribution: SalaryDistribution[];
  salaryTrends: SalaryTrend[];
  changeTypeBreakdown: ChangeTypeBreakdown[];
  isLoading: boolean;
  error: Error | null;
}

function calculateMedian(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function getSalaryRanges(salaries: number[]): SalaryDistribution[] {
  if (salaries.length === 0) return [];
  
  const ranges = [
    { range: '$0 - $40K', min: 0, max: 40000 },
    { range: '$40K - $60K', min: 40000, max: 60000 },
    { range: '$60K - $80K', min: 60000, max: 80000 },
    { range: '$80K - $100K', min: 80000, max: 100000 },
    { range: '$100K - $120K', min: 100000, max: 120000 },
    { range: '$120K - $150K', min: 120000, max: 150000 },
    { range: '$150K+', min: 150000, max: Infinity },
  ];

  return ranges.map(({ range, min, max }) => ({
    range,
    min,
    max,
    count: salaries.filter(s => s >= min && s < max).length,
  })).filter(r => r.count > 0 || r.range === '$60K - $80K'); // Always show middle ranges
}

const changeTypeLabels: Record<string, string> = {
  initial: 'Initial',
  adjustment: 'Adjustment',
  promotion: 'Promotion',
  annual_review: 'Annual Review',
  correction: 'Correction',
  bulk_update: 'Bulk Update',
};

async function fetchSalaryAnalytics(): Promise<Omit<SalaryAnalytics, 'isLoading' | 'error'>> {
  // Fetch employees with departments
  const { data: employees, error: empError } = await supabase
    .from('employees')
    .select(`
      id,
      salary,
      department_id,
      departments:department_id (
        id,
        name
      )
    `)
    .not('salary', 'is', null);

  if (empError) throw empError;

  // Fetch salary history for trends
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  
  const { data: salaryHistory, error: histError } = await supabase
    .from('salary_history')
    .select('*')
    .gte('effective_date', sixMonthsAgo.toISOString().split('T')[0])
    .order('effective_date', { ascending: true });

  if (histError) throw histError;

  // Calculate overall stats
  const salaries = employees?.map(e => e.salary as number).filter(s => s > 0) || [];
  const totalPayroll = salaries.reduce((sum, s) => sum + s, 0);
  
  const stats: SalaryStats = {
    totalPayroll,
    averageSalary: salaries.length > 0 ? totalPayroll / salaries.length : 0,
    medianSalary: calculateMedian(salaries),
    minSalary: salaries.length > 0 ? Math.min(...salaries) : 0,
    maxSalary: salaries.length > 0 ? Math.max(...salaries) : 0,
    employeeCount: salaries.length,
  };

  // Calculate department salaries
  const deptMap = new Map<string, { name: string; salaries: number[] }>();
  
  employees?.forEach(emp => {
    const dept = emp.departments as { id: string; name: string } | null;
    if (dept && emp.salary) {
      const existing = deptMap.get(dept.id) || { name: dept.name, salaries: [] };
      existing.salaries.push(emp.salary as number);
      deptMap.set(dept.id, existing);
    }
  });

  const departmentSalaries: DepartmentSalary[] = Array.from(deptMap.entries())
    .map(([id, { name, salaries: deptSalaries }]) => {
      const deptTotal = deptSalaries.reduce((sum, s) => sum + s, 0);
      return {
        department: name,
        departmentId: id,
        totalPayroll: deptTotal,
        avgSalary: deptSalaries.length > 0 ? deptTotal / deptSalaries.length : 0,
        headcount: deptSalaries.length,
        minSalary: deptSalaries.length > 0 ? Math.min(...deptSalaries) : 0,
        maxSalary: deptSalaries.length > 0 ? Math.max(...deptSalaries) : 0,
        percentOfTotal: totalPayroll > 0 ? (deptTotal / totalPayroll) * 100 : 0,
      };
    })
    .sort((a, b) => b.totalPayroll - a.totalPayroll);

  // Calculate salary distribution
  const salaryDistribution = getSalaryRanges(salaries);

  // Calculate salary trends by month
  const trendMap = new Map<string, SalaryTrend>();
  
  salaryHistory?.forEach(record => {
    const date = new Date(record.effective_date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const monthLabel = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    
    const existing = trendMap.get(monthKey) || {
      month: monthLabel,
      adjustments: 0,
      promotions: 0,
      annualReviews: 0,
      totalIncrease: 0,
    };
    
    const increase = (record.new_salary || 0) - (record.previous_salary || 0);
    existing.totalIncrease += Math.max(0, increase);
    
    if (record.change_type === 'promotion') existing.promotions++;
    else if (record.change_type === 'annual_review') existing.annualReviews++;
    else if (record.change_type === 'adjustment' || record.change_type === 'bulk_update') existing.adjustments++;
    
    trendMap.set(monthKey, existing);
  });

  const salaryTrends = Array.from(trendMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, trend]) => trend);

  // Calculate change type breakdown
  const typeMap = new Map<string, { count: number; totalAmount: number }>();
  
  salaryHistory?.forEach(record => {
    const type = record.change_type;
    const existing = typeMap.get(type) || { count: 0, totalAmount: 0 };
    existing.count++;
    existing.totalAmount += Math.max(0, (record.new_salary || 0) - (record.previous_salary || 0));
    typeMap.set(type, existing);
  });

  const changeTypeBreakdown: ChangeTypeBreakdown[] = Array.from(typeMap.entries())
    .map(([type, data]) => ({
      type,
      label: changeTypeLabels[type] || type,
      count: data.count,
      totalAmount: data.totalAmount,
    }))
    .sort((a, b) => b.count - a.count);

  return {
    stats,
    departmentSalaries,
    salaryDistribution,
    salaryTrends,
    changeTypeBreakdown,
  };
}

export function useSalaryAnalytics() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['salary-analytics'],
    queryFn: fetchSalaryAnalytics,
  });

  return {
    stats: data?.stats || {
      totalPayroll: 0,
      averageSalary: 0,
      medianSalary: 0,
      minSalary: 0,
      maxSalary: 0,
      employeeCount: 0,
    },
    departmentSalaries: data?.departmentSalaries || [],
    salaryDistribution: data?.salaryDistribution || [],
    salaryTrends: data?.salaryTrends || [],
    changeTypeBreakdown: data?.changeTypeBreakdown || [],
    isLoading,
    error: error as Error | null,
  };
}
