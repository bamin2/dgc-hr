import { useState } from "react";
import { FileDown, Loader2, CheckCircle, Download } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { PayrollRunEmployee } from "@/hooks/usePayrollRunEmployees";
import { PayrollRunAdjustment } from "@/hooks/usePayrollRunAdjustments";
import { useIssuePayslips } from "@/hooks/usePayrollRunsV2";
import { downloadPayslip } from "@/utils/payslipGenerator";
import { toast } from "@/hooks/use-toast";
import { useCompanySettings } from "@/contexts/CompanySettingsContext";

interface IssuePayslipsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  runId: string;
  employees: PayrollRunEmployee[];
  adjustments: PayrollRunAdjustment[];
  location: { name: string; currency: string };
  payPeriod: { start: string; end: string };
  onComplete: () => void;
}

export function IssuePayslipsDialog({
  open,
  onOpenChange,
  runId,
  employees,
  adjustments,
  location,
  payPeriod,
  onComplete,
}: IssuePayslipsDialogProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const { settings } = useCompanySettings();
  const issuePayslips = useIssuePayslips();

  const handleGenerate = async () => {
    setIsGenerating(true);
    setProgress(0);

    const companyName = settings?.name || "Company";
    const companyAddress = location.name;
    try {
      // Generate and download payslips for each employee
      for (let i = 0; i < employees.length; i++) {
        const employee = employees[i];
        const employeeAdjustments = adjustments.filter(
          (a) => a.employeeId === employee.employeeId
        );

        downloadPayslip(
          employee,
          employeeAdjustments,
          location,
          payPeriod,
          companyName,
          companyAddress
        );

        // Small delay between downloads to prevent browser blocking
        await new Promise((resolve) => setTimeout(resolve, 300));
        setProgress(((i + 1) / employees.length) * 100);
      }

      // Mark run as payslips issued
      await issuePayslips.mutateAsync(runId);

      setIsComplete(true);
      toast({
        title: "Payslips Issued",
        description: `Successfully generated ${employees.length} payslips.`,
      });
    } catch (error) {
      console.error("Error generating payslips:", error);
      toast({
        title: "Error",
        description: "Failed to generate payslips. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClose = () => {
    if (isComplete) {
      onComplete();
    }
    onOpenChange(false);
    setIsComplete(false);
    setProgress(0);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileDown className="h-5 w-5" />
            Issue Payslips
          </DialogTitle>
          <DialogDescription>
            Generate and download PDF payslips for all employees in this payroll
            run.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {!isGenerating && !isComplete && (
            <div className="text-center space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-2xl font-bold text-foreground">
                  {employees.length}
                </p>
                <p className="text-sm text-muted-foreground">
                  Payslips will be generated
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                Each payslip will be downloaded as a separate PDF file. Make
                sure your browser allows multiple downloads.
              </p>
            </div>
          )}

          {isGenerating && (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Generating payslips...</span>
              </div>
              <Progress value={progress} className="h-2" />
              <p className="text-center text-sm text-muted-foreground">
                {Math.round(progress)}% complete
              </p>
            </div>
          )}

          {isComplete && (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="p-3 bg-success/10 rounded-full">
                  <CheckCircle className="h-8 w-8 text-success" />
                </div>
              </div>
              <div>
                <p className="font-medium text-foreground">
                  Payslips Generated Successfully!
                </p>
                <p className="text-sm text-muted-foreground">
                  {employees.length} payslips have been downloaded.
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          {!isGenerating && !isComplete && (
            <>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleGenerate} className="gap-2">
                <Download className="h-4 w-4" />
                Generate & Download
              </Button>
            </>
          )}
          {isComplete && (
            <Button onClick={handleClose} className="w-full">
              Done
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
