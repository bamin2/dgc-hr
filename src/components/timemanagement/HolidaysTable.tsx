import { format, parseISO, getDay } from 'date-fns';
import { Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar as CalendarIcon } from 'lucide-react';
import {
  useDeletePublicHoliday,
  PublicHoliday,
} from '@/hooks/usePublicHolidays';
import { HolidayFormDialog } from './HolidayFormDialog';

interface HolidaysTableProps {
  holidays: PublicHoliday[];
  isLoading: boolean;
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  year: number;
}

export function HolidaysTable({
  holidays,
  isLoading,
  selectedIds,
  onSelectionChange,
  year,
}: HolidaysTableProps) {
  const [editingHoliday, setEditingHoliday] = useState<PublicHoliday | null>(null);
  const deleteHoliday = useDeletePublicHoliday();
  
  const getDayName = (dateStr: string) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[getDay(parseISO(dateStr))];
  };
  
  const handleSelectAll = () => {
    if (selectedIds.length === holidays.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(holidays.map(h => h.id));
    }
  };
  
  const handleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter(i => i !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  };
  
  if (isLoading) {
    return (
      <div className="rounded-lg border p-4 space-y-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }
  
  if (holidays.length === 0) {
    return (
      <div className="rounded-lg border p-8 text-center text-muted-foreground">
        <CalendarIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p className="text-sm font-medium">No holidays for {year}</p>
        <p className="text-xs mt-1">Add your first public holiday to get started</p>
      </div>
    );
  }
  
  return (
    <>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedIds.length === holidays.length && holidays.length > 0}
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all"
                />
              </TableHead>
              <TableHead>Holiday Name</TableHead>
              <TableHead>Original Date</TableHead>
              <TableHead>Observed Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-20"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {holidays.map((holiday) => (
              <TableRow 
                key={holiday.id}
                className={selectedIds.includes(holiday.id) ? 'bg-muted/50' : ''}
              >
                <TableCell>
                  <Checkbox
                    checked={selectedIds.includes(holiday.id)}
                    onCheckedChange={() => handleSelectOne(holiday.id)}
                    aria-label={`Select ${holiday.name}`}
                  />
                </TableCell>
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
                    <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
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
                      onClick={() => setEditingHoliday(holiday)}
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
      </div>
      
      {/* Edit Dialog */}
      <HolidayFormDialog
        open={!!editingHoliday}
        onOpenChange={(open) => !open && setEditingHoliday(null)}
        year={year}
        existingHolidays={holidays}
        editingHoliday={editingHoliday}
      />
    </>
  );
}
