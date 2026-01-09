import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format, differenceInCalendarDays } from 'date-fns';
import { CalendarIcon, Plus } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { useLeaveTypes } from '@/hooks/useLeaveTypes';
import { useUpdateLeaveBalance, useLeaveBalances } from '@/hooks/useLeaveBalances';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const formSchema = z.object({
  leaveTypeId: z.string().min(1, 'Please select a leave type'),
  startDate: z.date({ required_error: 'Start date is required' }),
  endDate: z.date({ required_error: 'End date is required' }),
  isHalfDay: z.boolean().default(false),
  reason: z.string().optional(),
}).refine((data) => data.endDate >= data.startDate, {
  message: 'End date must be on or after start date',
  path: ['endDate'],
});

type FormData = z.infer<typeof formSchema>;

interface AdminAddLeaveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employeeId: string;
}

export function AdminAddLeaveDialog({ open, onOpenChange, employeeId }: AdminAddLeaveDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { data: leaveTypes, isLoading: loadingTypes } = useLeaveTypes();
  const { data: balances } = useLeaveBalances(employeeId, new Date().getFullYear());
  const updateLeaveBalance = useUpdateLeaveBalance();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      leaveTypeId: '',
      isHalfDay: false,
      reason: '',
    },
  });

  const watchStartDate = form.watch('startDate');
  const watchEndDate = form.watch('endDate');
  const watchIsHalfDay = form.watch('isHalfDay');

  // Calculate days count
  const daysCount = (() => {
    if (!watchStartDate || !watchEndDate) return 0;
    const days = differenceInCalendarDays(watchEndDate, watchStartDate) + 1;
    return watchIsHalfDay ? 0.5 : days;
  })();

  const queryClient = useQueryClient();

  const handleSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    
    try {
      // Create leave request with approved status directly via supabase
      const { error: insertError } = await supabase
        .from('leave_requests')
        .insert({
          employee_id: employeeId,
          leave_type_id: data.leaveTypeId,
          start_date: format(data.startDate, 'yyyy-MM-dd'),
          end_date: format(data.endDate, 'yyyy-MM-dd'),
          days_count: daysCount,
          is_half_day: data.isHalfDay,
          reason: data.reason || 'Added by admin',
          status: 'approved', // Directly approved - bypasses workflow
          reviewed_at: new Date().toISOString(),
        });

      if (insertError) throw insertError;

      // Update the leave balance - increment used_days
      const balance = balances?.find(b => b.leave_type_id === data.leaveTypeId);
      if (balance) {
        await updateLeaveBalance.mutateAsync({
          id: balance.id,
          used_days: (balance.used_days || 0) + daysCount,
        });
      }

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['leave-requests'] });
      queryClient.invalidateQueries({ queryKey: ['leave-balances'] });

      toast.success('Leave entry added successfully');
      form.reset();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(`Failed to add leave entry: ${error.message}`);
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add Leave Entry
          </DialogTitle>
          <DialogDescription>
            Record leave directly without approval workflow. The leave will be marked as approved immediately.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="leaveTypeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Leave Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select leave type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {leaveTypes?.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: type.color || '#3b82f6' }}
                            />
                            {type.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Start Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? format(field.value, 'MMM d, yyyy') : 'Pick a date'}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>End Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? format(field.value, 'MMM d, yyyy') : 'Pick a date'}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => watchStartDate && date < watchStartDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {daysCount > 0 && (
              <div className="p-3 bg-muted rounded-lg text-sm">
                <span className="font-medium">{daysCount}</span> day{daysCount !== 1 ? 's' : ''} will be deducted from the balance
              </div>
            )}

            <FormField
              control={form.control}
              name="isHalfDay"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={watchStartDate && watchEndDate && 
                        differenceInCalendarDays(watchEndDate, watchStartDate) > 0}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Half Day</FormLabel>
                    <FormDescription>
                      Mark as half day leave (only for single day)
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason / Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any notes about this leave entry..."
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
              <Button type="submit" disabled={isSubmitting || loadingTypes}>
                {isSubmitting ? 'Adding...' : 'Add Leave Entry'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
