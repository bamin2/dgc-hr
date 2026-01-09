import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getCountryCodeByName } from "@/data/countries";
import type {
  PayrollRunEmployee,
  AllowanceTemplate,
  DeductionTemplate,
  EmployeeAllowanceRow,
  EmployeeDeductionRow,
} from "@/types/payroll-run";

// Re-export types for backward compatibility
export type { PayrollRunEmployee };

export function usePayrollRunEmployees(runId: string | null) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["payroll-run-employees", runId],
    queryFn: async () => {
      if (!runId) return [];

      const { data, error } = await supabase
        .from("payroll_run_employees")
        .select("*")
        .eq("payroll_run_id", runId);

      if (error) throw error;

      return (data || []).map((row): PayrollRunEmployee => ({
        id: row.id,
        employeeId: row.employee_id,
        employeeName: row.employee_name,
        employeeCode: row.employee_code,
        department: row.department,
        position: row.position,
        baseSalary: Number(row.base_salary) || 0,
        housingAllowance: Number(row.housing_allowance) || 0,
        transportationAllowance: Number(row.transportation_allowance) || 0,
        otherAllowances: (row.other_allowances as { name: string; amount: number }[]) || [],
        gosiDeduction: Number(row.gosi_deduction) || 0,
        otherDeductions: (row.other_deductions as { name: string; amount: number }[]) || [],
        grossPay: Number(row.gross_pay) || 0,
        totalDeductions: Number(row.total_deductions) || 0,
        netPay: Number(row.net_pay) || 0,
      }));
    },
    enabled: !!runId,
  });

  const snapshotEmployees = async (payrollRunId: string, employeeIds: string[]) => {
    if (!payrollRunId || employeeIds.length === 0) {
      throw new Error("Payroll run ID and employee IDs are required");
    }

    const { data: employees, error: empError } = await supabase
      .from("employees")
      .select(
        `
        id, first_name, last_name, employee_code, salary, nationality,
        gosi_registered_salary, is_subject_to_gosi,
        department:departments!employees_department_id_fkey(name),
        position:positions!employees_position_id_fkey(title),
        work_location:work_locations!employees_work_location_id_fkey(id, gosi_enabled, gosi_nationality_rates, gosi_base_calculation)
      `
      )
      .in("id", employeeIds);

    if (empError) {
      console.error("snapshotEmployees: employees query failed", {
        payrollRunId,
        employeeIdsCount: employeeIds.length,
        empError,
      });
      throw empError;
    }

    if (!employees || employees.length === 0) {
      throw new Error("No employees found for the selected IDs");
    }

    const { data: allAllowances, error: allowError } = await supabase
      .from("employee_allowances")
      .select(
        `
        id, employee_id, allowance_template_id, custom_name, custom_amount, percentage,
        allowance_template:allowance_templates(id, name, amount, amount_type, percentage_of, is_taxable)
      `
      )
      .in("employee_id", employeeIds);

    if (allowError) {
      console.error("snapshotEmployees: allowances query failed", {
        payrollRunId,
        employeeIdsCount: employeeIds.length,
        allowError,
      });
      throw allowError;
    }

    const { data: allDeductions, error: deductError } = await supabase
      .from("employee_deductions")
      .select(
        `
        id, employee_id, deduction_template_id, custom_name, custom_amount,
        deduction_template:deduction_templates(id, name, amount, amount_type, percentage_of)
      `
      )
      .in("employee_id", employeeIds);

    if (deductError) {
      console.error("snapshotEmployees: deductions query failed", {
        payrollRunId,
        employeeIdsCount: employeeIds.length,
        deductError,
      });
      throw deductError;
    }

    const snapshots = (employees || []).map((emp) => {
      const baseSalary = emp.salary || 0;
      const empAllowances = (allAllowances || []).filter(
        a => a.employee_id === emp.id
      ) as EmployeeAllowanceRow[];
      const empDeductions = (allDeductions || []).filter(
        d => d.employee_id === emp.id
      ) as EmployeeDeductionRow[];

      let housingAllowance = 0;
      let transportationAllowance = 0;
      const otherAllowances: { name: string; amount: number }[] = [];

      empAllowances.forEach((allowance) => {
        let amount = 0;
        const name = allowance.custom_name || allowance.allowance_template?.name || "Unknown";

        if (allowance.custom_amount !== null) {
          amount = allowance.custom_amount;
        } else if (allowance.allowance_template) {
          const template = allowance.allowance_template;
          if (template.amount_type === "percentage" && template.percentage_of === "base_salary") {
            amount = baseSalary * (template.amount / 100);
          } else {
            amount = template.amount;
          }
        }

        const lowerName = name.toLowerCase();
        if (lowerName.includes("housing")) {
          housingAllowance += amount;
        } else if (lowerName.includes("transport")) {
          transportationAllowance += amount;
        } else {
          otherAllowances.push({ name, amount });
        }
      });

      let gosiDeduction = 0;
      const workLocation = emp.work_location as { 
        id: string; 
        gosi_enabled: boolean | null; 
        gosi_nationality_rates: Array<{nationality: string; percentage: number}> | null;
        gosi_base_calculation: string | null;
      } | null;
      
      if (emp.is_subject_to_gosi && workLocation?.gosi_enabled) {
        let gosiBase: number;
        if (workLocation.gosi_base_calculation === 'basic_plus_housing') {
          gosiBase = baseSalary + housingAllowance;
        } else {
          gosiBase = emp.gosi_registered_salary || baseSalary;
        }
        
        const rates = workLocation.gosi_nationality_rates || [];
        const nationalityCode = getCountryCodeByName(emp.nationality || "");
        const matchingRate = rates.find(r => 
          r.nationality === nationalityCode || r.nationality === emp.nationality
        );
        
        if (matchingRate) {
          gosiDeduction = (gosiBase * matchingRate.percentage) / 100;
        } else if (rates.length > 0) {
          console.warn(`GOSI: No matching rate for nationality "${emp.nationality}" (code: ${nationalityCode}) in location ${workLocation.id}`);
        }
      }

      const otherDeductions: { name: string; amount: number }[] = [];
      empDeductions.forEach((deduction) => {
        let amount = 0;
        const name = deduction.custom_name || deduction.deduction_template?.name || "Unknown";

        if (deduction.custom_amount !== null) {
          amount = deduction.custom_amount;
        } else if (deduction.deduction_template) {
          const template = deduction.deduction_template;
          if (template.amount_type === "percentage" && template.percentage_of === "base_salary") {
            amount = baseSalary * (template.amount / 100);
          } else {
            amount = template.amount;
          }
        }

        otherDeductions.push({ name, amount });
      });

      const otherAllowancesTotal = otherAllowances.reduce((sum, a) => sum + a.amount, 0);
      const grossPay = baseSalary + housingAllowance + transportationAllowance + otherAllowancesTotal;
      
      const otherDeductionsTotal = otherDeductions.reduce((sum, d) => sum + d.amount, 0);
      const totalDeductions = gosiDeduction + otherDeductionsTotal;
      
      const netPay = grossPay - totalDeductions;

      return {
        payroll_run_id: payrollRunId,
        employee_id: emp.id,
        employee_name: `${emp.first_name} ${emp.last_name}`,
        employee_code: emp.employee_code,
        department: (emp.department as { name: string } | null)?.name || null,
        position: (emp.position as { title: string } | null)?.title || null,
        base_salary: baseSalary,
        housing_allowance: housingAllowance,
        transportation_allowance: transportationAllowance,
        other_allowances: otherAllowances,
        gosi_deduction: gosiDeduction,
        other_deductions: otherDeductions,
        gross_pay: grossPay,
        total_deductions: totalDeductions,
        net_pay: netPay,
      };
    });

    const { error } = await supabase
      .from("payroll_run_employees")
      .upsert(snapshots, { onConflict: "payroll_run_id,employee_id" });

    if (error) {
      console.error("snapshotEmployees: upsert failed", {
        payrollRunId,
        employeeIdsCount: employeeIds.length,
        snapshotsCount: snapshots.length,
        error,
      });
      throw error;
    }

    queryClient.invalidateQueries({ queryKey: ["payroll-run-employees", payrollRunId] });
  };

  return { ...query, snapshotEmployees };
}
