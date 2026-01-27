import { useState } from 'react';
import { format, parseISO, addYears } from 'date-fns';
import { Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  usePublicHolidays,
  useBulkCreatePublicHolidays,
  calculateHolidaysCompensation,
} from '@/hooks/usePublicHolidays';
import { useCompanySettingsDb } from '@/hooks/useCompanySettingsDb';
import { Skeleton } from '@/components/ui/skeleton';

interface CopyYearHolidaysDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetYear: number;
}

export function CopyYearHolidaysDialog({
  open,
  onOpenChange,
  targetYear,
}: CopyYearHolidaysDialogProps) {
  const sourceYear = targetYear - 1;
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [clearExisting, setClearExisting] = useState(false);
  
  const { data: sourceHolidays, isLoading } = usePublicHolidays(sourceYear);
  const { data: targetHolidays } = usePublicHolidays(targetYear);
  const { settings } = useCompanySettingsDb();
  const bulkCreate = useBulkCreatePublicHolidays();
  
  const weekendDays = (settings as any)?.branding?.weekendDays || [5, 6];
  
  const handleSelectAll = () => {
    if (!sourceHolidays) return;
    if (selectedIds.length === sourceHolidays.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(sourceHolidays.map(h => h.id));
    }
  };
  
  const handleToggle = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };
  
  const handleCopy = () => {
    if (!sourceHolidays || selectedIds.length === 0) return;
    
    const selectedHolidays = sourceHolidays.filter(h => selectedIds.includes(h.id));
    
    // Shift dates by 1 year
    const shiftedHolidays = selectedHolidays.map(h => ({
      name: h.name,
      date: addYears(parseISO(h.date), 1),
    }));
    
    // Get existing target holidays' observed dates if not clearing
    const existingObservedDates = clearExisting 
      ? new Set<string>() 
      : new Set(targetHolidays?.map(h => h.observed_date) || []);
    
    // Calculate compensation using the new function that groups only consecutive holidays
    const compensationResults = calculateHolidaysCompensation(
      shiftedHolidays,
      weekendDays,
      existingObservedDates
    );
    
    // Map results to create payload
    const holidaysToCreate = compensationResults.map(result => ({
      name: result.name,
      date: format(result.date, 'yyyy-MM-dd'),
      observed_date: format(result.observedDate, 'yyyy-MM-dd'),
      year: targetYear,
      is_compensated: result.isCompensated,
      compensation_reason: result.reason,
    }));
    
    bulkCreate.mutate(holidaysToCreate, {
      onSuccess: () => {
        setSelectedIds([]);
        onOpenChange(false);
      }
    });
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg" className="max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Copy className="h-5 w-5" />
            Copy Holidays from {sourceYear}
          </DialogTitle>
          <DialogDescription>
            Select holidays to copy to {targetYear}. Dates will be shifted by 1 year and compensation will be recalculated.
          </DialogDescription>
        </DialogHeader>
        
        {isLoading ? (
          <div className="space-y-3 py-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : !sourceHolidays || sourceHolidays.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            <p>No holidays found in {sourceYear}</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between py-2 border-b">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={selectedIds.length === sourceHolidays.length}
                  onCheckedChange={handleSelectAll}
                />
                <span className="text-sm font-medium">Select All</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {selectedIds.length} of {sourceHolidays.length} selected
              </span>
            </div>
            
            <ScrollArea className="max-h-[40vh]">
              <div className="space-y-2 py-2">
                {sourceHolidays.map((holiday) => (
                  <div
                    key={holiday.id}
                    className="flex items-center gap-3 p-3 rounded-lg border hover:bg-white/60 dark:hover:bg-white/10 hover:shadow-sm cursor-pointer transition-all duration-200"
                    onClick={() => handleToggle(holiday.id)}
                  >
                    <Checkbox
                      checked={selectedIds.includes(holiday.id)}
                      onCheckedChange={() => handleToggle(holiday.id)}
                    />
                    <div className="flex-1">
                      <div className="font-medium text-sm">{holiday.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {format(parseISO(holiday.date), 'MMM d, yyyy')} → {format(addYears(parseISO(holiday.date), 1), 'MMM d, yyyy')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            
            {targetHolidays && targetHolidays.length > 0 && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="space-y-0.5">
                  <Label htmlFor="clear-existing" className="text-sm font-medium">
                    Replace existing holidays
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {targetYear} has {targetHolidays.length} holidays
                  </p>
                </div>
                <Switch
                  id="clear-existing"
                  checked={clearExisting}
                  onCheckedChange={setClearExisting}
                />
              </div>
            )}
          </>
        )}
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleCopy}
            disabled={selectedIds.length === 0 || bulkCreate.isPending}
          >
            Copy {selectedIds.length} Holiday{selectedIds.length !== 1 ? 's' : ''}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
