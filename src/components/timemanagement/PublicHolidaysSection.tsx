import { useState } from 'react';
import { format, parseISO, getDay } from 'date-fns';
import { Calendar as CalendarIcon, Plus, Pencil, Trash2, RefreshCw, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
  usePublicHolidays,
  useCreatePublicHoliday,
  useUpdatePublicHoliday,
  useDeletePublicHoliday,
  useSyncPublicHolidaysToLeave,
  calculateObservedDate,
  calculateGroupedHolidayCompensation,
  PublicHoliday,
} from '@/hooks/usePublicHolidays';
import { useCompanySettingsDb } from '@/hooks/useCompanySettingsDb';
import { Skeleton } from '@/components/ui/skeleton';

interface PublicHolidaysSectionProps {
  className?: string;
}

export function PublicHolidaysSection({ className }: PublicHolidaysSectionProps) {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState<PublicHoliday | null>(null);
  const [newHolidayName, setNewHolidayName] = useState('');
  const [newHolidayDate, setNewHolidayDate] = useState<Date | undefined>(undefined);
  
  const { data: holidays, isLoading: holidaysLoading } = usePublicHolidays(selectedYear);
  const { settings } = useCompanySettingsDb();
  const createHoliday = useCreatePublicHoliday();
  const updateHoliday = useUpdatePublicHoliday();
  const deleteHoliday = useDeletePublicHoliday();
  const syncHolidays = useSyncPublicHolidaysToLeave();
  
  // Get weekend days from settings, default to Fri-Sat
  const weekendDays = (settings as any)?.branding?.weekendDays || [5, 6];
  
  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear + i);
  
  const handleAddHoliday = () => {
    if (!newHolidayName || !newHolidayDate) return;
    
    // Get all existing holidays plus the new one
    const allHolidayDates = [
      ...(holidays?.map(h => ({ name: h.name, date: parseISO(h.date) })) || []),
      { name: newHolidayName, date: newHolidayDate }
    ];
    
    // Calculate grouped compensation for all holidays
    const compensationResults = calculateGroupedHolidayCompensation(
      allHolidayDates,
      weekendDays
    );
    
    // Find the result for the new holiday
    const newHolidayResult = compensationResults.find(
      r => format(r.date, 'yyyy-MM-dd') === format(newHolidayDate, 'yyyy-MM-dd') && r.name === newHolidayName
    );
    
    if (!newHolidayResult) return;
    
    createHoliday.mutate({
      name: newHolidayName,
      date: format(newHolidayDate, 'yyyy-MM-dd'),
      observed_date: format(newHolidayResult.observedDate, 'yyyy-MM-dd'),
      year: newHolidayDate.getFullYear(),
      is_compensated: newHolidayResult.isCompensated,
      compensation_reason: newHolidayResult.reason,
    }, {
      onSuccess: () => {
        setNewHolidayName('');
        setNewHolidayDate(undefined);
        setIsAddDialogOpen(false);
      }
    });
  };
  
  const handleUpdateHoliday = () => {
    if (!editingHoliday || !newHolidayName || !newHolidayDate) return;
    
    // Get all holidays, replacing the edited one with new values
    const allHolidayDates = [
      ...(holidays?.filter(h => h.id !== editingHoliday.id).map(h => ({ name: h.name, date: parseISO(h.date) })) || []),
      { name: newHolidayName, date: newHolidayDate }
    ];
    
    // Calculate grouped compensation for all holidays
    const compensationResults = calculateGroupedHolidayCompensation(
      allHolidayDates,
      weekendDays
    );
    
    // Find the result for the edited holiday
    const editedHolidayResult = compensationResults.find(
      r => format(r.date, 'yyyy-MM-dd') === format(newHolidayDate, 'yyyy-MM-dd') && r.name === newHolidayName
    );
    
    if (!editedHolidayResult) return;
    
    updateHoliday.mutate({
      id: editingHoliday.id,
      name: newHolidayName,
      date: format(newHolidayDate, 'yyyy-MM-dd'),
      observed_date: format(editedHolidayResult.observedDate, 'yyyy-MM-dd'),
      year: newHolidayDate.getFullYear(),
      is_compensated: editedHolidayResult.isCompensated,
      compensation_reason: editedHolidayResult.reason,
    }, {
      onSuccess: () => {
        setEditingHoliday(null);
        setNewHolidayName('');
        setNewHolidayDate(undefined);
      }
    });
  };
  
  const openEditDialog = (holiday: PublicHoliday) => {
    setEditingHoliday(holiday);
    setNewHolidayName(holiday.name);
    setNewHolidayDate(parseISO(holiday.date));
  };
  
  const closeDialog = () => {
    setIsAddDialogOpen(false);
    setEditingHoliday(null);
    setNewHolidayName('');
    setNewHolidayDate(undefined);
  };
  
  const getDayName = (dateStr: string) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[getDay(parseISO(dateStr))];
  };

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-sm font-medium">Public Holidays</h3>
          <p className="text-xs text-muted-foreground">
            Manage public holidays. Holidays falling on weekends are automatically compensated.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={selectedYear.toString()}
            onValueChange={(v) => setSelectedYear(parseInt(v))}
          >
            <SelectTrigger className="w-24 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {yearOptions.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Holiday Table */}
      <div className="rounded-lg border">
        {holidaysLoading ? (
          <div className="p-4 space-y-3">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : holidays && holidays.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Holiday Name</TableHead>
                <TableHead>Original Date</TableHead>
                <TableHead>Observed Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-20"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {holidays.map((holiday) => (
                <TableRow key={holiday.id}>
                  <TableCell className="font-medium">{holiday.name}</TableCell>
                  <TableCell>
                    <span className="text-muted-foreground">
                      {format(parseISO(holiday.date), 'MMM d, yyyy')}
                      <span className="ml-1 text-xs">({getDayName(holiday.date)})</span>
                    </span>
                  </TableCell>
                  <TableCell>
                    {format(parseISO(holiday.observed_date), 'MMM d, yyyy')}
                    <span className="ml-1 text-xs text-muted-foreground">
                      ({getDayName(holiday.observed_date)})
                    </span>
                  </TableCell>
                  <TableCell>
                    {holiday.is_compensated ? (
                      <Badge variant="secondary" className="text-xs">
                        {holiday.compensation_reason}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs">Original</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => openEditDialog(holiday)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => deleteHoliday.mutate({ id: holiday.id, year: holiday.year })}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="p-8 text-center text-muted-foreground">
            <CalendarIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No holidays for {selectedYear}</p>
          </div>
        )}
      </div>
      
      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsAddDialogOpen(true)}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Holiday
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => syncHolidays.mutate(selectedYear)}
          disabled={syncHolidays.isPending || !holidays?.length}
        >
          <RefreshCw className={cn("h-4 w-4 mr-1", syncHolidays.isPending && "animate-spin")} />
          Sync to Employees
        </Button>
      </div>
      
      {/* Add/Edit Dialog */}
      <Dialog open={isAddDialogOpen || !!editingHoliday} onOpenChange={(open) => !open && closeDialog()}>
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
                value={newHolidayName}
                onChange={(e) => setNewHolidayName(e.target.value)}
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
                      !newHolidayDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {newHolidayDate ? format(newHolidayDate, 'PPP') : 'Select date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={newHolidayDate}
                    onSelect={setNewHolidayDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            {newHolidayDate && (
              <div className="p-3 rounded-lg bg-muted/50 text-sm">
                <p className="text-muted-foreground">
                  {(() => {
                    // Calculate grouped compensation including this new/edited holiday
                    const allHolidayDates = [
                      ...(holidays
                        ?.filter(h => !editingHoliday || h.id !== editingHoliday.id)
                        .map(h => ({ name: h.name, date: parseISO(h.date) })) || []),
                      { name: newHolidayName || 'New Holiday', date: newHolidayDate }
                    ];
                    
                    const compensationResults = calculateGroupedHolidayCompensation(
                      allHolidayDates,
                      weekendDays
                    );
                    
                    const result = compensationResults.find(
                      r => format(r.date, 'yyyy-MM-dd') === format(newHolidayDate, 'yyyy-MM-dd')
                    );
                    
                    if (result?.isCompensated) {
                      return (
                        <>
                          <span className="text-amber-600 font-medium">Weekend Compensation: </span>
                          Observed on {format(result.observedDate, 'EEEE, MMM d, yyyy')}
                          {result.reason && <span className="block text-xs mt-1">{result.reason}</span>}
                        </>
                      );
                    }
                    return (
                      <>
                        <span className="text-green-600 font-medium">Working Day: </span>
                        No compensation needed
                      </>
                    );
                  })()}
                </p>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              Cancel
            </Button>
            <Button
              onClick={editingHoliday ? handleUpdateHoliday : handleAddHoliday}
              disabled={!newHolidayName || !newHolidayDate || createHoliday.isPending || updateHoliday.isPending}
            >
              {editingHoliday ? 'Save Changes' : 'Add Holiday'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
