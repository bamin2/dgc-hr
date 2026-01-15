import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { queryPresets } from "@/lib/queryOptions";
import type { PayslipDocument, PayslipDocumentInsert } from "@/types/payslip-template";

// Query keys
const payslipDocumentKeys = {
  all: ['payslip-documents'] as const,
  byPayrollRun: (runId: string) => ['payslip-documents', 'run', runId] as const,
  byEmployee: (employeeId: string) => ['payslip-documents', 'employee', employeeId] as const,
  detail: (id: string) => ['payslip-documents', id] as const,
};

export function usePayslipDocuments(payrollRunId: string) {
  return useQuery({
    queryKey: payslipDocumentKeys.byPayrollRun(payrollRunId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payslip_documents")
        .select(`
          *,
          employee:employees(id, first_name, last_name, employee_code, avatar_url),
          template:payslip_templates(id, name)
        `)
        .eq("payroll_run_id", payrollRunId)
        .order("generated_at", { ascending: false });

      if (error) throw error;
      return data as unknown as PayslipDocument[];
    },
    enabled: !!payrollRunId,
    ...queryPresets.userData,
  });
}

export function useEmployeePayslips(employeeId: string | undefined) {
  return useQuery({
    queryKey: payslipDocumentKeys.byEmployee(employeeId || ''),
    queryFn: async () => {
      if (!employeeId) return [];
      const { data, error } = await supabase
        .from("payslip_documents")
        .select(`
          *,
          template:payslip_templates(id, name)
        `)
        .eq("employee_id", employeeId)
        .eq("status", "generated")
        .order("period_end", { ascending: false });

      if (error) throw error;
      return data as unknown as PayslipDocument[];
    },
    enabled: !!employeeId,
    ...queryPresets.userData,
  });
}

export function usePayslipDocument(id: string | undefined) {
  return useQuery({
    queryKey: payslipDocumentKeys.detail(id || ''),
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("payslip_documents")
        .select(`
          *,
          employee:employees(id, first_name, last_name, employee_code, avatar_url),
          template:payslip_templates(*)
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as unknown as PayslipDocument;
    },
    enabled: !!id,
    ...queryPresets.userData,
  });
}

export function useCreatePayslipDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (document: PayslipDocumentInsert) => {
      const { data, error } = await supabase
        .from("payslip_documents")
        .insert(document as unknown as Record<string, unknown>)
        .select()
        .single();

      if (error) throw error;
      return data as unknown as PayslipDocument;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: payslipDocumentKeys.byPayrollRun(data.payroll_run_id) });
      queryClient.invalidateQueries({ queryKey: payslipDocumentKeys.byEmployee(data.employee_id) });
    },
    onError: (error: Error) => {
      toast.error(`Failed to create payslip: ${error.message}`);
    },
  });
}

export function useVoidPayslipDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from("payslip_documents")
        .update({ status: 'voided' as const })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as unknown as PayslipDocument;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: payslipDocumentKeys.byPayrollRun(data.payroll_run_id) });
      queryClient.invalidateQueries({ queryKey: payslipDocumentKeys.byEmployee(data.employee_id) });
      toast.success("Payslip voided");
    },
    onError: (error: Error) => {
      toast.error(`Failed to void payslip: ${error.message}`);
    },
  });
}

export async function downloadPayslipPDF(storagePath: string, filename?: string) {
  try {
    const { data, error } = await supabase.storage
      .from('payslips')
      .download(storagePath);

    if (error) throw error;

    const url = URL.createObjectURL(data);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || storagePath.split('/').pop() || 'payslip.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    toast.error("Failed to download payslip");
    throw error;
  }
}

export async function getPayslipDownloadUrl(storagePath: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from('payslips')
    .createSignedUrl(storagePath, 60 * 60); // 1 hour

  if (error) throw error;
  return data.signedUrl;
}

// Export query keys for external use
export { payslipDocumentKeys };
