import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { queryKeys } from '@/lib/queryKeys';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import {
  BusinessTripAmendment,
  CreateAmendmentInput,
  AmendmentStatus,
} from '@/types/businessTrips';

// Fetch amendments for a trip
export function useBusinessTripAmendments(tripId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.businessTrips.amendments(tripId || ''),
    queryFn: async () => {
      if (!tripId) return [];

      const { data, error } = await supabase
        .from('business_trip_amendments')
        .select('*')
        .eq('trip_id', tripId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as BusinessTripAmendment[];
    },
    enabled: !!tripId,
  });
}

// Request amendment
export function useRequestAmendment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateAmendmentInput) => {
      const insertData = {
        trip_id: input.trip_id,
        change_type: input.change_type,
        proposed_values: input.proposed_values,
        original_values: input.original_values,
        reason: input.reason,
        status: 'pending',
      };

      const { data, error } = await supabase
        .from('business_trip_amendments')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.businessTrips.amendments(data.trip_id) 
      });
      toast({
        title: 'Amendment requested',
        description: 'Your amendment request has been submitted for approval.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to request amendment',
        variant: 'destructive',
      });
    },
  });
}

// Approve amendment (Manager or HR)
export function useApproveAmendment() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      amendmentId, 
      asHR = false 
    }: { 
      amendmentId: string; 
      asHR?: boolean;
    }) => {
      // Get current amendment
      const { data: amendment, error: fetchError } = await supabase
        .from('business_trip_amendments')
        .select('*')
        .eq('id', amendmentId)
        .single();

      if (fetchError) throw fetchError;

      let newStatus: AmendmentStatus;
      if (asHR) {
        newStatus = 'hr_approved';
      } else {
        newStatus = 'manager_approved';
      }

      const { data, error } = await supabase
        .from('business_trip_amendments')
        .update({
          status: newStatus,
          approved_by: user?.id,
          approved_at: new Date().toISOString(),
        })
        .eq('id', amendmentId)
        .select()
        .single();

      if (error) throw error;

      // If HR approved, apply the amendment to the trip
      if (asHR && amendment) {
        const proposedValues = amendment.proposed_values as Record<string, unknown>;
        await supabase
          .from('business_trips')
          .update({
            ...proposedValues,
            version: (amendment as unknown as { version?: number }).version ? 
              ((amendment as unknown as { version?: number }).version! + 1) : 2,
          })
          .eq('id', amendment.trip_id);
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.businessTrips.amendments(data.trip_id) 
      });
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.businessTrips.detail(data.trip_id) 
      });
      toast({
        title: 'Amendment approved',
        description: 'The amendment has been approved.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to approve amendment',
        variant: 'destructive',
      });
    },
  });
}

// Reject amendment
export function useRejectAmendment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      amendmentId, 
      reason 
    }: { 
      amendmentId: string; 
      reason: string;
    }) => {
      const { data, error } = await supabase
        .from('business_trip_amendments')
        .update({
          status: 'rejected',
          rejection_reason: reason,
        })
        .eq('id', amendmentId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.businessTrips.amendments(data.trip_id) 
      });
      toast({
        title: 'Amendment rejected',
        description: 'The amendment has been rejected.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to reject amendment',
        variant: 'destructive',
      });
    },
  });
}
