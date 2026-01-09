import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { addDays, differenceInDays, format, getDay, parseISO } from 'date-fns';
import { queryKeys } from '@/lib/queryKeys';

export interface PublicHoliday {
  id: string;
  name: string;
  date: string;
  observed_date: string;
  year: number;
  is_compensated: boolean;
  compensation_reason: string | null;
  created_at: string;
  updated_at: string;
}

// Calculate observed date with weekend compensation
export function calculateObservedDate(
  holidayDate: Date,
  weekendDays: number[] = [5, 6], // Default: Friday-Saturday
  usedDates: Set<string> = new Set(),
  earliestCompensationDate?: Date // Start compensation from this date
): { observedDate: Date; isCompensated: boolean; reason: string | null } {
  const dayOfWeek = getDay(holidayDate); // 0=Sunday, 1=Monday, ..., 6=Saturday
  
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  let observedDate = holidayDate;
  let isCompensated = false;
  let reason: string | null = null;
  
  // If holiday falls on a weekend, find the next working day
  if (weekendDays.includes(dayOfWeek)) {
    isCompensated = true;
    reason = `Moved from ${dayNames[dayOfWeek]}`;
    
    // Start from earliestCompensationDate if provided, otherwise day after holiday
    const startDate = earliestCompensationDate && earliestCompensationDate > holidayDate 
      ? earliestCompensationDate 
      : addDays(holidayDate, 1);
    
    let currentDate = startDate;
    let attempts = 0;
    
    while (attempts < 30) {
      const currentDayOfWeek = getDay(currentDate);
      const dateStr = format(currentDate, 'yyyy-MM-dd');
      
      // Check if it's a working day and not already used
      if (!weekendDays.includes(currentDayOfWeek) && !usedDates.has(dateStr)) {
        observedDate = currentDate;
        break;
      }
      currentDate = addDays(currentDate, 1);
      attempts++;
    }
  } else {
    // Not a weekend, check if the date is already used
    let dateStr = format(observedDate, 'yyyy-MM-dd');
    if (usedDates.has(dateStr)) {
      // Find next available working day
      let daysToAdd = 1;
      while (true) {
        observedDate = addDays(holidayDate, daysToAdd);
        const newDayOfWeek = getDay(observedDate);
        dateStr = format(observedDate, 'yyyy-MM-dd');
        
        if (!weekendDays.includes(newDayOfWeek) && !usedDates.has(dateStr)) {
          isCompensated = true;
          reason = `Adjusted due to overlap`;
          break;
        }
        daysToAdd++;
        if (daysToAdd > 14) break;
      }
    }
  }
  
  return { observedDate, isCompensated, reason };
}

// Calculate compensation for grouped holidays (e.g., multi-day Eid)
// Compensation days only start after ALL original holiday days are complete
export function calculateGroupedHolidayCompensation(
  holidayDates: { name: string; date: Date }[],
  weekendDays: number[] = [5, 6],
  existingObservedDates: Set<string> = new Set()
): Array<{
  name: string;
  date: Date;
  observedDate: Date;
  isCompensated: boolean;
  reason: string | null;
}> {
  if (holidayDates.length === 0) return [];
  
  // Sort by date
  const sorted = [...holidayDates].sort((a, b) => a.date.getTime() - b.date.getTime());
  
  // Find the last day of the holiday group
  const lastHolidayDate = sorted[sorted.length - 1].date;
  
  // Compensation can only start from the day after the last holiday
  const earliestCompensationDate = addDays(lastHolidayDate, 1);
  
  const usedDates = new Set(existingObservedDates);
  const results: Array<{
    name: string;
    date: Date;
    observedDate: Date;
    isCompensated: boolean;
    reason: string | null;
  }> = [];
  
  for (const holiday of sorted) {
    const dayOfWeek = getDay(holiday.date);
    
    if (weekendDays.includes(dayOfWeek)) {
      // Weekend - needs compensation after all holidays
      const { observedDate, isCompensated, reason } = calculateObservedDate(
        holiday.date,
        weekendDays,
        usedDates,
        earliestCompensationDate
      );
      
      // Mark this date as used
      usedDates.add(format(observedDate, 'yyyy-MM-dd'));
      
      results.push({
        name: holiday.name,
        date: holiday.date,
        observedDate,
        isCompensated,
        reason,
      });
    } else {
      // Working day - observed on same date (unless conflict)
      const dateStr = format(holiday.date, 'yyyy-MM-dd');
      if (usedDates.has(dateStr)) {
        const { observedDate, isCompensated, reason } = calculateObservedDate(
          holiday.date,
          weekendDays,
          usedDates,
          earliestCompensationDate
        );
        usedDates.add(format(observedDate, 'yyyy-MM-dd'));
        results.push({
          name: holiday.name,
          date: holiday.date,
          observedDate,
          isCompensated,
          reason,
        });
      } else {
        usedDates.add(dateStr);
        results.push({
          name: holiday.name,
          date: holiday.date,
          observedDate: holiday.date,
          isCompensated: false,
          reason: null,
        });
      }
    }
  }
  
  return results;
}

// Calculate compensation for holidays, intelligently grouping only consecutive holidays
// Non-consecutive holidays (like New Year vs Labour Day) are compensated individually
export function calculateHolidaysCompensation(
  holidays: { name: string; date: Date }[],
  weekendDays: number[] = [5, 6],
  existingUsedDates: Set<string> = new Set()
): Array<{
  name: string;
  date: Date;
  observedDate: Date;
  isCompensated: boolean;
  reason: string | null;
}> {
  if (holidays.length === 0) return [];

  // Sort holidays by date
  const sorted = [...holidays].sort((a, b) => a.date.getTime() - b.date.getTime());

  // Group consecutive holidays (within 1 day of each other)
  const groups: Array<{ name: string; date: Date }[]> = [];
  let currentGroup: typeof groups[0] = [];

  for (const holiday of sorted) {
    if (currentGroup.length === 0) {
      currentGroup = [holiday];
    } else {
      const lastDate = currentGroup[currentGroup.length - 1].date;
      const daysDiff = differenceInDays(holiday.date, lastDate);

      if (daysDiff <= 1) {
        // Consecutive, add to current group
        currentGroup.push(holiday);
      } else {
        // Not consecutive, start new group
        groups.push(currentGroup);
        currentGroup = [holiday];
      }
    }
  }
  if (currentGroup.length > 0) {
    groups.push(currentGroup);
  }

  // Process each group
  const usedDates = new Set(existingUsedDates);
  const results: Array<{
    name: string;
    date: Date;
    observedDate: Date;
    isCompensated: boolean;
    reason: string | null;
  }> = [];

  for (const group of groups) {
    if (group.length === 1) {
      // Single holiday - calculate individually (compensate right after the holiday)
      const result = calculateObservedDate(
        group[0].date,
        weekendDays,
        usedDates
      );
      usedDates.add(format(result.observedDate, 'yyyy-MM-dd'));
      results.push({
        name: group[0].name,
        date: group[0].date,
        observedDate: result.observedDate,
        isCompensated: result.isCompensated,
        reason: result.reason,
      });
    } else {
      // Grouped consecutive holidays - use grouped logic
      const groupResults = calculateGroupedHolidayCompensation(
        group,
        weekendDays,
        usedDates
      );
      groupResults.forEach((r) => {
        usedDates.add(format(r.observedDate, 'yyyy-MM-dd'));
        results.push(r);
      });
    }
  }

  return results;
}

// Fetch holidays for a specific year
export function usePublicHolidays(year?: number) {
  const currentYear = year || new Date().getFullYear();
  
  return useQuery({
    queryKey: queryKeys.publicHolidays.byYear(currentYear),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('public_holidays')
        .select('*')
        .eq('year', currentYear)
        .order('date', { ascending: true });
      
      if (error) throw error;
      return data as PublicHoliday[];
    },
  });
}

// Create a new public holiday
export function useCreatePublicHoliday() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (holiday: {
      name: string;
      date: string;
      observed_date: string;
      year: number;
      is_compensated: boolean;
      compensation_reason: string | null;
    }) => {
      const { data, error } = await supabase
        .from('public_holidays')
        .insert(holiday)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.publicHolidays.byYear(data.year) });
      toast.success('Public holiday added');
    },
    onError: (error: Error) => {
      toast.error('Failed to add holiday', { description: error.message });
    },
  });
}

// Update a public holiday
export function useUpdatePublicHoliday() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...holiday }: Partial<PublicHoliday> & { id: string }) => {
      const { data, error } = await supabase
        .from('public_holidays')
        .update(holiday)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.publicHolidays.byYear(data.year) });
      toast.success('Public holiday updated');
    },
    onError: (error: Error) => {
      toast.error('Failed to update holiday', { description: error.message });
    },
  });
}

// Delete a public holiday
export function useDeletePublicHoliday() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, year }: { id: string; year: number }) => {
      const { error } = await supabase
        .from('public_holidays')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return { year };
    },
    onSuccess: ({ year }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.publicHolidays.byYear(year) });
      toast.success('Public holiday deleted');
    },
    onError: (error: Error) => {
      toast.error('Failed to delete holiday', { description: error.message });
    },
  });
}

// Sync public holidays to employee leave requests
export function useSyncPublicHolidaysToLeave() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (year: number) => {
      // Get all public holidays for the year
      const { data: holidays, error: holidaysError } = await supabase
        .from('public_holidays')
        .select('*')
        .eq('year', year);
      
      if (holidaysError) throw holidaysError;
      
      // Get the Public Holiday leave type
      const { data: leaveTypes, error: leaveTypesError } = await supabase
        .from('leave_types')
        .select('id')
        .eq('name', 'Public Holiday')
        .single();
      
      if (leaveTypesError) throw leaveTypesError;
      
      // Get all active employees
      const { data: employees, error: employeesError } = await supabase
        .from('employees')
        .select('id')
        .eq('status', 'active');
      
      if (employeesError) throw employeesError;
      
      // Get existing leave requests for these holidays
      const observedDates = holidays?.map(h => h.observed_date) || [];
      const { data: existingRequests, error: existingError } = await supabase
        .from('leave_requests')
        .select('employee_id, start_date')
        .eq('leave_type_id', leaveTypes.id)
        .in('start_date', observedDates);
      
      if (existingError) throw existingError;
      
      // Create a set of existing employee+date combinations
      const existingSet = new Set(
        existingRequests?.map(r => `${r.employee_id}-${r.start_date}`) || []
      );
      
      // Create leave requests for each employee for each holiday
      const newRequests = [];
      for (const holiday of holidays || []) {
        for (const employee of employees || []) {
          const key = `${employee.id}-${holiday.observed_date}`;
          if (!existingSet.has(key)) {
            newRequests.push({
              employee_id: employee.id,
              leave_type_id: leaveTypes.id,
              start_date: holiday.observed_date,
              end_date: holiday.observed_date,
              days_count: 1,
              status: 'approved',
              reason: holiday.name,
            });
          }
        }
      }
      
      if (newRequests.length > 0) {
        const { error: insertError } = await supabase
          .from('leave_requests')
          .insert(newRequests);
        
        if (insertError) throw insertError;
      }
      
      return { created: newRequests.length };
    },
    onSuccess: ({ created }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leave.requests.all });
      if (created > 0) {
        toast.success(`Synced ${created} holiday entries to employees`);
      } else {
        toast.info('All holidays already synced');
      }
    },
    onError: (error: Error) => {
      toast.error('Failed to sync holidays', { description: error.message });
    },
  });
}

// Bulk create multiple holidays
export function useBulkCreatePublicHolidays() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (holidays: Array<{
      name: string;
      date: string;
      observed_date: string;
      year: number;
      is_compensated: boolean;
      compensation_reason: string | null;
    }>) => {
      if (holidays.length === 0) return { count: 0, year: new Date().getFullYear() };
      
      const { data, error } = await supabase
        .from('public_holidays')
        .insert(holidays)
        .select();
      
      if (error) throw error;
      return { count: data.length, year: holidays[0].year };
    },
    onSuccess: ({ count, year }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.publicHolidays.byYear(year) });
      toast.success(`Added ${count} public holiday${count !== 1 ? 's' : ''}`);
    },
    onError: (error: Error) => {
      toast.error('Failed to add holidays', { description: error.message });
    },
  });
}

// Bulk delete multiple holidays
export function useBulkDeletePublicHolidays() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ ids, year }: { ids: string[]; year: number }) => {
      const { error } = await supabase
        .from('public_holidays')
        .delete()
        .in('id', ids);
      
      if (error) throw error;
      return { count: ids.length, year };
    },
    onSuccess: ({ count, year }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.publicHolidays.byYear(year) });
      toast.success(`Deleted ${count} public holiday${count !== 1 ? 's' : ''}`);
    },
    onError: (error: Error) => {
      toast.error('Failed to delete holidays', { description: error.message });
    },
  });
}
