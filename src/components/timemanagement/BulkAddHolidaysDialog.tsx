import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { Calendar as CalendarIcon, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  useBulkCreatePublicHolidays,
  calculateGroupedHolidayCompensation,
  PublicHoliday,
} from '@/hooks/usePublicHolidays';
import { useCompanySettingsDb } from '@/hooks/useCompanySettingsDb';

interface HolidayEntry {
  id: string;
  name: string;
  date: Date | undefined;
}

interface BulkAddHolidaysDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  year: number;
  existingHolidays: PublicHoliday[];
}

export function BulkAddHolidaysDialog({
  open,
  onOpenChange,
  year,
  existingHolidays,
}: BulkAddHolidaysDialogProps) {
  const [entries, setEntries] = useState<HolidayEntry[]>([
    { id: crypto.randomUUID(), name: '', date: undefined },
  ]);
  
  const { settings } = useCompanySettingsDb();
  const bulkCreate = useBulkCreatePublicHolidays();
  
  const weekendDays = (settings as any)?.branding?.weekendDays || [5, 6];
  
  const addEntry = () => {
    setEntries([...entries, { id: crypto.randomUUID(), name: '', date: undefined }]);
  };
  
  const removeEntry = (id: string) => {
    if (entries.length <= 1) return;
    setEntries(entries.filter(e => e.id !== id));
  };
  
  const updateEntry = (id: string, field: 'name' | 'date', value: string | Date | undefined) => {
    setEntries(entries.map(e => 
      e.id === id ? { ...e, [field]: value } : e
    ));
  };
  
  const handleSubmit = () => {
    const validEntries = entries.filter(e => e.name && e.date);
    if (validEntries.length === 0) return;
    
    // Combine existing holidays with new ones for compensation calculation
    const allHolidayDates = [
      ...existingHolidays.map(h => ({ name: h.name, date: parseISO(h.date) })),
      ...validEntries.map(e => ({ name: e.name, date: e.date! })),
    ];
    
    const compensationResults = calculateGroupedHolidayCompensation(
      allHolidayDates,
      weekendDays
    );
    
    // Find results for new entries only
    const holidaysToCreate = validEntries.map(entry => {
      const result = compensationResults.find(
        r => format(r.date, 'yyyy-MM-dd') === format(entry.date!, 'yyyy-MM-dd') && r.name === entry.name
      );
      
      return {
        name: entry.name,
        date: format(entry.date!, 'yyyy-MM-dd'),
        observed_date: format(result?.observedDate || entry.date!, 'yyyy-MM-dd'),
        year: entry.date!.getFullYear(),
        is_compensated: result?.isCompensated || false,
        compensation_reason: result?.reason || null,
      };
    });
    
    bulkCreate.mutate(holidaysToCreate, {
      onSuccess: () => {
        setEntries([{ id: crypto.randomUUID(), name: '', date: undefined }]);
        onOpenChange(false);
      }
    });
  };
  
  const validCount = entries.filter(e => e.name && e.date).length;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="2xl" className="max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Add Multiple Holidays</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[50vh] pr-4">
          <div className="space-y-4 py-4">
            {entries.map((entry, index) => (
              <div key={entry.id} className="flex items-end gap-3 p-3 rounded-lg border bg-muted/20">
                <div className="flex-1 space-y-2">
                  <Label htmlFor={`name-${entry.id}`}>Holiday Name</Label>
                  <Input
                    id={`name-${entry.id}`}
                    placeholder="e.g., National Day"
                    value={entry.name}
                    onChange={(e) => updateEntry(entry.id, 'name', e.target.value)}
                  />
                </div>
                
                <div className="w-48 space-y-2">
                  <Label>Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !entry.date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {entry.date ? format(entry.date, 'MMM d, yyyy') : 'Select'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={entry.date}
                        onSelect={(d) => updateEntry(entry.id, 'date', d)}
                        defaultMonth={new Date(year, 0)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-muted-foreground hover:text-destructive"
                  onClick={() => removeEntry(entry.id)}
                  disabled={entries.length <= 1}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
        
        <Button
          variant="outline"
          onClick={addEntry}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Another Holiday
        </Button>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={validCount === 0 || bulkCreate.isPending}
          >
            Add {validCount} Holiday{validCount !== 1 ? 's' : ''}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
