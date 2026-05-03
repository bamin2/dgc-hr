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
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plane, Loader2, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useMarkTicketUsed, useAirTicketUsage, useDeleteTicketUsage } from '@/hooks/useBenefitTracking';
import { useToast } from '@/hooks/use-toast';
import type { AirTicketConfig, AirTicketData } from '@/types/benefits';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface AirTicketUsageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  enrollmentId: string;
  employeeName: string;
  config: AirTicketConfig;
  currentData: AirTicketData | null;
}

export const AirTicketUsageDialog = ({
  open,
  onOpenChange,
  enrollmentId,
  employeeName,
  config,
  currentData,
}: AirTicketUsageDialogProps) => {
  const [usageDate, setUsageDate] = useState<Date | undefined>(new Date());
  const [notes, setNotes] = useState('');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [usageToDelete, setUsageToDelete] = useState<string | null>(null);

  const { toast } = useToast();
  const markTicketUsed = useMarkTicketUsed();
  const deleteTicketUsage = useDeleteTicketUsage();
  const { data: usageHistory = [] } = useAirTicketUsage(enrollmentId);

  const ticketsUsed = currentData?.tickets_used || 0;
  const ticketsRemaining = config.tickets_per_period - ticketsUsed;
  const canUseTicket = ticketsRemaining > 0;

  const handleSubmit = async () => {
    if (!usageDate) return;

    try {
      await markTicketUsed.mutateAsync({
        enrollmentId,
        usageDate: format(usageDate, 'yyyy-MM-dd'),
        notes: notes.trim() || undefined,
      });

      toast({
        title: 'Ticket Marked as Used',
        description: `Air ticket recorded for ${employeeName}.`,
      });

      setNotes('');
      setUsageDate(new Date());
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to record ticket usage. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteClick = (usageId: string) => {
    setUsageToDelete(usageId);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!usageToDelete) return;

    try {
      await deleteTicketUsage.mutateAsync({
        usageId: usageToDelete,
        enrollmentId,
      });

      toast({
        title: 'Usage Removed',
        description: 'Ticket usage record has been removed.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to remove usage record.',
        variant: 'destructive',
      });
    } finally {
      setDeleteConfirmOpen(false);
      setUsageToDelete(null);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plane className="h-5 w-5 text-sky-600" />
              Air Ticket Usage
            </DialogTitle>
            <DialogDescription>
              Record air ticket usage for {employeeName}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Current Status */}
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Entitlement</span>
                <span className="font-medium">
                  {config.tickets_per_period} ticket(s) / {config.period_years} year(s)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <span className={cn(
                  'font-semibold',
                  ticketsRemaining > 0 ? 'text-emerald-600' : 'text-amber-600'
                )}>
                  {ticketsUsed} used / {ticketsRemaining} remaining
                </span>
              </div>
            </div>

            {/* Add New Usage */}
            {canUseTicket && (
              <div className="space-y-4 border-t pt-4">
                <div className="space-y-2">
                  <Label>Usage Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !usageDate && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {usageDate ? format(usageDate, 'PPP') : 'Select date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={usageDate}
                        onSelect={setUsageDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>Notes (Optional)</Label>
                  <Textarea
                    placeholder="e.g., Annual leave trip, destination..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                  />
                </div>
              </div>
            )}

            {!canUseTicket && (
              <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg text-sm text-amber-700 dark:text-amber-400">
                All tickets for this period have been used.
              </div>
            )}

            {/* Usage History */}
            {usageHistory.length > 0 && (
              <div className="space-y-2 border-t pt-4">
                <Label className="text-muted-foreground">Usage History</Label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {usageHistory.map((usage) => (
                    <div
                      key={usage.id}
                      className="flex items-center justify-between p-2 bg-muted/30 rounded text-sm"
                    >
                      <div>
                        <span className="font-medium">
                          {format(new Date(usage.usage_date), 'MMM d, yyyy')}
                        </span>
                        {usage.notes && (
                          <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                            {usage.notes}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleDeleteClick(usage.id)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            {canUseTicket && (
              <Button
                onClick={handleSubmit}
                disabled={!usageDate || markTicketUsed.isPending}
              >
                {markTicketUsed.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Mark Ticket Used
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Usage Record?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the ticket usage record and restore the ticket to the employee's entitlement.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteTicketUsage.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
