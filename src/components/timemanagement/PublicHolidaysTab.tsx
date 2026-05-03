import { useState } from 'react';
import { format, parseISO, getDay } from 'date-fns';
import { Calendar, ChevronLeft, ChevronRight, Plus, Copy, RefreshCw, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import {
  usePublicHolidays,
  useSyncPublicHolidaysToLeave,
  useBulkDeletePublicHolidays,
} from '@/hooks/usePublicHolidays';
import { HolidaysTable } from './HolidaysTable';
import { BulkAddHolidaysDialog } from './BulkAddHolidaysDialog';
import { CopyYearHolidaysDialog } from './CopyYearHolidaysDialog';
import { HolidayFormDialog } from './HolidayFormDialog';
import { Skeleton } from '@/components/ui/skeleton';
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

export function PublicHolidaysTab() {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isBulkAddDialogOpen, setIsBulkAddDialogOpen] = useState(false);
  const [isCopyDialogOpen, setIsCopyDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const { data: holidays, isLoading } = usePublicHolidays(selectedYear);
  const syncHolidays = useSyncPublicHolidaysToLeave();
  const bulkDelete = useBulkDeletePublicHolidays();
  
  const yearOptions = Array.from({ length: 10 }, (_, i) => currentYear - 2 + i);
  
  // Calculate stats
  const totalHolidays = holidays?.length || 0;
  const compensatedDays = holidays?.filter(h => h.is_compensated).length || 0;
  const totalDaysOff = totalHolidays; // Each holiday = 1 day off
  
  // Stats by quarter
  const getQuarter = (dateStr: string) => {
    const month = parseISO(dateStr).getMonth();
    if (month < 3) return 'Q1';
    if (month < 6) return 'Q2';
    if (month < 9) return 'Q3';
    return 'Q4';
  };
  
  const quarterStats = holidays?.reduce((acc, h) => {
    const q = getQuarter(h.observed_date);
    acc[q] = (acc[q] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};
  
  const handlePrevYear = () => setSelectedYear(prev => prev - 1);
  const handleNextYear = () => setSelectedYear(prev => prev + 1);
  
  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    bulkDelete.mutate(
      { ids: selectedIds, year: selectedYear },
      {
        onSuccess: () => {
          setSelectedIds([]);
          setIsDeleteDialogOpen(false);
        },
      }
    );
  };
  
  const handleSelectionChange = (ids: string[]) => {
    setSelectedIds(ids);
  };
  
  return (
    <div className="space-y-6">
      {/* Header with Year Navigation */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={handlePrevYear}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <Select
              value={selectedYear.toString()}
              onValueChange={(v) => setSelectedYear(parseInt(v))}
            >
              <SelectTrigger className="w-28 h-10 font-semibold text-lg">
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
            
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={handleNextYear}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Stats Summary */}
        {isLoading ? (
          <div className="flex gap-4">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-24" />
          </div>
        ) : (
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Total:</span>
              <span className="font-semibold">{totalHolidays} holidays</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Days Off:</span>
              <span className="font-semibold">{totalDaysOff}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Compensated:</span>
              <span className="font-semibold text-amber-600">{compensatedDays}</span>
            </div>
          </div>
        )}
      </div>
      
      {/* Quarter Stats */}
      {!isLoading && totalHolidays > 0 && (
        <div className="grid grid-cols-4 gap-4">
          {['Q1', 'Q2', 'Q3', 'Q4'].map((quarter) => (
            <Card key={quarter} className="bg-muted/30">
              <CardContent className="p-3 text-center">
                <div className="text-xs text-muted-foreground">{quarter}</div>
                <div className="text-lg font-semibold">{quarterStats[quarter] || 0}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Holiday
        </Button>
        <Button variant="outline" onClick={() => setIsBulkAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Multiple
        </Button>
        <Button variant="outline" onClick={() => setIsCopyDialogOpen(true)}>
          <Copy className="h-4 w-4 mr-2" />
          Copy from {selectedYear - 1}
        </Button>
        <Button
          variant="outline"
          onClick={() => syncHolidays.mutate(selectedYear)}
          disabled={syncHolidays.isPending || !holidays?.length}
        >
          <RefreshCw className={cn("h-4 w-4 mr-2", syncHolidays.isPending && "animate-spin")} />
          Sync to Employees
        </Button>
        
        {selectedIds.length > 0 && (
          <Button
            variant="destructive"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Selected ({selectedIds.length})
          </Button>
        )}
      </div>
      
      {/* Holidays Table */}
      <HolidaysTable
        holidays={holidays || []}
        isLoading={isLoading}
        selectedIds={selectedIds}
        onSelectionChange={handleSelectionChange}
        year={selectedYear}
      />
      
      {/* Single Add Dialog */}
      <HolidayFormDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        year={selectedYear}
        existingHolidays={holidays || []}
      />
      
      {/* Bulk Add Dialog */}
      <BulkAddHolidaysDialog
        open={isBulkAddDialogOpen}
        onOpenChange={setIsBulkAddDialogOpen}
        year={selectedYear}
        existingHolidays={holidays || []}
      />
      
      {/* Copy Year Dialog */}
      <CopyYearHolidaysDialog
        open={isCopyDialogOpen}
        onOpenChange={setIsCopyDialogOpen}
        targetYear={selectedYear}
      />
      
      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Selected Holidays</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedIds.length} holiday{selectedIds.length > 1 ? 's' : ''}?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
