import { useState } from "react";
import { format } from "date-fns";
import { User, Banknote, Calendar, FileText, CheckCircle, XCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useApproveLoan, useRejectLoan, Loan } from "@/hooks/useLoans";
import { useCompanySettings } from "@/contexts/CompanySettingsContext";
import { toast } from "sonner";

interface LoanApprovalDialogProps {
  loan: Loan | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApproved?: () => void;
  onRejected?: () => void;
}

export function LoanApprovalDialog({ 
  loan, 
  open, 
  onOpenChange, 
  onApproved,
  onRejected 
}: LoanApprovalDialogProps) {
  const [deductFromPayroll, setDeductFromPayroll] = useState(true);
  const [autoDisburse, setAutoDisburse] = useState(true);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);

  const approveLoan = useApproveLoan();
  const rejectLoan = useRejectLoan();
  const { formatCurrency } = useCompanySettings();

  if (!loan) return null;

  const employeeName = loan.employee?.full_name || 
    `${loan.employee?.first_name || ""} ${loan.employee?.last_name || ""}`.trim();

  const handleApprove = async () => {
    try {
      await approveLoan.mutateAsync({
        loanId: loan.id,
        deductFromPayroll,
        autoDisburse,
      });
      toast.success(autoDisburse ? "Loan approved and disbursed" : "Loan approved");
      onOpenChange(false);
      onApproved?.();
    } catch (error) {
      toast.error("Failed to approve loan");
    }
  };

  const handleReject = async () => {
    try {
      await rejectLoan.mutateAsync({ 
        loanId: loan.id, 
        reason: rejectionReason || undefined 
      });
      toast.success("Loan request rejected");
      onOpenChange(false);
      setShowRejectForm(false);
      setRejectionReason("");
      onRejected?.();
    } catch (error) {
      toast.error("Failed to reject loan");
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setShowRejectForm(false);
    setRejectionReason("");
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Banknote className="h-5 w-5" />
            Review Loan Request
          </DialogTitle>
          <DialogDescription>
            Review and approve or reject this loan request
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Employee Info */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <User className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium">{employeeName}</p>
              <p className="text-sm text-muted-foreground">Requested by</p>
            </div>
          </div>

          {/* Loan Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-start gap-2">
              <Banknote className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Amount</p>
                <p className="font-medium">{formatCurrency(loan.principal_amount)}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Start Date</p>
                <p className="font-medium">{format(new Date(loan.start_date), "MMM d, yyyy")}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Duration</p>
              <p className="font-medium">
                {loan.duration_months ? `${loan.duration_months} months` : "-"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Installment</p>
              <p className="font-medium">
                {loan.installment_amount ? formatCurrency(loan.installment_amount) : 
                  loan.duration_months && loan.principal_amount ? 
                    formatCurrency(loan.principal_amount / loan.duration_months) : "-"}
              </p>
            </div>
          </div>

          {/* Notes */}
          {loan.notes && (
            <div className="p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 mb-1">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-medium">Employee's Notes</p>
              </div>
              <p className="text-sm text-muted-foreground">{loan.notes}</p>
            </div>
          )}

          <Separator />

          {!showRejectForm ? (
            <>
              {/* HR Options */}
              <div className="space-y-3">
                <p className="text-sm font-medium">Approval Options</p>
                
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <Label>Deduct from Payroll</Label>
                    <p className="text-xs text-muted-foreground">
                      Automatically deduct installments from salary
                    </p>
                  </div>
                  <Switch
                    checked={deductFromPayroll}
                    onCheckedChange={setDeductFromPayroll}
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <Label>Auto-Disburse</Label>
                    <p className="text-xs text-muted-foreground">
                      Disburse loan immediately upon approval
                    </p>
                  </div>
                  <Switch
                    checked={autoDisburse}
                    onCheckedChange={setAutoDisburse}
                  />
                </div>
              </div>

              <DialogFooter className="flex gap-2 sm:gap-2">
                <Button 
                  variant="destructive" 
                  onClick={() => setShowRejectForm(true)}
                  disabled={approveLoan.isPending}
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Reject
                </Button>
                <Button 
                  onClick={handleApprove}
                  disabled={approveLoan.isPending}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  {approveLoan.isPending ? "Approving..." : "Approve"}
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              {/* Rejection Form */}
              <div className="space-y-3">
                <p className="text-sm font-medium">Rejection Reason (Optional)</p>
                <Textarea
                  placeholder="Explain why this loan request is being rejected..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                />
              </div>

              <DialogFooter className="flex gap-2 sm:gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowRejectForm(false)}
                  disabled={rejectLoan.isPending}
                >
                  Back
                </Button>
                <Button 
                  variant="destructive"
                  onClick={handleReject}
                  disabled={rejectLoan.isPending}
                >
                  {rejectLoan.isPending ? "Rejecting..." : "Confirm Rejection"}
                </Button>
              </DialogFooter>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
