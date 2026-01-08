import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Calculator, RefreshCw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { useRestructureLoan } from "@/hooks/useLoanEvents";
import { useCompanySettings } from "@/contexts/CompanySettingsContext";
import { LoanWithInstallments } from "@/hooks/useLoans";
import { toast } from "sonner";

interface RestructureLoanDialogProps {
  loan: LoanWithInstallments | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RestructureLoanDialog({
  loan,
  open,
  onOpenChange,
}: RestructureLoanDialogProps) {
  const { formatCurrency } = useCompanySettings();
  const restructureLoan = useRestructureLoan();

  const [effectiveDate, setEffectiveDate] = useState<Date>(new Date());
  const [topUpAmount, setTopUpAmount] = useState("");
  const [repaymentMethod, setRepaymentMethod] = useState<"installment" | "duration">("installment");
  const [newInstallmentAmount, setNewInstallmentAmount] = useState("");
  const [newDurationMonths, setNewDurationMonths] = useState("");
  const [notes, setNotes] = useState("");

  // Calculate outstanding balance
  const calculateOutstanding = () => {
    if (!loan) return 0;
    const paidAmount = loan.installments
      .filter((i) => i.status === "paid")
      .reduce((sum, i) => sum + Number(i.amount), 0);
    return Number(loan.principal_amount) - paidAmount;
  };

  const outstandingBalance = calculateOutstanding();
  const topUp = parseFloat(topUpAmount) || 0;
  const newPrincipal = outstandingBalance + topUp;

  // Calculate preview based on method
  const calculatePreview = () => {
    if (repaymentMethod === "installment") {
      const amount = parseFloat(newInstallmentAmount) || 0;
      if (amount <= 0) return { months: 0, installment: 0 };
      return {
        months: Math.ceil(newPrincipal / amount),
        installment: amount,
      };
    } else {
      const months = parseInt(newDurationMonths) || 0;
      if (months <= 0) return { months: 0, installment: 0 };
      return {
        months,
        installment: Math.round((newPrincipal / months) * 100) / 100,
      };
    }
  };

  const preview = calculatePreview();

  // Reset form when dialog opens
  useEffect(() => {
    if (open && loan) {
      setEffectiveDate(new Date());
      setTopUpAmount("");
      setNewInstallmentAmount(loan.installment_amount?.toString() || "");
      setNewDurationMonths("");
      setNotes("");
      setRepaymentMethod("installment");
    }
  }, [open, loan]);

  const handleSubmit = async () => {
    if (!loan) return;

    try {
      await restructureLoan.mutateAsync({
        loanId: loan.id,
        effectiveDate: format(effectiveDate, "yyyy-MM-dd"),
        topUpAmount: topUp > 0 ? topUp : undefined,
        newInstallmentAmount: repaymentMethod === "installment" ? parseFloat(newInstallmentAmount) : undefined,
        newDurationMonths: repaymentMethod === "duration" ? parseInt(newDurationMonths) : undefined,
        notes,
      });
      toast.success("Loan restructured successfully");
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to restructure loan");
    }
  };

  const isValid =
    effectiveDate &&
    ((repaymentMethod === "installment" && parseFloat(newInstallmentAmount) > 0) ||
      (repaymentMethod === "duration" && parseInt(newDurationMonths) > 0));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Restructure Loan
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Current Status */}
          <div className="rounded-lg border bg-muted/50 p-3">
            <p className="text-sm font-medium mb-1">Current Loan Status</p>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Outstanding Balance:</span>
              <span className="font-medium">{formatCurrency(outstandingBalance)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Remaining Installments:</span>
              <span>
                {loan?.installments.filter((i) => i.status === "due").length || 0} @{" "}
                {formatCurrency(loan?.installment_amount || 0)}/mo
              </span>
            </div>
          </div>

          {/* Effective Date */}
          <div className="space-y-2">
            <Label>Effective Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !effectiveDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {effectiveDate ? format(effectiveDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={effectiveDate}
                  onSelect={(date) => date && setEffectiveDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Top-up Amount */}
          <div className="space-y-2">
            <Label>Top-up Amount (optional)</Label>
            <Input
              type="number"
              placeholder="0.00"
              value={topUpAmount}
              onChange={(e) => setTopUpAmount(e.target.value)}
            />
            {topUp > 0 && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Calculator className="h-3 w-3" />
                New principal: {formatCurrency(newPrincipal)}
              </p>
            )}
          </div>

          {/* Repayment Method */}
          <div className="space-y-3">
            <Label>Repayment Method</Label>
            <RadioGroup value={repaymentMethod} onValueChange={(v) => setRepaymentMethod(v as any)}>
              <div className="flex items-start space-x-2">
                <RadioGroupItem value="installment" id="installment" className="mt-1" />
                <div className="flex-1 space-y-2">
                  <Label htmlFor="installment" className="font-normal cursor-pointer">
                    Fixed Monthly Installment
                  </Label>
                  {repaymentMethod === "installment" && (
                    <>
                      <Input
                        type="number"
                        placeholder="Amount per month"
                        value={newInstallmentAmount}
                        onChange={(e) => setNewInstallmentAmount(e.target.value)}
                      />
                      {preview.months > 0 && (
                        <p className="text-xs text-muted-foreground">
                          → {preview.months} installments
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <RadioGroupItem value="duration" id="duration" className="mt-1" />
                <div className="flex-1 space-y-2">
                  <Label htmlFor="duration" className="font-normal cursor-pointer">
                    Fixed Duration
                  </Label>
                  {repaymentMethod === "duration" && (
                    <>
                      <Input
                        type="number"
                        placeholder="Number of months"
                        value={newDurationMonths}
                        onChange={(e) => setNewDurationMonths(e.target.value)}
                      />
                      {preview.installment > 0 && (
                        <p className="text-xs text-muted-foreground">
                          → {formatCurrency(preview.installment)}/mo installments
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>Notes (optional)</Label>
            <Textarea
              placeholder="Reason for restructuring..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isValid || restructureLoan.isPending}
          >
            {restructureLoan.isPending ? "Applying..." : "Apply Restructure"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
