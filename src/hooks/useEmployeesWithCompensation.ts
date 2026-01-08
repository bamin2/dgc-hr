import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { getCountryCodeByName } from '@/data/countries';

export interface EmployeeCompensationPreview {
  id: string;
  firstName: string;
  lastName: string;
  avatar: string | null;
  position: string | null;
  department: string | null;
  workLocationId: string | null;
  status: string;
  baseSalary: number;
  totalAllowances: number;
  totalDeductions: number;
  gosiDeduction: number;
  netSalary: number;
}

export function useEmployeesWithCompensation(locationId?: string) {
  return useQuery({
    queryKey: ['employees-with-compensation', locationId],
    queryFn: async () => {
      // Fetch employees with related data
      const { data: employees, error: empError } = await supabase
        .from('employees')
        .select(`
          id, first_name, last_name, avatar_url, status, salary, nationality,
          gosi_registered_salary, is_subject_to_gosi, work_location_id,
          department:departments!employees_department_id_fkey(name),
          position:positions!employees_position_id_fkey(title),
          work_location:work_locations!employees_work_location_id_fkey(id, gosi_enabled, gosi_nationality_rates)
        `)
        .eq('status', 'active');

      if (empError) throw empError;
      if (!employees || employees.length === 0) return [];

      const employeeIds = employees.map(e => e.id);

      // Fetch allowances for all employees
      const { data: allowances, error: allowError } = await supabase
        .from('employee_allowances')
        .select(`
          employee_id,
          custom_amount,
          allowance_template:allowance_templates(amount, amount_type, percentage_of)
        `)
        .in('employee_id', employeeIds);

      if (allowError) throw allowError;

      // Fetch deductions for all employees
      const { data: deductions, error: dedError } = await supabase
        .from('employee_deductions')
        .select(`
          employee_id,
          custom_amount,
          deduction_template:deduction_templates(amount, amount_type, percentage_of)
        `)
        .in('employee_id', employeeIds);

      if (dedError) throw dedError;

      // Calculate compensation for each employee
      const result: EmployeeCompensationPreview[] = employees
        .filter(emp => !locationId || emp.work_location_id === locationId)
        .map(emp => {
          const baseSalary = emp.salary || 0;
          
          // Calculate total allowances
          const empAllowances = (allowances || []).filter(a => a.employee_id === emp.id);
          let totalAllowances = 0;
          empAllowances.forEach(a => {
            if (a.custom_amount) {
              totalAllowances += a.custom_amount;
            } else if (a.allowance_template) {
              const template = a.allowance_template as any;
              if (template.amount_type === 'percentage' && template.percentage_of === 'base_salary') {
                totalAllowances += (baseSalary * template.amount) / 100;
              } else {
                totalAllowances += template.amount || 0;
              }
            }
          });

          // Calculate GOSI deduction
          let gosiDeduction = 0;
          const workLocation = emp.work_location as any;
          if (emp.is_subject_to_gosi && workLocation?.gosi_enabled) {
            const gosiBase = emp.gosi_registered_salary || baseSalary;
            const rates = (workLocation.gosi_nationality_rates || []) as Array<{nationality: string; percentage: number}>;
            const nationalityCode = getCountryCodeByName(emp.nationality || '');
            const matchingRate = rates.find(r => r.nationality === nationalityCode);
            
            if (matchingRate) {
              gosiDeduction = (gosiBase * matchingRate.percentage) / 100;
            }
          }

          // Calculate other deductions
          const empDeductions = (deductions || []).filter(d => d.employee_id === emp.id);
          let totalDeductions = 0;
          empDeductions.forEach(d => {
            if (d.custom_amount) {
              totalDeductions += d.custom_amount;
            } else if (d.deduction_template) {
              const template = d.deduction_template as any;
              if (template.amount_type === 'percentage' && template.percentage_of === 'base_salary') {
                totalDeductions += (baseSalary * template.amount) / 100;
              } else {
                totalDeductions += template.amount || 0;
              }
            }
          });

          const netSalary = baseSalary + totalAllowances - gosiDeduction - totalDeductions;

          return {
            id: emp.id,
            firstName: emp.first_name,
            lastName: emp.last_name,
            avatar: emp.avatar_url,
            position: (emp.position as any)?.title || null,
            department: (emp.department as any)?.name || null,
            workLocationId: emp.work_location_id,
            status: emp.status,
            baseSalary,
            totalAllowances,
            totalDeductions,
            gosiDeduction,
            netSalary,
          };
        });

      return result;
    },
  });
}
