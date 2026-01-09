import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PayslipCard } from "@/components/payroll";
import { PayrollRecord } from "@/data/payroll";
import { supabase } from "@/integrations/supabase/client";

export default function Payslip() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: record, isLoading } = useQuery({
    queryKey: ["payslip", id],
    queryFn: async () => {
      if (!id) return null;

      // Fetch the payroll run employee record
      const { data, error } = await supabase
        .from("payroll_run_employees")
        .select(`
          id,
          employee_id,
          employee_name,
          employee_code,
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
          net_pay,
          payroll_run:payroll_runs!payroll_run_employees_payroll_run_id_fkey(
            pay_period_start,
            pay_period_end,
            status
          )
        `)
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      // Fetch employee avatar
      const { data: employee } = await supabase
        .from("employees")
        .select("avatar_url")
        .eq("id", data.employee_id)
        .maybeSingle();

      const nameParts = data.employee_name?.split(" ") || ["Unknown"];
      const firstName = nameParts[0] || "Unknown";
      const lastName = nameParts.slice(1).join(" ") || "";

      const otherAllowances = (data.other_allowances as { name: string; amount: number }[]) || [];
      const bonusesTotal = otherAllowances.reduce((sum, a) => sum + (a.amount || 0), 0) +
        Number(data.housing_allowance || 0) + Number(data.transportation_allowance || 0);

      const otherDeductions = (data.other_deductions as { name: string; amount: number }[]) || [];
      const otherDeductionsTotal = otherDeductions.reduce((sum, d) => sum + (d.amount || 0), 0);

      const payrollRun = data.payroll_run as { pay_period_start: string; pay_period_end: string; status: string } | null;

      const record: PayrollRecord = {
        id: data.id,
        employeeId: data.employee_id,
        employee: {
          id: data.employee_id,
          firstName,
          lastName,
          department: data.department || "Unassigned",
          position: data.position || "Unknown",
          avatar: employee?.avatar_url || undefined,
          employeeCode: data.employee_code || undefined,
        },
        payPeriod: {
          startDate: payrollRun?.pay_period_start || "",
          endDate: payrollRun?.pay_period_end || "",
        },
        baseSalary: Number(data.base_salary) || 0,
        overtime: 0,
        bonuses: bonusesTotal,
        deductions: {
          tax: 0,
          insurance: Number(data.gosi_deduction) || 0,
          other: otherDeductionsTotal,
        },
        netPay: Number(data.net_pay) || 0,
        status: payrollRun?.status === 'completed' || payrollRun?.status === 'payslips_issued' ? 'paid' : 'pending',
        paidDate: payrollRun?.pay_period_end || undefined,
      };

      return record;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <div className="p-6 lg:p-8 space-y-6">
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-10" />
              <div>
                <Skeleton className="h-8 w-48 mb-2" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
            <Skeleton className="h-[500px] max-w-2xl mx-auto" />
          </div>
        </main>
      </div>
    );
  }

  if (!record) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-foreground mb-2">Payslip not found</h2>
            <p className="text-muted-foreground mb-4">The requested payslip could not be found.</p>
            <Button onClick={() => navigate("/payroll")}>Back to Payroll</Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-6 lg:p-8 space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/payroll")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Payslip</h1>
              <p className="text-muted-foreground">
                {record.employee.firstName} {record.employee.lastName} - {record.id.slice(0, 8)}
              </p>
            </div>
          </div>

          {/* Payslip Card */}
          <PayslipCard record={record} />
        </div>
      </main>
    </div>
  );
}
