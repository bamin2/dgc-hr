import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { CalendarIcon, Loader2, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useUpdateBenefitEnrollment } from '@/hooks/useBenefitEnrollments';
import { useToast } from '@/hooks/use-toast';
import type { BenefitEnrollment } from '@/hooks/useBenefitEnrollments';

interface EndEnrollmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  enrollment: BenefitEnrollment | null;
}

export const EndEnrollmentDialog = ({
  open,
  onOpenChange,
  enrollment,
}: EndEnrollmentDialogProps) => {
  const { toast } = useToast();
  const [endDate, setEndDate] = useState<Date>();
  const updateEnrollment = useUpdateBenefitEnrollment();

  const handleEndEnrollment = async () => {
    if (!enrollment || !endDate) return;

    try {
      await updateEnrollment.mutateAsync({
        id: enrollment.id,
        status: 'cancelled',
        end_date: format(endDate, 'yyyy-MM-dd'),
      });
      
      toast({
        title: 'Enrollment Ended',
        description: `Enrollment has been ended effective ${format(endDate, 'MMM d, yyyy')}.`,
      });
      
      onOpenChange(false);
      setEndDate(undefined);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to end enrollment. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (!enrollment) return null;

  const employee = enrollment.employee;
  const plan = enrollment.plan;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            End Enrollment
          </DialogTitle>
          <DialogDescription>
            This will cancel the benefit enrollment for{' '}
            <span className="font-medium text-foreground">
              {employee?.first_name} {employee?.last_name}
            </span>{' '}
            from <span className="font-medium text-foreground">{plan?.name}</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>End Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !endDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, 'PPP') : 'Select end date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  disabled={(date) => date < new Date(enrollment.start_date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <p className="text-xs text-muted-foreground">
              The enrollment will be marked as cancelled from this date.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              setEndDate(undefined);
            }}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleEndEnrollment}
            disabled={!endDate || updateEnrollment.isPending}
          >
            {updateEnrollment.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            End Enrollment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
