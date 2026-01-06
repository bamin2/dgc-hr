import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { addDays, format, getDay, parseISO } from 'date-fns';

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
  usedDates: Set<string> = new Set()
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
    
    // Find next working day
    let daysToAdd = 1;
    while (true) {
      observedDate = addDays(holidayDate, daysToAdd);
      const newDayOfWeek = getDay(observedDate);
      const dateStr = format(observedDate, 'yyyy-MM-dd');
      
      // Check if it's a working day and not already used
      if (!weekendDays.includes(newDayOfWeek) && !usedDates.has(dateStr)) {
        break;
      }
      daysToAdd++;
      
      // Safety limit
      if (daysToAdd > 14) break;
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

// Fetch holidays for a specific year
export function usePublicHolidays(year?: number) {
  const currentYear = year || new Date().getFullYear();
  
  return useQuery({
    queryKey: ['public-holidays', currentYear],
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
      queryClient.invalidateQueries({ queryKey: ['public-holidays', data.year] });
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
      queryClient.invalidateQueries({ queryKey: ['public-holidays', data.year] });
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
      queryClient.invalidateQueries({ queryKey: ['public-holidays', year] });
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
      queryClient.invalidateQueries({ queryKey: ['leave-requests'] });
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
