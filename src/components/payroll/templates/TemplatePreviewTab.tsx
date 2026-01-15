import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { RefreshCw, Eye } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PayslipTemplateSettings } from "@/types/payslip-template";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { useCompanySettings } from "@/contexts/CompanySettingsContext";

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
}

export function TemplatePreviewTab({ settings, docxStoragePath }: TemplatePreviewTabProps) {
  const [selectedPayrollRun, setSelectedPayrollRun] = useState<string>("");
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
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

  const formatCurrency = (amount: number | null, currencyCode: string = 'BHD') => {
    if (amount === null) return '-';
    return `${currencyCode} ${amount.toFixed(settings.layout.decimals)}`;
  };

  const totalAllowances = selectedEmployeeData 
    ? (selectedEmployeeData.housing_allowance || 0) + 
      (selectedEmployeeData.transportation_allowance || 0) + 
      (selectedEmployeeData.other_allowances || 0)
    : 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Preview Configuration</CardTitle>
          <CardDescription>
            Select a payroll run and employee to preview the payslip
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

          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={!selectedEmployee}
              onClick={() => {
                // Refresh preview
                setSelectedEmployee(selectedEmployee);
              }}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Preview
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Payslip Preview */}
      {selectedEmployeeData && selectedPayrollRunData && (
        <Card className="overflow-hidden">
          <CardHeader className="bg-[hsl(var(--primary))] text-primary-foreground">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl text-primary-foreground">Payslip Preview</CardTitle>
                <CardDescription className="text-primary-foreground/80">
                  This is how the payslip will appear
                </CardDescription>
              </div>
              <Eye className="h-8 w-8 opacity-50" />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="bg-background p-6 space-y-6">
              {/* Company Header */}
              {settings.branding.show_logo && (
                <div className={`text-${settings.branding.logo_alignment}`}>
                  <h2 className="text-2xl font-bold">{companySettings?.name || 'Company Name'}</h2>
                  {settings.branding.show_company_address && (
                    <p className="text-sm text-muted-foreground">
                      Company Address
                    </p>
                  )}
                </div>
              )}

              <Separator />

              {/* Employee Details */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <h3 className="font-semibold">Employee Details</h3>
                  <div className="text-sm space-y-1">
                    <p><span className="text-muted-foreground">Name:</span> {selectedEmployeeData.employee_name}</p>
                    {settings.visibility.show_employee_id && (
                      <p><span className="text-muted-foreground">Employee ID:</span> {selectedEmployeeData.employee_code}</p>
                    )}
                    {settings.visibility.show_department && selectedEmployeeData.department && (
                      <p><span className="text-muted-foreground">Department:</span> {selectedEmployeeData.department}</p>
                    )}
                    {settings.visibility.show_job_title && selectedEmployeeData.position && (
                      <p><span className="text-muted-foreground">Position:</span> {selectedEmployeeData.position}</p>
                    )}
                  </div>
                </div>

                {settings.visibility.show_pay_period && (
                  <div className="space-y-2">
                    <h3 className="font-semibold">Pay Period</h3>
                    <div className="text-sm space-y-1">
                      <p><span className="text-muted-foreground">From:</span> {format(new Date(selectedPayrollRunData.pay_period_start), 'dd MMM yyyy')}</p>
                      <p><span className="text-muted-foreground">To:</span> {format(new Date(selectedPayrollRunData.pay_period_end), 'dd MMM yyyy')}</p>
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              {/* Earnings */}
              <div className="space-y-3">
                <h3 className="font-semibold">Earnings</h3>
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Base Salary</span>
                    <span className="font-medium">{formatCurrency(selectedEmployeeData.base_salary)}</span>
                  </div>
                  {settings.breakdown.earnings_breakdown === 'detailed' ? (
                    <>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span className="pl-2">• Housing Allowance</span>
                        <span>{formatCurrency(selectedEmployeeData.housing_allowance)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span className="pl-2">• Transportation Allowance</span>
                        <span>{formatCurrency(selectedEmployeeData.transportation_allowance)}</span>
                      </div>
                      {selectedEmployeeData.other_allowances > 0 && (
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span className="pl-2">• Other Allowances</span>
                          <span>{formatCurrency(selectedEmployeeData.other_allowances)}</span>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex justify-between text-sm">
                      <span>Total Allowances</span>
                      <span>{formatCurrency(totalAllowances)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-medium">
                    <span>Gross Pay</span>
                    <span>{formatCurrency(selectedEmployeeData.gross_pay)}</span>
                  </div>
                </div>
              </div>

              {/* Deductions */}
              <div className="space-y-3">
                <h3 className="font-semibold">Deductions</h3>
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  {settings.breakdown.deductions_breakdown === 'detailed' ? (
                    <>
                      {settings.breakdown.include_gosi_line && selectedEmployeeData.gosi_deduction > 0 && (
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span className="pl-2">• GOSI Employee Contribution</span>
                          <span className="text-destructive">-{formatCurrency(selectedEmployeeData.gosi_deduction)}</span>
                        </div>
                      )}
                      {selectedEmployeeData.other_deductions > 0 && (
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span className="pl-2">• Other Deductions</span>
                          <span className="text-destructive">-{formatCurrency(selectedEmployeeData.other_deductions)}</span>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex justify-between text-sm">
                      <span>Total Deductions</span>
                      <span className="text-destructive">-{formatCurrency(selectedEmployeeData.total_deductions)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-medium">
                    <span>Total Deductions</span>
                    <span className="text-destructive">-{formatCurrency(selectedEmployeeData.total_deductions)}</span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Net Pay */}
              <div className="bg-primary/10 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Net Pay</span>
                  <span className="text-2xl font-bold text-primary">
                    {formatCurrency(selectedEmployeeData.net_pay)}
                  </span>
                </div>
              </div>

              {/* Footer */}
              {(settings.branding.footer_disclaimer_text || settings.branding.show_generated_timestamp) && (
                <div className="pt-4 border-t text-xs text-muted-foreground text-center space-y-1">
                  {settings.branding.footer_disclaimer_text && (
                    <p>{settings.branding.footer_disclaimer_text}</p>
                  )}
                  {settings.branding.show_generated_timestamp && (
                    <p>Generated on: {format(new Date(), 'dd MMM yyyy, HH:mm')}</p>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {!selectedEmployee && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Eye className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p>Select a payroll run and employee to preview the payslip</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
