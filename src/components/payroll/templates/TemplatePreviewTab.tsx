import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Download, FileText, AlertCircle, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PayslipTemplateSettings } from "@/types/payslip-template";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { useCompanySettings } from "@/contexts/CompanySettingsContext";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface PayrollRun {
  id: string;
  pay_period_start: string;
  pay_period_end: string;
  status: string;
}

interface PayrollRunEmployee {
  id: string;
  employee_id: string;
  employee_name: string;
  employee_code: string;
  department: string | null;
  position: string | null;
  base_salary: number;
  housing_allowance: number;
  transportation_allowance: number;
  other_allowances: number;
  gosi_deduction: number;
  other_deductions: number;
  gross_pay: number;
  total_deductions: number;
  net_pay: number;
}

interface TemplatePreviewTabProps {
  settings: PayslipTemplateSettings;
  docxStoragePath: string | null;
  templateId: string;
}

export function TemplatePreviewTab({ settings, docxStoragePath, templateId }: TemplatePreviewTabProps) {
  const [selectedPayrollRun, setSelectedPayrollRun] = useState<string>("");
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  const [isDownloading, setIsDownloading] = useState(false);
  const { settings: companySettings } = useCompanySettings();

  // Fetch payroll runs
  const { data: payrollRuns, isLoading: isLoadingRuns } = useQuery({
    queryKey: ['payroll-runs-for-preview'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payroll_runs')
        .select('id, pay_period_start, pay_period_end, status')
        .order('pay_period_start', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      return data as PayrollRun[];
    },
  });

  // Fetch employees for selected payroll run
  const { data: runEmployees, isLoading: isLoadingEmployees } = useQuery({
    queryKey: ['payroll-run-employees-preview', selectedPayrollRun],
    queryFn: async () => {
      if (!selectedPayrollRun) return [];
      
      const { data, error } = await supabase
        .from('payroll_run_employees')
        .select('*')
        .eq('payroll_run_id', selectedPayrollRun);
      
      if (error) throw error;
      return data as PayrollRunEmployee[];
    },
    enabled: !!selectedPayrollRun,
  });

  // Get selected employee data
  const selectedEmployeeData = runEmployees?.find(
    (e) => e.employee_id === selectedEmployee
  );

  const selectedPayrollRunData = payrollRuns?.find((r) => r.id === selectedPayrollRun);

  const handleDownloadPreview = async () => {
    if (!selectedPayrollRun || !selectedEmployee || !templateId) {
      toast.error("Please select a payroll run and employee");
      return;
    }

    if (!docxStoragePath) {
      toast.error("No template file uploaded. Please upload a DOCX template first.");
      return;
    }

    setIsDownloading(true);
    try {
      const response = await supabase.functions.invoke('preview-payslip-template', {
        body: {
          template_id: templateId,
          payroll_run_id: selectedPayrollRun,
          employee_id: selectedEmployee,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to generate preview');
      }

      // The response.data should be a Blob
      const blob = response.data;
      if (!(blob instanceof Blob)) {
        throw new Error('Invalid response format');
      }

      // Create download link
      const url = URL.createObjectURL(blob);
      const monthYear = selectedPayrollRunData 
        ? format(new Date(selectedPayrollRunData.pay_period_start), 'MMMM_yyyy')
        : 'preview';
      const filename = `preview_${monthYear}_${selectedEmployeeData?.employee_code || 'employee'}.docx`;
      
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Preview downloaded successfully");
    } catch (error: any) {
      console.error("Error downloading preview:", error);
      toast.error(error.message || "Failed to download preview");
    } finally {
      setIsDownloading(false);
    }
  };

  const hasTemplate = !!docxStoragePath;

  return (
    <div className="space-y-6">
      {!hasTemplate && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No Template File</AlertTitle>
          <AlertDescription>
            Please upload a DOCX template in the "Template File" tab before previewing.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Preview & Download</CardTitle>
          <CardDescription>
            Select a payroll run and employee to download a preview of your template filled with actual payroll data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Payroll Run</Label>
              {isLoadingRuns ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Select value={selectedPayrollRun} onValueChange={setSelectedPayrollRun}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a payroll run" />
                  </SelectTrigger>
                  <SelectContent>
                    {payrollRuns?.map((run) => (
                      <SelectItem key={run.id} value={run.id}>
                        {format(new Date(run.pay_period_start), 'MMM yyyy')} - {run.status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-2">
              <Label>Employee</Label>
              {isLoadingEmployees ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Select 
                  value={selectedEmployee} 
                  onValueChange={setSelectedEmployee}
                  disabled={!selectedPayrollRun}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {runEmployees?.map((emp) => (
                      <SelectItem key={emp.employee_id} value={emp.employee_id}>
                        {emp.employee_name} ({emp.employee_code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          <Separator />

          <div className="flex flex-col gap-4">
            <Button
              onClick={handleDownloadPreview}
              disabled={!selectedEmployee || !hasTemplate || isDownloading}
              className="w-full sm:w-auto"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating Preview...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Download Preview DOCX
                </>
              )}
            </Button>
            
            <p className="text-sm text-muted-foreground">
              Downloads a Word document with your template filled using the selected employee's payroll data. 
              Open it in Word to verify that all tags (e.g., {"{{NET_PAY}}"}, {"{{EMPLOYEE_FULL_NAME}}"}) are replaced correctly.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Preview Info Card */}
      {selectedEmployeeData && selectedPayrollRunData && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Selected Data Preview
            </CardTitle>
            <CardDescription>
              The following data will be used to fill your template
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 text-sm">
              <div className="space-y-2">
                <h4 className="font-medium">Employee</h4>
                <div className="space-y-1 text-muted-foreground">
                  <p>Name: {selectedEmployeeData.employee_name}</p>
                  <p>Code: {selectedEmployeeData.employee_code}</p>
                  {selectedEmployeeData.department && <p>Department: {selectedEmployeeData.department}</p>}
                  {selectedEmployeeData.position && <p>Position: {selectedEmployeeData.position}</p>}
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Pay Period</h4>
                <div className="space-y-1 text-muted-foreground">
                  <p>From: {format(new Date(selectedPayrollRunData.pay_period_start), 'dd MMM yyyy')}</p>
                  <p>To: {format(new Date(selectedPayrollRunData.pay_period_end), 'dd MMM yyyy')}</p>
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Earnings</h4>
                <div className="space-y-1 text-muted-foreground">
                  <p>Base Salary: {selectedEmployeeData.base_salary?.toFixed(2)}</p>
                  <p>Gross Pay: {selectedEmployeeData.gross_pay?.toFixed(2)}</p>
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Net Pay</h4>
                <div className="space-y-1">
                  <p className="text-lg font-semibold text-primary">
                    {selectedEmployeeData.net_pay?.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!selectedEmployee && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p>Select a payroll run and employee to preview the data</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
