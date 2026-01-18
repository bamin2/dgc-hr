import { useState } from "react";
import { SkipForward } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useSkipInstallment } from "@/hooks/useLoanEvents";
import { useCompanySettings } from "@/contexts/CompanySettingsContext";
import { LoanInstallment } from "@/hooks/useLoans";
import { toast } from "sonner";
import { formatDisplayDate } from "@/lib/dateUtils";

interface SkipInstallmentDialogProps {
  installment: LoanInstallment | null;
  loanId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SkipInstallmentDialog({
  installment,
  loanId,
  open,
  onOpenChange,
}: SkipInstallmentDialogProps) {
  const { formatCurrency } = useCompanySettings();
  const skipInstallment = useSkipInstallment();
  const [reason, setReason] = useState("Employee request");

  const handleSubmit = async () => {
    if (!installment) return;

    try {
      await skipInstallment.mutateAsync({
        installmentId: installment.id,
        loanId,
        reason,
      });
      toast.success("Installment skipped and rescheduled to end of loan");
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to skip installment");
    }
  };

  if (!installment) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <SkipForward className="h-5 w-5" />
            Skip Installment
          </DialogTitle>
          <DialogDescription>
            This will skip the current installment and add it to the end of the loan schedule.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="rounded-lg border bg-muted/50 p-3 space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Installment #:</span>
              <span className="font-medium">{installment.installment_number}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Due Date:</span>
              <span>{formatDisplayDate(installment.due_date)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Amount:</span>
              <span className="font-medium">{formatCurrency(installment.amount)}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Reason for skipping</Label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter reason..."
              rows={2}
            />
          </div>

          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-200">
            <p className="font-medium">This action will:</p>
            <ul className="list-disc list-inside mt-1 text-xs space-y-0.5">
              <li>Mark this installment as skipped</li>
              <li>Add a new installment at the end of the schedule</li>
              <li>Extend the loan by 1 month</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={skipInstallment.isPending || !reason.trim()}
          >
            {skipInstallment.isPending ? "Skipping..." : "Skip & Reschedule"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
