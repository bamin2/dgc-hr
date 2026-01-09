import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PayslipCard } from "@/components/payroll";
import { PayslipData } from "@/types/payslip";
import { supabase } from "@/integrations/supabase/client";

export default function Payslip() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: payslip, isLoading } = useQuery({
    queryKey: ["payslip", id],
    queryFn: async (): Promise<PayslipData | null> => {
      if (!id) return null;

      // Fetch the payroll run employee record with payroll run details
      const { data: record, error } = await supabase
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
      if (!record) return null;

      // Fetch employee avatar
      const { data: employee } = await supabase
        .from("employees")
        .select("avatar_url, work_location_id")
        .eq("id", record.employee_id)
        .maybeSingle();

      // Fetch company settings
      const { data: companySettings } = await supabase
        .from("company_settings")
        .select("name, legal_name, logo_url, address_city, address_country, currency")
        .limit(1)
        .maybeSingle();

      // Fetch HQ work location for currency
      const { data: hqLocation } = await supabase
        .from("work_locations")
        .select("currency")
        .eq("is_hq", true)
        .maybeSingle();

      const payrollRun = record.payroll_run as { 
        pay_period_start: string; 
        pay_period_end: string; 
        status: string 
      } | null;

      const otherAllowances = (record.other_allowances as { name: string; amount: number }[]) || [];
      const otherDeductions = (record.other_deductions as { name: string; amount: number }[]) || [];

      // Determine currency: HQ location > company settings > default
      const currency = hqLocation?.currency || companySettings?.currency || "SAR";

      // Build company address
      const addressParts = [
        companySettings?.address_city,
        companySettings?.address_country
      ].filter(Boolean);
      const companyAddress = addressParts.join(", ") || "Not specified";

      const payslipData: PayslipData = {
        id: record.id,
        employee: {
          id: record.employee_id,
          name: record.employee_name || "Unknown",
          code: record.employee_code || undefined,
          department: record.department || "Unassigned",
          position: record.position || "Unknown",
          avatar: employee?.avatar_url || undefined,
        },
        payPeriod: {
          startDate: payrollRun?.pay_period_start || "",
          endDate: payrollRun?.pay_period_end || "",
        },
        earnings: {
          baseSalary: Number(record.base_salary) || 0,
          housingAllowance: Number(record.housing_allowance) || 0,
          transportationAllowance: Number(record.transportation_allowance) || 0,
          otherAllowances,
          grossPay: Number(record.gross_pay) || 0,
        },
        deductions: {
          gosiContribution: Number(record.gosi_deduction) || 0,
          otherDeductions,
          totalDeductions: Number(record.total_deductions) || 0,
        },
        netPay: Number(record.net_pay) || 0,
        currency,
        company: {
          name: companySettings?.name || "Company",
          legalName: companySettings?.legal_name || undefined,
          address: companyAddress,
          logo: companySettings?.logo_url || undefined,
        },
        status: payrollRun?.status === 'completed' || payrollRun?.status === 'payslips_issued' 
          ? 'paid' 
          : 'pending',
      };

      return payslipData;
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

  if (!payslip) {
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
                {payslip.employee.name} - {payslip.id.slice(0, 8)}
              </p>
            </div>
          </div>

          {/* Payslip Card */}
          <PayslipCard payslip={payslip} />
        </div>
      </main>
    </div>
  );
}
