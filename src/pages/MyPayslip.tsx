import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/dashboard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PayslipCard } from "@/components/payroll";
import { PayslipPdfViewer } from "@/components/payroll/PayslipPdfViewer";
import { PayslipData } from "@/types/payslip";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useMyEmployee } from "@/hooks/useMyEmployee";

interface PayslipDocument {
  id: string;
  pdf_storage_path: string;
  period_start: string;
  period_end: string;
  status: string;
}

export default function MyPayslip() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: myEmployee } = useMyEmployee();

  // First, check if there's a generated PDF for this payroll run employee
  const { data: payslipDocument, isLoading: isLoadingDocument } = useQuery({
    queryKey: ["payslip-document", id, myEmployee?.id],
    queryFn: async (): Promise<PayslipDocument | null> => {
      if (!id || !myEmployee?.id) return null;

      // Get the payroll_run_id from payroll_run_employees first
      const { data: payrollRunEmployee, error: preError } = await supabase
        .from("payroll_run_employees")
        .select("payroll_run_id, employee_id")
        .eq("id", id)
        .eq("employee_id", myEmployee.id)
        .maybeSingle();

      if (preError || !payrollRunEmployee) return null;

      // Now check for a generated payslip document
      const { data, error } = await supabase
        .from("payslip_documents")
        .select("id, pdf_storage_path, period_start, period_end, status")
        .eq("payroll_run_id", payrollRunEmployee.payroll_run_id)
        .eq("employee_id", myEmployee.id)
        .eq("status", "generated")
        .maybeSingle();

      if (error) {
        console.error("Error fetching payslip document:", error);
        return null;
      }

      return data;
    },
    enabled: !!id && !!myEmployee?.id,
  });

  const { data: payslip, isLoading: isLoadingPayslip } = useQuery({
    queryKey: ["my-payslip", id, myEmployee?.id],
    queryFn: async (): Promise<PayslipData | null> => {
      if (!id || !myEmployee?.id) return null;

      const { data: record, error } = await supabase
        .from("payroll_run_employees")
        .select(`
          id, employee_id, employee_name, employee_code, department, position,
          base_salary, housing_allowance, transportation_allowance, other_allowances,
          gosi_deduction, other_deductions, gross_pay, total_deductions, net_pay,
          payroll_run:payroll_runs!payroll_run_employees_payroll_run_id_fkey(
            pay_period_start, pay_period_end, status
          )
        `)
        .eq("id", id)
        .eq("employee_id", myEmployee.id)
        .maybeSingle();

      if (error) throw error;
      if (!record) return null;

      const payrollRun = record.payroll_run as { 
        pay_period_start: string; 
        pay_period_end: string; 
        status: string 
      } | null;
      
      if (payrollRun?.status !== 'payslips_issued') {
        return null;
      }

      const { data: employee } = await supabase
        .from("employees")
        .select("avatar_url, work_location_id")
        .eq("id", record.employee_id)
        .maybeSingle();

      const { data: companySettings } = await supabase
        .from("company_settings")
        .select("name, legal_name, logo_url, document_logo_url, address_city, address_country, currency")
        .limit(1)
        .maybeSingle();

      const { data: hqLocation } = await supabase
        .from("work_locations")
        .select("currency")
        .eq("is_hq", true)
        .maybeSingle();

      const otherAllowances = (record.other_allowances as { name: string; amount: number }[]) || [];
      const otherDeductions = (record.other_deductions as { name: string; amount: number }[]) || [];
      const currency = hqLocation?.currency || companySettings?.currency || "SAR";
      const addressParts = [companySettings?.address_city, companySettings?.address_country].filter(Boolean);
      const companyAddress = addressParts.join(", ") || "Not specified";

      return {
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
          endDate: payrollRun?.pay_period_end || "" 
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
          logo: companySettings?.document_logo_url || companySettings?.logo_url || undefined,
        },
        status: 'paid',
      };
    },
    enabled: !!id && !!myEmployee?.id,
  });

  const isLoading = isLoadingDocument || isLoadingPayslip;

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10" />
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <Skeleton className="h-[500px] max-w-2xl mx-auto" />
        </div>
      </DashboardLayout>
    );
  }

  if (!payslip && !payslipDocument) {
    return (
      <DashboardLayout>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-foreground mb-2">Payslip not found</h2>
            <p className="text-muted-foreground mb-4">The requested payslip could not be found or you don't have access to it.</p>
            <Button onClick={() => navigate("/my-profile")}>Back to Profile</Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const periodStart = payslipDocument?.period_start || payslip?.payPeriod.startDate || "";
  const periodEnd = payslipDocument?.period_end || payslip?.payPeriod.endDate || "";

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/my-profile")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">My Payslip</h1>
            <p className="text-muted-foreground">
              {periodStart && periodEnd
                ? `${new Date(periodStart).toLocaleDateString()} - ${new Date(periodEnd).toLocaleDateString()}`
                : payslip?.id.slice(0, 8)}
            </p>
          </div>
        </div>

        {/* If there's a generated PDF, show the PDF viewer; otherwise show PayslipCard */}
        {payslipDocument?.pdf_storage_path ? (
          <PayslipPdfViewer
            pdfStoragePath={payslipDocument.pdf_storage_path}
            periodStart={periodStart}
            periodEnd={periodEnd}
          />
        ) : payslip ? (
          <PayslipCard payslip={payslip} />
        ) : null}
      </div>
    </DashboardLayout>
  );
}
