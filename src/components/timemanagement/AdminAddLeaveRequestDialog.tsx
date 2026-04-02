import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format, differenceInCalendarDays } from 'date-fns';
import { CalendarIcon, Plus, Check, ChevronsUpDown } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from '@/components/ui/command';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useAllLeaveTypes } from '@/hooks/useLeaveTypes';
import { useUpdateLeaveBalance, useLeaveBalances } from '@/hooks/useLeaveBalances';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const formSchema = z.object({
  employeeId: z.string().min(1, 'Please select an employee'),
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

interface AdminAddLeaveRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function useActiveEmployees() {
  return useQuery({
    queryKey: ['employees', 'active-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employees')
        .select('id, first_name, last_name, avatar_url, department:departments!employees_department_id_fkey(name)')
        .eq('status', 'active')
        .order('first_name');
      if (error) throw error;
      return data || [];
    },
  });
}

export function AdminAddLeaveRequestDialog({ open, onOpenChange }: AdminAddLeaveRequestDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [employeePopoverOpen, setEmployeePopoverOpen] = useState(false);
  const [empSearch, setEmpSearch] = useState('');

  const { data: employees, isLoading: loadingEmployees } = useActiveEmployees();
  const { data: leaveTypes, isLoading: loadingTypes } = useAllLeaveTypes();
  const queryClient = useQueryClient();
  const updateLeaveBalance = useUpdateLeaveBalance();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      employeeId: '',
      leaveTypeId: '',
      isHalfDay: false,
      reason: '',
    },
  });

  const watchEmployeeId = form.watch('employeeId');
  const watchStartDate = form.watch('startDate');
  const watchEndDate = form.watch('endDate');
  const watchIsHalfDay = form.watch('isHalfDay');

  const { data: balances } = useLeaveBalances(watchEmployeeId || undefined, new Date().getFullYear());

  const daysCount = (() => {
    if (!watchStartDate || !watchEndDate) return 0;
    const days = differenceInCalendarDays(watchEndDate, watchStartDate) + 1;
    return watchIsHalfDay ? 0.5 : days;
  })();

  const selectedEmployee = employees?.find(e => e.id === watchEmployeeId);
  const filteredEmps = employees?.filter(e =>
    `${e.first_name} ${e.last_name}`.toLowerCase().includes(empSearch.toLowerCase())
  );

  const handleSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const { error: insertError } = await supabase
        .from('leave_requests')
        .insert({
          employee_id: data.employeeId,
          leave_type_id: data.leaveTypeId,
          start_date: format(data.startDate, 'yyyy-MM-dd'),
          end_date: format(data.endDate, 'yyyy-MM-dd'),
          days_count: daysCount,
          is_half_day: data.isHalfDay,
          reason: data.reason || 'Added by admin',
          status: 'approved',
          reviewed_at: new Date().toISOString(),
        });

      if (insertError) throw insertError;

      const balance = balances?.find(b => b.leave_type_id === data.leaveTypeId);
      if (balance) {
        await updateLeaveBalance.mutateAsync({
          id: balance.id,
          used_days: (balance.used_days || 0) + daysCount,
        });
      }

      queryClient.invalidateQueries({ queryKey: ['leave-requests'] });
      queryClient.invalidateQueries({ queryKey: ['leave-balances'] });

      toast.success('Leave request added successfully');
      form.reset();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(`Failed to add leave request: ${error.message}`);
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
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add Leave Request
          </DialogTitle>
          <DialogDescription>
            Record leave directly for any employee. The leave will be marked as approved immediately.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* Employee Selector */}
            <FormField
              control={form.control}
              name="employeeId"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Employee</FormLabel>
                  <Popover open={employeePopoverOpen} onOpenChange={setEmployeePopoverOpen}>
                    <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            'w-full justify-between font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {selectedEmployee ? (
                            <div className="flex items-center gap-2">
                              <Avatar className="h-5 w-5">
                                <AvatarImage src={selectedEmployee.avatar_url || undefined} />
                                <AvatarFallback className="text-[10px]">
                                  {selectedEmployee.first_name?.[0]}{selectedEmployee.last_name?.[0]}
                                </AvatarFallback>
                              </Avatar>
                              <span>{selectedEmployee.first_name} {selectedEmployee.last_name}</span>
                            </div>
                          ) : (
                            'Select employee...'
                          )}
                          <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-[--radix-popover-trigger-width] p-0"
                      align="start"
                    >
                      <Command shouldFilter={false}>
                        <CommandInput placeholder="Search employees..." value={empSearch} onValueChange={setEmpSearch} />
                        <CommandList className="max-h-[240px] overflow-y-auto overscroll-contain">
                          <CommandEmpty>{loadingEmployees ? 'Loading employees...' : 'No employee found.'}</CommandEmpty>
                          <CommandGroup>
                            {filteredEmps?.map((emp) => (
                              <CommandItem
                                key={emp.id}
                                value={`${emp.first_name} ${emp.last_name}`}
                                onSelect={() => {
                                  field.onChange(emp.id);
                                  setEmployeePopoverOpen(false);
                                }}
                              >
                                <Avatar className="h-5 w-5 mr-2">
                                  <AvatarImage src={emp.avatar_url || undefined} />
                                  <AvatarFallback className="text-[10px]">
                                    {emp.first_name?.[0]}{emp.last_name?.[0]}
                                  </AvatarFallback>
                                </Avatar>
                                <span>{emp.first_name} {emp.last_name}</span>
                                {(emp.department as any)?.name && (
                                  <span className="text-xs text-muted-foreground ml-1">
                                    · {(emp.department as any).name}
                                  </span>
                                )}
                                <Check className={cn(
                                  'ml-auto h-4 w-4',
                                  field.value === emp.id ? 'opacity-100' : 'opacity-0'
                                )} />
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Leave Type */}
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
                              style={{ backgroundColor: type.color || '#14b8a6' }}
                            />
                            {type.name}
                            {!type.is_active && (
                              <span className="text-xs text-muted-foreground">(inactive)</span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Date Pickers */}
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
                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
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

            {/* Half Day */}
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
                    <FormDescription>Mark as half day leave (only for single day)</FormDescription>
                  </div>
                </FormItem>
              )}
            />

            {/* Reason */}
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
              <Button type="button" variant="outline" onClick={handleClose}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting || loadingTypes || loadingEmployees}>
                {isSubmitting ? 'Adding...' : 'Add Leave Request'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
