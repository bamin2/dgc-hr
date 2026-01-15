import { useState } from "react";
import { FileDown, Loader2, CheckCircle, Download, Mail, AlertTriangle } from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { PayrollRunEmployee } from "@/hooks/usePayrollRunEmployees";
import { PayrollRunAdjustment } from "@/hooks/usePayrollRunAdjustments";
import { useIssuePayslips } from "@/hooks/usePayrollRunsV2";
import { useGeneratePayslipsEdge, downloadGeneratedPayslip } from "@/hooks/useGeneratePayslipsEdge";
import { toast } from "@/hooks/use-toast";

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

interface GenerationResult {
  templateUsed: string;
  successCount: number;
  failCount: number;
  failures: Array<{ name: string; error: string }>;
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
  const [sendByEmail, setSendByEmail] = useState(true);
  const [emailsSent, setEmailsSent] = useState(false);
  const [result, setResult] = useState<GenerationResult | null>(null);

  const issuePayslips = useIssuePayslips();
  const generatePayslips = useGeneratePayslipsEdge();

  const handleGenerate = async () => {
    setIsGenerating(true);
    setProgress(10);

    try {
      // Call the edge function to generate payslips using DOCX template
      const employeeIds = employees.map(e => e.employeeId);
      
      setProgress(30);
      const response = await generatePayslips.mutateAsync({
        payrollRunId: runId,
        employeeIds,
      });
      
      setProgress(70);

      // Download successful payslips
      const successfulResults = response.results.filter(r => r.success && r.pdf_storage_path);
      
      for (let i = 0; i < successfulResults.length; i++) {
        const payslipResult = successfulResults[i];
        if (payslipResult.pdf_storage_path) {
          const filename = `Payslip_${payslipResult.employee_name.replace(/\s+/g, '_')}_${payPeriod.start}_${payPeriod.end}.pdf`;
          await downloadGeneratedPayslip(payslipResult.pdf_storage_path, filename);
          // Small delay between downloads to prevent browser blocking
          await new Promise((resolve) => setTimeout(resolve, 300));
        }
        setProgress(70 + ((i + 1) / successfulResults.length) * 20);
      }

      // Mark run as payslips issued and optionally send emails
      await issuePayslips.mutateAsync({ runId, sendEmails: sendByEmail });
      setEmailsSent(sendByEmail);

      // Store result for display
      setResult({
        templateUsed: response.template_used,
        successCount: response.summary.successful,
        failCount: response.summary.failed,
        failures: response.results
          .filter(r => !r.success)
          .map(r => ({ name: r.employee_name, error: r.error || 'Unknown error' })),
      });

      setProgress(100);
      setIsComplete(true);
      
      if (response.summary.failed > 0) {
        toast({
          title: "Payslips Generated with Warnings",
          description: `${response.summary.successful} succeeded, ${response.summary.failed} failed.`,
          variant: "default",
        });
      } else {
        toast({
          title: "Payslips Issued",
          description: sendByEmail 
            ? `Successfully generated ${employees.length} payslips and sent by email.`
            : `Successfully generated ${employees.length} payslips.`,
        });
      }
    } catch (error) {
      console.error("Error generating payslips:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate payslips. Please try again.",
        variant: "destructive",
      });
      setIsGenerating(false);
      setProgress(0);
    }
  };

  const handleClose = () => {
    if (isComplete) {
      onComplete();
    }
    onOpenChange(false);
    setIsComplete(false);
    setProgress(0);
    setResult(null);
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
            Generate PDF payslips using your configured template for all employees in this payroll run.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {!isGenerating && !isComplete && (
            <div className="space-y-4">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-2xl font-bold text-foreground">
                  {employees.length}
                </p>
                <p className="text-sm text-muted-foreground">
                  Payslips will be generated
                </p>
              </div>
              
              <div className="flex items-center space-x-2 p-3 border rounded-lg">
                <Checkbox 
                  id="sendByEmail" 
                  checked={sendByEmail} 
                  onCheckedChange={(checked) => setSendByEmail(checked === true)}
                />
                <Label htmlFor="sendByEmail" className="flex items-center gap-2 cursor-pointer">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>Send payslips to employees by email</span>
                </Label>
              </div>

              <p className="text-sm text-muted-foreground text-center">
                Payslips will be generated using your default DOCX template. 
                Make sure your browser allows multiple downloads.
              </p>
            </div>
          )}

          {isGenerating && !isComplete && (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Generating payslips from template...</span>
              </div>
              <Progress value={progress} className="h-2" />
              <p className="text-center text-sm text-muted-foreground">
                {Math.round(progress)}% complete
              </p>
            </div>
          )}

          {isComplete && result && (
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className={`p-3 rounded-full ${result.failCount > 0 ? 'bg-warning/10' : 'bg-success/10'}`}>
                  {result.failCount > 0 ? (
                    <AlertTriangle className="h-8 w-8 text-warning" />
                  ) : (
                    <CheckCircle className="h-8 w-8 text-success" />
                  )}
                </div>
              </div>
              
              <div className="text-center">
                <p className="font-medium text-foreground">
                  {result.failCount > 0 ? 'Payslips Generated with Issues' : 'Payslips Generated Successfully!'}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Template: {result.templateUsed}
                </p>
                <p className="text-sm text-muted-foreground">
                  {result.successCount} downloaded successfully
                  {emailsSent && ". Emails are being sent."}
                </p>
              </div>

              {result.failCount > 0 && (
                <div className="bg-destructive/10 rounded-lg p-3 text-sm">
                  <p className="font-medium text-destructive mb-2">
                    {result.failCount} payslip(s) failed:
                  </p>
                  <ul className="space-y-1 text-muted-foreground">
                    {result.failures.slice(0, 3).map((f, i) => (
                      <li key={i} className="truncate">
                        • {f.name}: {f.error}
                      </li>
                    ))}
                    {result.failures.length > 3 && (
                      <li>... and {result.failures.length - 3} more</li>
                    )}
                  </ul>
                </div>
              )}
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
