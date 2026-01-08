import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
  otherAllowances: unknown[];
  gosiDeduction: number;
  otherDeductions: unknown[];
  grossPay: number;
  totalDeductions: number;
  netPay: number;
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
        otherAllowances: (row.other_allowances as unknown[]) || [],
        gosiDeduction: Number(row.gosi_deduction) || 0,
        otherDeductions: (row.other_deductions as unknown[]) || [],
        grossPay: Number(row.gross_pay) || 0,
        totalDeductions: Number(row.total_deductions) || 0,
        netPay: Number(row.net_pay) || 0,
      }));
    },
    enabled: !!runId,
  });

  const snapshotEmployees = async (employeeIds: string[]) => {
    if (!runId || employeeIds.length === 0) return;

    // Fetch employee data
    const { data: employees, error: empError } = await supabase
      .from("employees")
      .select(`
        id, first_name, last_name, employee_code, salary,
        department:departments(name),
        position:positions(title)
      `)
      .in("id", employeeIds);

    if (empError) throw empError;

    // Create snapshots
    const snapshots = (employees || []).map((emp) => ({
      payroll_run_id: runId,
      employee_id: emp.id,
      employee_name: `${emp.first_name} ${emp.last_name}`,
      employee_code: emp.employee_code,
      department: (emp.department as { name: string } | null)?.name || null,
      position: (emp.position as { title: string } | null)?.title || null,
      base_salary: emp.salary || 0,
      gross_pay: emp.salary || 0,
      net_pay: emp.salary || 0,
    }));

    const { error } = await supabase
      .from("payroll_run_employees")
      .upsert(snapshots, { onConflict: "payroll_run_id,employee_id" });

    if (error) throw error;

    queryClient.invalidateQueries({ queryKey: ["payroll-run-employees", runId] });
  };

  return { ...query, snapshotEmployees };
}
