import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Smartphone, Loader2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRecordPhonePayment } from '@/hooks/useBenefitTracking';
import { useToast } from '@/hooks/use-toast';
import { useCompanySettings } from '@/contexts/CompanySettingsContext';
import type { PhoneConfig, PhoneData } from '@/types/benefits';

interface PhonePaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  enrollmentId: string;
  employeeName: string;
  config: PhoneConfig;
  currentData: PhoneData | null;
}

export const PhonePaymentDialog = ({
  open,
  onOpenChange,
  enrollmentId,
  employeeName,
  config,
  currentData,
}: PhonePaymentDialogProps) => {
  const [paymentAmount, setPaymentAmount] = useState(config.monthly_installment.toString());

  const { toast } = useToast();
  const { formatCurrency } = useCompanySettings();
  const recordPayment = useRecordPhonePayment();

  const installmentsPaid = currentData?.installments_paid || 0;
  const totalPaid = currentData?.total_paid || 0;
  const remainingBalance = currentData?.remaining_balance ?? config.total_device_cost;
  const isFullyPaid = remainingBalance <= 0;
  const progressPercent = Math.min(100, (totalPaid / config.total_device_cost) * 100);

  const handleSubmit = async () => {
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) return;

    try {
      await recordPayment.mutateAsync({
        enrollmentId,
        paymentAmount: amount,
      });

      toast({
        title: 'Payment Recorded',
        description: `${formatCurrency(amount)} payment recorded for ${employeeName}.`,
      });

      setPaymentAmount(config.monthly_installment.toString());
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to record payment. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-violet-600" />
            Phone Payment Tracking
          </DialogTitle>
          <DialogDescription>
            Record phone installment payment for {employeeName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Progress Overview */}
          <div className="p-4 bg-muted/50 rounded-lg space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total Device Cost</span>
              <span className="font-medium">{formatCurrency(config.total_device_cost)}</span>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">
                  {installmentsPaid} / {config.installment_months} payments
                </span>
              </div>
              <Progress value={progressPercent} className="h-2" />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2 border-t">
              <div>
                <p className="text-xs text-muted-foreground">Total Paid</p>
                <p className={cn(
                  'font-semibold',
                  isFullyPaid ? 'text-emerald-600' : ''
                )}>
                  {formatCurrency(totalPaid)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Remaining</p>
                <p className={cn(
                  'font-semibold',
                  isFullyPaid ? 'text-emerald-600' : 'text-amber-600'
                )}>
                  {formatCurrency(remainingBalance)}
                </p>
              </div>
            </div>
          </div>

          {/* Fully Paid Status */}
          {isFullyPaid ? (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center">
                <Check className="h-4 w-4 text-emerald-600" />
              </div>
              <div>
                <p className="font-medium text-emerald-700 dark:text-emerald-400">Fully Paid!</p>
                <p className="text-sm text-emerald-600 dark:text-emerald-500">
                  All installments have been completed.
                </p>
              </div>
            </div>
          ) : (
            /* Record Payment Form */
            <div className="space-y-4 border-t pt-4">
              <div className="space-y-2">
                <Label>Payment Amount</Label>
                <div className="relative">
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="pr-16"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    BHD
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Expected monthly: {formatCurrency(config.monthly_installment)}
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {!isFullyPaid && (
            <Button
              onClick={handleSubmit}
              disabled={!paymentAmount || parseFloat(paymentAmount) <= 0 || recordPayment.isPending}
            >
              {recordPayment.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Record Payment
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
