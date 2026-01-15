import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { payslipDocumentKeys } from "./usePayslipDocuments";

interface GeneratePayslipsParams {
  payrollRunId: string;
  employeeIds: string[];
}

interface PayslipResult {
  employee_id: string;
  employee_name: string;
  success: boolean;
  pdf_storage_path?: string;
  payslip_document_id?: string;
  error?: string;
}

interface GeneratePayslipsResponse {
  success: boolean;
  template_used: string;
  results: PayslipResult[];
  summary: {
    total: number;
    successful: number;
    failed: number;
  };
}

export function useGeneratePayslipsEdge() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ payrollRunId, employeeIds }: GeneratePayslipsParams): Promise<GeneratePayslipsResponse> => {
      const { data, error } = await supabase.functions.invoke('generate-payslips', {
        body: {
          payroll_run_id: payrollRunId,
          employee_ids: employeeIds,
        },
      });

      if (error) {
        throw new Error(error.message || 'Failed to generate payslips');
      }

      if (!data.success) {
        throw new Error(data.error || 'Payslip generation failed');
      }

      return data as GeneratePayslipsResponse;
    },
    onSuccess: (data, variables) => {
      // Invalidate payslip documents queries
      queryClient.invalidateQueries({ queryKey: payslipDocumentKeys.byPayrollRun(variables.payrollRunId) });
      
      // Also invalidate for each employee
      variables.employeeIds.forEach(empId => {
        queryClient.invalidateQueries({ queryKey: payslipDocumentKeys.byEmployee(empId) });
      });
    },
    onError: (error: Error) => {
      console.error('Generate payslips error:', error);
    },
  });
}

export async function downloadGeneratedPayslip(storagePath: string, filename: string) {
  try {
    const { data, error } = await supabase.storage
      .from('payslips')
      .download(storagePath);

    if (error) throw error;

    const url = URL.createObjectURL(data);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Download error:', error);
    throw error;
  }
}
