import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Banknote } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useMakeAdHocPayment, LoanWithInstallments } from "@/hooks/useLoans";
import { useCompanySettings } from "@/contexts/CompanySettingsContext";
import { toast } from "sonner";

const formSchema = z.object({
  amount: z.coerce.number().positive("Amount must be positive"),
  reschedule_option: z.enum(["reduce_duration", "reduce_amount", "apply_next"]),
});

type FormData = z.infer<typeof formSchema>;

interface AdHocPaymentDialogProps {
  loan: LoanWithInstallments | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AdHocPaymentDialog({ 
  loan, 
  open, 
  onOpenChange,
}: AdHocPaymentDialogProps) {
  const makePayment = useMakeAdHocPayment();
  const { formatCurrency, getCurrencySymbol } = useCompanySettings();

  // Calculate outstanding balance
  const paidAmount = loan?.installments
    ?.filter(i => i.status === "paid")
    .reduce((sum, i) => sum + i.amount, 0) || 0;
  const outstandingBalance = (loan?.principal_amount || 0) - paidAmount;
  const remainingInstallments = loan?.installments?.filter(i => i.status === "due").length || 0;
  const currentInstallmentAmount = loan?.installment_amount || 0;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: 0,
      reschedule_option: "reduce_duration",
    },
  });

  const paymentAmount = form.watch("amount") || 0;
  const rescheduleOption = form.watch("reschedule_option");
  const newBalance = Math.max(0, outstandingBalance - paymentAmount);

  // Calculate preview based on option
  let previewText = "";
  if (paymentAmount > 0 && newBalance > 0) {
    if (rescheduleOption === "reduce_duration") {
      const newInstallments = Math.ceil(newBalance / currentInstallmentAmount);
      previewText = `${newInstallments} installments remaining at ${formatCurrency(currentInstallmentAmount)}/mo`;
    } else if (rescheduleOption === "reduce_amount") {
      const newAmount = newBalance / remainingInstallments;
      previewText = `${remainingInstallments} installments at ${formatCurrency(newAmount)}/mo`;
    } else {
      previewText = `Payment applied to next due installment(s)`;
    }
  } else if (paymentAmount >= outstandingBalance) {
    previewText = "Loan will be fully paid off";
  }

  const onSubmit = async (data: FormData) => {
    if (!loan) return;
    
    try {
      await makePayment.mutateAsync({
        loanId: loan.id,
        amount: data.amount,
        rescheduleOption: data.reschedule_option,
      });
      toast.success("Payment recorded successfully");
      onOpenChange(false);
      form.reset();
    } catch (error) {
      toast.error("Failed to record payment");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Banknote className="h-5 w-5" />
            Make Payment
          </DialogTitle>
          <DialogDescription>
            Record an ad hoc payment for this loan
          </DialogDescription>
        </DialogHeader>

        {/* Current Balance Summary */}
        <div className="rounded-lg border p-3 bg-muted/50 space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Outstanding Balance</span>
            <span className="font-medium">{formatCurrency(outstandingBalance)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Remaining Installments</span>
            <span className="font-medium">{remainingInstallments}</span>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Amount ({getCurrencySymbol()})</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.01" 
                      min="0" 
                      max={outstandingBalance}
                      {...field} 
                    />
                  </FormControl>
                  {paymentAmount > 0 && (
                    <FormDescription>
                      After payment: {formatCurrency(newBalance)} remaining
                    </FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            <FormField
              control={form.control}
              name="reschedule_option"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>How should we handle the remaining balance?</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="space-y-3"
                    >
                      <div className="flex items-start space-x-3 rounded-lg border p-3">
                        <RadioGroupItem value="reduce_duration" id="reduce_duration" className="mt-0.5" />
                        <div>
                          <Label htmlFor="reduce_duration" className="font-medium">
                            Keep same monthly amount
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            Fewer installments, same payment amount
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3 rounded-lg border p-3">
                        <RadioGroupItem value="reduce_amount" id="reduce_amount" className="mt-0.5" />
                        <div>
                          <Label htmlFor="reduce_amount" className="font-medium">
                            Keep same duration
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            Same number of installments, lower payments
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3 rounded-lg border p-3">
                        <RadioGroupItem value="apply_next" id="apply_next" className="mt-0.5" />
                        <div>
                          <Label htmlFor="apply_next" className="font-medium">
                            Apply to next due installment(s)
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            Mark upcoming installments as paid
                          </p>
                        </div>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Preview */}
            {previewText && (
              <div className="rounded-lg bg-primary/10 p-3">
                <p className="text-sm font-medium text-primary">Preview</p>
                <p className="text-sm">{previewText}</p>
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={makePayment.isPending || paymentAmount <= 0}
              >
                {makePayment.isPending ? "Recording..." : "Record Payment"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
