import { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
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
import {
  useCreatePublicHoliday,
  useUpdatePublicHoliday,
  calculateGroupedHolidayCompensation,
  PublicHoliday,
} from '@/hooks/usePublicHolidays';
import { useCompanySettingsDb } from '@/hooks/useCompanySettingsDb';

interface HolidayFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  year: number;
  existingHolidays: PublicHoliday[];
  editingHoliday?: PublicHoliday | null;
}

export function HolidayFormDialog({
  open,
  onOpenChange,
  year,
  existingHolidays,
  editingHoliday,
}: HolidayFormDialogProps) {
  const [name, setName] = useState('');
  const [date, setDate] = useState<Date | undefined>(undefined);
  
  const { settings } = useCompanySettingsDb();
  const createHoliday = useCreatePublicHoliday();
  const updateHoliday = useUpdatePublicHoliday();
  
  const weekendDays = (settings as any)?.branding?.weekendDays || [5, 6];
  
  useEffect(() => {
    if (editingHoliday) {
      setName(editingHoliday.name);
      setDate(parseISO(editingHoliday.date));
    } else {
      setName('');
      setDate(undefined);
    }
  }, [editingHoliday, open]);
  
  const handleSubmit = () => {
    if (!name || !date) return;
    
    const allHolidayDates = [
      ...existingHolidays
        .filter(h => !editingHoliday || h.id !== editingHoliday.id)
        .map(h => ({ name: h.name, date: parseISO(h.date) })),
      { name, date }
    ];
    
    const compensationResults = calculateGroupedHolidayCompensation(
      allHolidayDates,
      weekendDays
    );
    
    const result = compensationResults.find(
      r => format(r.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd') && r.name === name
    );
    
    if (!result) return;
    
    const holidayData = {
      name,
      date: format(date, 'yyyy-MM-dd'),
      observed_date: format(result.observedDate, 'yyyy-MM-dd'),
      year: date.getFullYear(),
      is_compensated: result.isCompensated,
      compensation_reason: result.reason,
    };
    
    if (editingHoliday) {
      updateHoliday.mutate(
        { id: editingHoliday.id, ...holidayData },
        { onSuccess: () => onOpenChange(false) }
      );
    } else {
      createHoliday.mutate(holidayData, {
        onSuccess: () => onOpenChange(false)
      });
    }
  };
  
  const getCompensationPreview = () => {
    if (!date) return null;
    
    const allHolidayDates = [
      ...existingHolidays
        .filter(h => !editingHoliday || h.id !== editingHoliday.id)
        .map(h => ({ name: h.name, date: parseISO(h.date) })),
      { name: name || 'New Holiday', date }
    ];
    
    const compensationResults = calculateGroupedHolidayCompensation(
      allHolidayDates,
      weekendDays
    );
    
    return compensationResults.find(
      r => format(r.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );
  };
  
  const preview = getCompensationPreview();
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editingHoliday ? 'Edit Holiday' : 'Add Public Holiday'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="holidayName">Holiday Name</Label>
            <Input
              id="holidayName"
              placeholder="e.g., National Day"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, 'PPP') : 'Select date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  defaultMonth={new Date(year, 0)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          {preview && (
            <div className="p-3 rounded-lg bg-muted/50 text-sm">
              {preview.isCompensated ? (
                <p className="text-muted-foreground">
                  <span className="text-amber-600 font-medium">Weekend Compensation: </span>
                  Observed on {format(preview.observedDate, 'EEEE, MMM d, yyyy')}
                  {preview.reason && <span className="block text-xs mt-1">{preview.reason}</span>}
                </p>
              ) : (
                <p className="text-muted-foreground">
                  <span className="text-green-600 font-medium">Working Day: </span>
                  No compensation needed
                </p>
              )}
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!name || !date || createHoliday.isPending || updateHoliday.isPending}
          >
            {editingHoliday ? 'Save Changes' : 'Add Holiday'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
