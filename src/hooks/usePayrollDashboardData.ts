import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface DashboardPayrollRecord {
  id: string;
  employeeId: string;
  employee: {
    firstName: string;
    lastName: string;
    department: string;
    position: string;
    avatar?: string;
    workLocationId?: string;
  };
  payPeriod: { startDate: string; endDate: string };
  baseSalary: number;
  overtime: number;
  bonuses: number;
  deductions: { tax: number; insurance: number; other: number };
  netPay: number;
  status: 'paid' | 'pending' | 'processing';
  paidDate?: string;
}

export interface PayrollMetricsData {
  totalPayroll: number;
  employeesPaid: number;
  pendingPayments: number;
  averageSalary: number;
}

export interface DepartmentPayrollData {
  department: string;
  total: number;
  count: number;
}

export interface PayrollRunData {
  id: string;
  payPeriod: { startDate: string; endDate: string };
  totalAmount: number;
  employeeCount: number;
  status: 'completed' | 'processing' | 'scheduled' | 'draft' | 'payslips_issued';
  processedDate: string;
}

export function usePayrollDashboardData(monthFilter: string = "all") {
  // Fetch HQ location for currency and filtering
  const hqQuery = useQuery({
    queryKey: ["hq-location"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("work_locations")
        .select("id, currency")
        .eq("is_hq", true)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      return data;
    },
  });

  const hqLocationId = hqQuery.data?.id;
  const currency = hqQuery.data?.currency || "USD";

  // Fetch all payroll runs
  const runsQuery = useQuery({
    queryKey: ["payroll-dashboard-runs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payroll_runs")
        .select("*")
        .order("processed_date", { ascending: false });

      if (error) throw error;

      return (data || []).map((run): PayrollRunData => ({
        id: run.id,
        payPeriod: {
          startDate: run.pay_period_start,
          endDate: run.pay_period_end,
        },
        totalAmount: Number(run.total_amount) || 0,
        employeeCount: run.employee_count || 0,
        status: run.status as PayrollRunData['status'],
        processedDate: run.processed_date,
      }));
    },
  });

  // Filter runs by month if specified
  const filteredRuns = (runsQuery.data || []).filter(run => {
    if (monthFilter === "all") return true;
    const runMonth = new Date(run.payPeriod.startDate).getMonth() + 1;
    return runMonth === parseInt(monthFilter);
  });

  // Get the most recent run (filtered or not)
  const latestRunId = filteredRuns[0]?.id || null;

  // Fetch employee records for the latest/selected run
  const recordsQuery = useQuery({
    queryKey: ["payroll-dashboard-records", latestRunId],
    queryFn: async () => {
      if (!latestRunId) return [];

      // Get payroll run details
      const { data: runData } = await supabase
        .from("payroll_runs")
        .select("pay_period_start, pay_period_end, status")
        .eq("id", latestRunId)
        .single();

      // Get employee records with employee details
      const { data, error } = await supabase
        .from("payroll_run_employees")
        .select(`
          id,
          employee_id,
          employee_name,
          department,
          position,
          base_salary,
          housing_allowance,
          transportation_allowance,
          other_allowances,
          gosi_deduction,
          other_deductions,
          gross_pay,
          total_deductions,
          net_pay
        `)
        .eq("payroll_run_id", latestRunId);

      if (error) throw error;

      // Fetch employee details including work_location_id
      const employeeIds = (data || []).map(r => r.employee_id);
      const { data: employees } = await supabase
        .from("employees")
        .select("id, avatar_url, work_location_id")
        .in("id", employeeIds);

      const employeeMap = new Map(employees?.map(e => [e.id, { avatar: e.avatar_url, workLocationId: e.work_location_id }]) || []);

      // Map database records to dashboard format
      return (data || []).map((record): DashboardPayrollRecord => {
        const nameParts = record.employee_name?.split(" ") || ["Unknown"];
        const firstName = nameParts[0] || "Unknown";
        const lastName = nameParts.slice(1).join(" ") || "";

        // Calculate other allowances total as "bonuses" for display
        const otherAllowances = (record.other_allowances as { name: string; amount: number }[]) || [];
        const bonusesTotal = otherAllowances.reduce((sum, a) => sum + (a.amount || 0), 0);

        // Calculate other deductions
        const otherDeductions = (record.other_deductions as { name: string; amount: number }[]) || [];
        const otherDeductionsTotal = otherDeductions.reduce((sum, d) => sum + (d.amount || 0), 0);

        // Determine status based on run status
        let recordStatus: 'paid' | 'pending' | 'processing' = 'pending';
        if (runData?.status === 'completed' || runData?.status === 'payslips_issued') {
          recordStatus = 'paid';
        } else if (runData?.status === 'processing') {
          recordStatus = 'processing';
        }

        const empData = employeeMap.get(record.employee_id);
        return {
          id: record.id,
          employeeId: record.employee_id,
          employee: {
            firstName,
            lastName,
            department: record.department || "Unassigned",
            position: record.position || "Unknown",
            avatar: empData?.avatar || undefined,
            workLocationId: empData?.workLocationId || undefined,
          },
          payPeriod: {
            startDate: runData?.pay_period_start || "",
            endDate: runData?.pay_period_end || "",
          },
          baseSalary: Number(record.base_salary) || 0,
          overtime: 0, // Not tracked in payroll_run_employees currently
          bonuses: bonusesTotal + Number(record.housing_allowance || 0) + Number(record.transportation_allowance || 0),
          deductions: {
            tax: 0, // Not tracked separately
            insurance: Number(record.gosi_deduction) || 0,
            other: otherDeductionsTotal,
          },
          netPay: Number(record.net_pay) || 0,
          status: recordStatus,
          paidDate: recordStatus === 'paid' ? runData?.pay_period_end : undefined,
        };
      });
    },
    enabled: !!latestRunId,
  });

  // Calculate metrics from HQ records only
  const allRecords = recordsQuery.data || [];
  const records = hqLocationId 
    ? allRecords.filter(r => r.employee.workLocationId === hqLocationId)
    : allRecords;
  
  const metrics: PayrollMetricsData = {
    totalPayroll: records.reduce((sum, r) => sum + r.netPay, 0),
    employeesPaid: records.filter(r => r.status === 'paid').length,
    pendingPayments: records.filter(r => r.status === 'pending' || r.status === 'processing').length,
    averageSalary: records.length > 0 
      ? Math.round(records.reduce((sum, r) => sum + r.baseSalary, 0) / records.length)
      : 0,
  };

  // Calculate department breakdown for chart
  const departmentMap = new Map<string, { total: number; count: number }>();
  records.forEach(record => {
    const dept = record.employee.department;
    const existing = departmentMap.get(dept) || { total: 0, count: 0 };
    departmentMap.set(dept, {
      total: existing.total + record.netPay,
      count: existing.count + 1,
    });
  });

  const departmentData: DepartmentPayrollData[] = Array.from(departmentMap.entries()).map(
    ([department, data]) => ({
      department,
      ...data,
    })
  );

  return {
    records,
    metrics,
    departmentData,
    payrollRuns: filteredRuns,
    currency,
    isLoading: runsQuery.isLoading || recordsQuery.isLoading || hqQuery.isLoading,
    error: runsQuery.error || recordsQuery.error || hqQuery.error,
  };
}
