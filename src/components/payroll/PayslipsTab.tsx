import { useState } from "react";
import { Download, FileText, Loader2, RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { usePayslipDocuments, downloadPayslipPDF } from "@/hooks/usePayslipDocuments";
import { useActivePayslipTemplates } from "@/hooks/usePayslipTemplates";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import type { PayslipDocument } from "@/types/payslip-template";

interface PayslipsTabProps {
  payrollRunId: string;
  payrollRun: {
    id: string;
    period_start: string;
    period_end: string;
    status: string;
  };
  employees: Array<{
    id: string;
    employee_id: string;
    employee: {
      id: string;
      first_name: string;
      last_name: string;
      employee_code: string | null;
      avatar_url: string | null;
      work_location_id: string | null;
    };
  }>;
}

export function PayslipsTab({ payrollRunId, payrollRun, employees }: PayslipsTabProps) {
  const queryClient = useQueryClient();
  const { data: payslipDocuments = [], isLoading: loadingDocuments } = usePayslipDocuments(payrollRunId);
  const { data: templates = [] } = useActivePayslipTemplates();
  const [generating, setGenerating] = useState(false);
  const [downloadingAll, setDownloadingAll] = useState(false);

  // Create a map of employee_id to payslip document
  const payslipMap = new Map<string, PayslipDocument>();
  payslipDocuments.forEach(doc => {
    if (doc.status === 'generated') {
      payslipMap.set(doc.employee_id, doc);
    }
  });

  const hasActiveTemplate = templates.length > 0;
  const generatedCount = payslipMap.size;
  const totalCount = employees.length;

  const handleGenerateAll = async () => {
    if (!hasActiveTemplate) {
      toast.error("No active payslip template found. Please create and activate a template first.");
      return;
    }

    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-payslips', {
        body: { payroll_run_id: payrollRunId },
      });

      if (error) throw error;

      // Invalidate queries to refresh the list
      queryClient.invalidateQueries({ queryKey: ['payslip-documents', 'run', payrollRunId] });
      
      const successCount = data.results?.filter((r: any) => r.success).length || 0;
      const failCount = data.results?.filter((r: any) => !r.success).length || 0;
      
      if (failCount > 0) {
        toast.warning(`Generated ${successCount} payslips, ${failCount} failed`);
      } else {
        toast.success(`Generated ${successCount} payslips successfully`);
      }
    } catch (error) {
      console.error("Error generating payslips:", error);
      toast.error("Failed to generate payslips");
    } finally {
      setGenerating(false);
    }
  };

  const handleDownloadAll = async () => {
    if (generatedCount === 0) {
      toast.error("No payslips to download");
      return;
    }

    setDownloadingAll(true);
    try {
      // Download each payslip
      for (const doc of payslipDocuments) {
        if (doc.status === 'generated') {
          const employee = doc.employee;
          const filename = `${employee?.employee_code || 'payslip'}_${format(new Date(doc.period_start), 'yyyy-MM')}.pdf`;
          await downloadPayslipPDF(doc.pdf_storage_path, filename);
        }
      }
      toast.success(`Downloaded ${generatedCount} payslips`);
    } catch (error) {
      toast.error("Failed to download some payslips");
    } finally {
      setDownloadingAll(false);
    }
  };

  const handleDownloadSingle = async (doc: PayslipDocument) => {
    try {
      const employee = doc.employee;
      const filename = `${employee?.employee_code || 'payslip'}_${format(new Date(doc.period_start), 'yyyy-MM')}.pdf`;
      await downloadPayslipPDF(doc.pdf_storage_path, filename);
    } catch (error) {
      toast.error("Failed to download payslip");
    }
  };

  if (loadingDocuments) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Payslips
              </CardTitle>
              <CardDescription>
                {generatedCount} of {totalCount} payslips generated for{" "}
                {format(new Date(payrollRun.period_start), "MMMM yyyy")}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    disabled={generating || !hasActiveTemplate}
                    className="gap-2"
                  >
                    {generating ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                    {generatedCount > 0 ? "Regenerate All" : "Generate Payslips"}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      {generatedCount > 0 ? "Regenerate All Payslips?" : "Generate Payslips?"}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      {generatedCount > 0
                        ? `This will regenerate payslips for all ${totalCount} employees. Existing payslips will be replaced.`
                        : `This will generate payslips for all ${totalCount} employees in this payroll run.`}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleGenerateAll}>
                      {generatedCount > 0 ? "Regenerate All" : "Generate"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <Button
                variant="outline"
                disabled={downloadingAll || generatedCount === 0}
                onClick={handleDownloadAll}
                className="gap-2"
              >
                {downloadingAll ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                Download All
              </Button>
            </div>
          </div>
        </CardHeader>

        {!hasActiveTemplate && (
          <CardContent>
            <div className="flex items-center gap-3 p-4 rounded-lg bg-warning/10 border border-warning/20">
              <AlertCircle className="h-5 w-5 text-warning shrink-0" />
              <div>
                <p className="font-medium text-warning">No Active Template</p>
                <p className="text-sm text-muted-foreground">
                  Please create and activate a payslip template before generating payslips.
                </p>
              </div>
              <Button variant="outline" size="sm" asChild className="ml-auto shrink-0">
                <a href="/payroll/templates">Manage Templates</a>
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Payslips table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Employee Code</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Generated At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((emp) => {
                const payslip = payslipMap.get(emp.employee_id);
                const isGenerated = !!payslip;

                return (
                  <TableRow key={emp.employee_id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={emp.employee.avatar_url || undefined} />
                          <AvatarFallback className="text-xs">
                            {emp.employee.first_name[0]}
                            {emp.employee.last_name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">
                          {emp.employee.first_name} {emp.employee.last_name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {emp.employee.employee_code || "—"}
                    </TableCell>
                    <TableCell>
                      {isGenerated ? (
                        <Badge variant="outline" className="gap-1 bg-success/10 text-success border-success/20">
                          <CheckCircle2 className="h-3 w-3" />
                          Generated
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="gap-1 text-muted-foreground">
                          Not Generated
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {payslip?.generated_at
                        ? format(new Date(payslip.generated_at), "MMM d, yyyy h:mm a")
                        : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {isGenerated && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownloadSingle(payslip)}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={generating}
                          onClick={async () => {
                            setGenerating(true);
                            try {
                              const { data, error } = await supabase.functions.invoke('generate-payslips', {
                                body: { 
                                  payroll_run_id: payrollRunId,
                                  employee_ids: [emp.employee_id],
                                },
                              });
                              if (error) throw error;
                              queryClient.invalidateQueries({ queryKey: ['payslip-documents', 'run', payrollRunId] });
                              toast.success(`Payslip ${isGenerated ? 'regenerated' : 'generated'} for ${emp.employee.first_name} ${emp.employee.last_name}`);
                            } catch (error) {
                              toast.error("Failed to generate payslip");
                            } finally {
                              setGenerating(false);
                            }
                          }}
                        >
                          <RefreshCw className="h-4 w-4 mr-1" />
                          {isGenerated ? "Regenerate" : "Generate"}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
