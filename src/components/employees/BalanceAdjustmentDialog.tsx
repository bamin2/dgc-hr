import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { SlidersHorizontal } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useUpdateLeaveBalance, useLeaveBalances } from '@/hooks/useLeaveBalances';
import { toast } from 'sonner';

const formSchema = z.object({
  adjustmentType: z.enum(['add', 'subtract', 'set']),
  days: z.number().min(0.5, 'Must be at least 0.5').max(365, 'Cannot exceed 365'),
  reason: z.string().min(1, 'Please provide a reason'),
});

type FormData = z.infer<typeof formSchema>;

interface BalanceAdjustmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  balanceId: string;
  leaveTypeId: string;
  leaveTypeName: string;
  employeeId: string;
}

export function BalanceAdjustmentDialog({
  open,
  onOpenChange,
  balanceId,
  leaveTypeId,
  leaveTypeName,
  employeeId,
}: BalanceAdjustmentDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const updateLeaveBalance = useUpdateLeaveBalance();
  const { data: balances } = useLeaveBalances(employeeId, new Date().getFullYear());
  
  const currentBalance = balances?.find(b => b.id === balanceId);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      adjustmentType: 'add',
      days: 1,
      reason: '',
    },
  });

  const watchAdjustmentType = form.watch('adjustmentType');
  const watchDays = form.watch('days');

  // Calculate new total based on adjustment type
  const getNewTotal = () => {
    if (!currentBalance) return 0;
    const currentTotal = currentBalance.total_days;
    const days = watchDays || 0;
    
    switch (watchAdjustmentType) {
      case 'add':
        return currentTotal + days;
      case 'subtract':
        return currentTotal - days;
      case 'set':
        return days;
      default:
        return currentTotal;
    }
  };

  const handleSubmit = async (data: FormData) => {
    if (!currentBalance) return;
    
    setIsSubmitting(true);
    
    try {
      const newTotal = getNewTotal();
      
      await updateLeaveBalance.mutateAsync({
        id: balanceId,
        total_days: newTotal,
      });

      toast.success(`Balance adjusted to ${newTotal} days`);
      form.reset();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(`Failed to adjust balance: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <SlidersHorizontal className="h-5 w-5" />
            Adjust {leaveTypeName} Balance
          </DialogTitle>
          <DialogDescription>
            Current balance: {currentBalance?.total_days || 0} days total, {currentBalance?.used_days || 0} used
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="adjustmentType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Adjustment Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select adjustment type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="add">Add days</SelectItem>
                      <SelectItem value="subtract">Subtract days</SelectItem>
                      <SelectItem value="set">Set to specific amount</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="days"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Days</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.5"
                      min="0.5"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormDescription>
                    New total will be: <strong>{getNewTotal()}</strong> days
                    {getNewTotal() < 0 && (
                      <span className="text-amber-600 ml-1">(negative balance)</span>
                    )}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Reason for adjustment..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Adjustment'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
