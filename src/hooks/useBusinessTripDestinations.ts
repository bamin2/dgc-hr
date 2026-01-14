import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { queryKeys } from '@/lib/queryKeys';
import { toast } from '@/hooks/use-toast';
import {
  BusinessTripDestination,
  CreateDestinationInput,
  UpdateDestinationInput,
} from '@/types/businessTrips';

// Fetch all active destinations
export function useBusinessTripDestinations() {
  return useQuery({
    queryKey: queryKeys.businessTrips.destinations,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('business_trip_destinations')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return data as BusinessTripDestination[];
    },
  });
}

// Fetch all destinations (including inactive) for admin
export function useAllBusinessTripDestinations() {
  return useQuery({
    queryKey: queryKeys.businessTrips.allDestinations,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('business_trip_destinations')
        .select('*')
        .order('name');

      if (error) throw error;
      return data as BusinessTripDestination[];
    },
  });
}

// Create destination
export function useCreateDestination() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateDestinationInput) => {
      const { data, error } = await supabase
        .from('business_trip_destinations')
        .insert({
          name: input.name,
          country: input.country,
          city: input.city,
          per_diem_rate_bhd: input.per_diem_rate_bhd,
          is_active: input.is_active ?? true,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.businessTrips.destinations });
      queryClient.invalidateQueries({ queryKey: queryKeys.businessTrips.allDestinations });
      toast({
        title: 'Destination created',
        description: 'The destination has been added successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create destination',
        variant: 'destructive',
      });
    },
  });
}

// Update destination
export function useUpdateDestination() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateDestinationInput) => {
      const { id, ...updates } = input;
      const { data, error } = await supabase
        .from('business_trip_destinations')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.businessTrips.destinations });
      queryClient.invalidateQueries({ queryKey: queryKeys.businessTrips.allDestinations });
      toast({
        title: 'Destination updated',
        description: 'The destination has been updated successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update destination',
        variant: 'destructive',
      });
    },
  });
}

// Delete (deactivate) destination
export function useDeleteDestination() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('business_trip_destinations')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.businessTrips.destinations });
      queryClient.invalidateQueries({ queryKey: queryKeys.businessTrips.allDestinations });
      toast({
        title: 'Destination deactivated',
        description: 'The destination has been deactivated.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to deactivate destination',
        variant: 'destructive',
      });
    },
  });
}
