import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PayrollRunEmployee {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string | null;
  department: string | null;
  position: string | null;
  baseSalary: number;
  housingAllowance: number;
  transportationAllowance: number;
  otherAllowances: { name: string; amount: number }[];
  gosiDeduction: number;
  otherDeductions: { name: string; amount: number }[];
  grossPay: number;
  totalDeductions: number;
  netPay: number;
}

interface AllowanceTemplate {
  id: string;
  name: string;
  amount: number;
  amount_type: string;
  percentage_of: string | null;
  is_taxable: boolean | null;
}

interface DeductionTemplate {
  id: string;
  name: string;
  amount: number;
  amount_type: string;
  percentage_of: string | null;
}

interface EmployeeAllowanceRow {
  id: string;
  employee_id: string;
  allowance_template_id: string | null;
  custom_name: string | null;
  custom_amount: number | null;
  percentage: number | null;
  allowance_template: AllowanceTemplate | null;
}

interface EmployeeDeductionRow {
  id: string;
  employee_id: string;
  deduction_template_id: string | null;
  custom_name: string | null;
  custom_amount: number | null;
  deduction_template: DeductionTemplate | null;
}

interface GosiNationalityRates {
  saudi?: number;
  non_saudi?: number;
  [key: string]: number | undefined;
}

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

    // Fetch employee data with work location for GOSI settings
    const { data: employees, error: empError } = await supabase
      .from("employees")
      .select(`
        id, first_name, last_name, employee_code, salary, nationality,
        gosi_registered_salary, is_subject_to_gosi,
        department:departments(name),
        position:positions(title),
        work_location:work_locations(id, gosi_enabled, gosi_nationality_rates)
      `)
      .in("id", employeeIds);

    if (empError) throw empError;

    // Fetch all allowances for selected employees
    const { data: allAllowances, error: allowError } = await supabase
      .from("employee_allowances")
      .select(`
        id, employee_id, allowance_template_id, custom_name, custom_amount, percentage,
        allowance_template:allowance_templates(id, name, amount, amount_type, percentage_of, is_taxable)
      `)
      .in("employee_id", employeeIds);

    if (allowError) throw allowError;

    // Fetch all deductions for selected employees
    const { data: allDeductions, error: deductError } = await supabase
      .from("employee_deductions")
      .select(`
        id, employee_id, deduction_template_id, custom_name, custom_amount,
        deduction_template:deduction_templates(id, name, amount, amount_type, percentage_of)
      `)
      .in("employee_id", employeeIds);

    if (deductError) throw deductError;

    // Create snapshots with full calculations
    const snapshots = (employees || []).map((emp) => {
      const baseSalary = emp.salary || 0;
      const empAllowances = (allAllowances || []).filter(
        a => a.employee_id === emp.id
      ) as EmployeeAllowanceRow[];
      const empDeductions = (allDeductions || []).filter(
        d => d.employee_id === emp.id
      ) as EmployeeDeductionRow[];

      // Calculate allowances
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

        // Check if it's housing or transportation
        const lowerName = name.toLowerCase();
        if (lowerName.includes("housing")) {
          housingAllowance += amount;
        } else if (lowerName.includes("transport")) {
          transportationAllowance += amount;
        } else {
          otherAllowances.push({ name, amount });
        }
      });

      // Calculate GOSI deduction
      let gosiDeduction = 0;
      const workLocation = emp.work_location as { id: string; gosi_enabled: boolean | null; gosi_nationality_rates: GosiNationalityRates | null } | null;
      
      if (emp.is_subject_to_gosi && workLocation?.gosi_enabled) {
        const gosiBase = emp.gosi_registered_salary || baseSalary;
        const rates = workLocation.gosi_nationality_rates || {};
        const nationality = emp.nationality?.toLowerCase() || "";
        
        // Get rate based on nationality (Saudi vs non-Saudi)
        let rate = 0;
        if (nationality.includes("saudi") && !nationality.includes("non")) {
          rate = rates.saudi || 0.1; // 10% default for Saudi
        } else {
          rate = rates.non_saudi || 0.02; // 2% default for non-Saudi
        }
        
        gosiDeduction = gosiBase * rate;
      }

      // Calculate other deductions
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

      // Calculate totals
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
      console.error("Snapshot upsert error:", error);
      throw error;
    }

    queryClient.invalidateQueries({ queryKey: ["payroll-run-employees", payrollRunId] });
  };

  return { ...query, snapshotEmployees };
}
