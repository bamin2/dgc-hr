import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  AttendanceRecord,
  AttendanceStatus,
  useCreateAttendanceRecord,
  useUpdateAttendanceRecord,
} from '@/hooks/useAttendanceRecords';
import { useEmployees } from '@/hooks/useEmployees';

const attendanceSchema = z.object({
  employee_id: z.string().min(1, 'Employee is required'),
  date: z.date({ required_error: 'Date is required' }),
  check_in: z.string().optional(),
  check_out: z.string().optional(),
  status: z.enum(['present', 'absent', 'late', 'on_leave', 'half_day', 'remote']),
  work_hours: z.number().min(0).max(24),
  notes: z.string().optional(),
});

type AttendanceFormValues = z.infer<typeof attendanceSchema>;

interface EditAttendanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record?: AttendanceRecord | null;
}

const statusOptions: { value: AttendanceStatus; label: string }[] = [
  { value: 'present', label: 'Present' },
  { value: 'absent', label: 'Absent' },
  { value: 'late', label: 'Late' },
  { value: 'on_leave', label: 'On Leave' },
  { value: 'half_day', label: 'Half Day' },
  { value: 'remote', label: 'Remote' },
];

function calculateWorkHours(checkIn?: string, checkOut?: string): number {
  if (!checkIn || !checkOut) return 0;
  const [inH, inM] = checkIn.split(':').map(Number);
  const [outH, outM] = checkOut.split(':').map(Number);
  const inMinutes = inH * 60 + inM;
  const outMinutes = outH * 60 + outM;
  const diff = outMinutes - inMinutes;
  return diff > 0 ? Math.round((diff / 60) * 100) / 100 : 0;
}

export function EditAttendanceDialog({
  open,
  onOpenChange,
  record,
}: EditAttendanceDialogProps) {
  const isEditMode = !!record;
  const { data: employees = [] } = useEmployees();
  const createMutation = useCreateAttendanceRecord();
  const updateMutation = useUpdateAttendanceRecord();

  const form = useForm<AttendanceFormValues>({
    resolver: zodResolver(attendanceSchema),
    defaultValues: {
      employee_id: '',
      date: new Date(),
      check_in: '',
      check_out: '',
      status: 'present',
      work_hours: 0,
      notes: '',
    },
  });

  // Reset form when dialog opens/closes or record changes
  useEffect(() => {
    if (open) {
      if (record) {
        form.reset({
          employee_id: record.employee_id,
          date: new Date(record.date),
          check_in: record.check_in?.slice(0, 5) || '',
          check_out: record.check_out?.slice(0, 5) || '',
          status: record.status,
          work_hours: record.work_hours || 0,
          notes: record.notes || '',
        });
      } else {
        form.reset({
          employee_id: '',
          date: new Date(),
          check_in: '',
          check_out: '',
          status: 'present',
          work_hours: 0,
          notes: '',
        });
      }
    }
  }, [open, record, form]);

  // Auto-calculate work hours
  const checkIn = form.watch('check_in');
  const checkOut = form.watch('check_out');

  useEffect(() => {
    const hours = calculateWorkHours(checkIn, checkOut);
    if (hours > 0) {
      form.setValue('work_hours', hours);
    }
  }, [checkIn, checkOut, form]);

  const onSubmit = async (values: AttendanceFormValues) => {
    const payload = {
      employee_id: values.employee_id,
      date: format(values.date, 'yyyy-MM-dd'),
      check_in: values.check_in || null,
      check_out: values.check_out || null,
      status: values.status,
      work_hours: values.work_hours,
      notes: values.notes || null,
    };

    if (isEditMode && record) {
      await updateMutation.mutateAsync({ id: record.id, ...payload });
    } else {
      await createMutation.mutateAsync(payload);
    }
    onOpenChange(false);
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? 'Edit Attendance Record' : 'Add Attendance Record'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Employee Select (only for new records) */}
            {!isEditMode && (
              <FormField
                control={form.control}
                name="employee_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Employee</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select employee" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {employees.map((emp) => (
                          <SelectItem key={emp.id} value={emp.id}>
                            {emp.first_name} {emp.last_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Date Picker */}
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date</FormLabel>
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
                          {field.value ? format(field.value, 'PPP') : 'Pick a date'}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date > new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Check In / Check Out */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="check_in"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Check In</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="check_out"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Check Out</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Status / Work Hours */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {statusOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="work_hours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Work Hours</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.5"
                        min="0"
                        max="24"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Optional notes about this attendance record"
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditMode ? 'Save Changes' : 'Add Record'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
