import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { queryKeys } from '@/lib/queryKeys';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import {
  BusinessTripExpense,
  CreateExpenseInput,
  ReviewExpenseInput,
} from '@/types/businessTrips';

// Fetch expenses for a trip
export function useBusinessTripExpenses(tripId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.businessTrips.expenses(tripId || ''),
    queryFn: async () => {
      if (!tripId) return [];

      const { data, error } = await supabase
        .from('business_trip_expenses')
        .select('*')
        .eq('trip_id', tripId)
        .order('expense_date', { ascending: false });

      if (error) throw error;
      return data as BusinessTripExpense[];
    },
    enabled: !!tripId,
  });
}

// Add expense
export function useAddExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateExpenseInput) => {
      const { data, error } = await supabase
        .from('business_trip_expenses')
        .insert({
          trip_id: input.trip_id,
          category: input.category,
          amount_bhd: input.amount_bhd,
          expense_date: input.expense_date,
          description: input.description,
          receipt_url: input.receipt_url,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.businessTrips.expenses(data.trip_id) 
      });
      toast({
        title: 'Expense added',
        description: 'The expense has been added to the trip.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add expense',
        variant: 'destructive',
      });
    },
  });
}

// Review expense (HR only)
export function useReviewExpense() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: ReviewExpenseInput) => {
      const { id, ...updates } = input;
      const { data, error } = await supabase
        .from('business_trip_expenses')
        .update({
          ...updates,
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.businessTrips.expenses(data.trip_id) 
      });
      toast({
        title: 'Expense reviewed',
        description: `The expense has been ${data.hr_status}.`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to review expense',
        variant: 'destructive',
      });
    },
  });
}

// Delete expense
export function useDeleteExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, tripId }: { id: string; tripId: string }) => {
      const { error } = await supabase
        .from('business_trip_expenses')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { tripId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.businessTrips.expenses(data.tripId) 
      });
      toast({
        title: 'Expense deleted',
        description: 'The expense has been removed.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete expense',
        variant: 'destructive',
      });
    },
  });
}
