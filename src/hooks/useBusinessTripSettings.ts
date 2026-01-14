import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { queryKeys } from '@/lib/queryKeys';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { BusinessTripSettings } from '@/types/businessTrips';

// Fetch settings
export function useBusinessTripSettings() {
  return useQuery({
    queryKey: queryKeys.businessTrips.settings,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('business_trip_settings')
        .select('*')
        .limit(1)
        .single();

      if (error) throw error;
      return data as BusinessTripSettings;
    },
  });
}

// Update settings
export function useUpdateBusinessTripSettings() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (updates: Partial<Omit<BusinessTripSettings, 'id' | 'updated_at' | 'updated_by'>>) => {
      // First get the settings ID
      const { data: settings } = await supabase
        .from('business_trip_settings')
        .select('id')
        .limit(1)
        .single();

      if (!settings) throw new Error('Settings not found');

      const { data, error } = await supabase
        .from('business_trip_settings')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
          updated_by: user?.id,
        })
        .eq('id', settings.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.businessTrips.settings });
      toast({
        title: 'Settings updated',
        description: 'Business trips settings have been updated.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update settings',
        variant: 'destructive',
      });
    },
  });
}
