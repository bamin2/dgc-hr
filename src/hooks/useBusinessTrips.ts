import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { queryKeys } from '@/lib/queryKeys';
import { queryPresets, paginatedListOptions } from '@/lib/queryOptions';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import {
  BusinessTrip,
  CreateBusinessTripInput,
  UpdateBusinessTripInput,
  TripStatus,
} from '@/types/businessTrips';

// Calculate per diem values
export function calculatePerDiem(
  nights: number,
  perDiemRate: number,
  travelMode: 'plane' | 'car',
  corporateCardUsed: boolean,
  carUpliftPerNight: number
) {
  const carUpliftTotal = travelMode === 'car' ? nights * carUpliftPerNight : 0;
  const perDiemBudget = (nights * perDiemRate) + carUpliftTotal;
  const perDiemPayable = corporateCardUsed ? 0 : perDiemBudget;

  return {
    nights_count: nights,
    car_uplift_per_night_bhd: travelMode === 'car' ? carUpliftPerNight : 0,
    car_uplift_total_bhd: carUpliftTotal,
    per_diem_budget_bhd: perDiemBudget,
    per_diem_payable_bhd: perDiemPayable,
  };
}

// Calculate nights between dates
export function calculateNights(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

// Fetch my trips (employee's own trips)
export function useMyBusinessTrips(employeeId?: string | null) {
  const { user, profile } = useAuth();
  
  // Resolve employee ID: passed param > profile.employee_id
  const resolvedEmployeeId = employeeId || profile?.employee_id;

  return useQuery({
    queryKey: queryKeys.businessTrips.my(resolvedEmployeeId ?? undefined),
    queryFn: async () => {
      if (!resolvedEmployeeId) return [];

      const { data, error } = await supabase
        .from('business_trips')
        .select(`
          *,
          destination:business_trip_destinations(*),
          origin_location:work_locations(id, name),
          employee:employees(
            id, first_name, last_name, full_name, avatar_url,
            department:departments!employees_department_id_fkey(id, name),
            work_location:work_locations(id, name)
          )
        `)
        .eq('employee_id', resolvedEmployeeId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as unknown as BusinessTrip[];
    },
    enabled: !!user && !!resolvedEmployeeId,
    ...queryPresets.userData,
  });
}

// Fetch all trips (for HR/Admin)
export function useAllBusinessTrips(filters?: {
  status?: TripStatus;
  employeeId?: string;
  destinationId?: string;
  startDate?: string;
  endDate?: string;
}) {
  return useQuery({
    queryKey: queryKeys.businessTrips.all(filters),
    queryFn: async () => {
      let query = supabase
        .from('business_trips')
        .select(`
          *,
          destination:business_trip_destinations(*),
          origin_location:work_locations(id, name),
          employee:employees(
            id, first_name, last_name, full_name, avatar_url,
            department:departments!employees_department_id_fkey(id, name),
            work_location:work_locations(id, name)
          )
        `)
        .order('created_at', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.employeeId) {
        query = query.eq('employee_id', filters.employeeId);
      }
      if (filters?.destinationId) {
        query = query.eq('destination_id', filters.destinationId);
      }
      if (filters?.startDate) {
        query = query.gte('start_date', filters.startDate);
      }
      if (filters?.endDate) {
        query = query.lte('end_date', filters.endDate);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as BusinessTrip[];
    },
    ...queryPresets.userData,
    ...paginatedListOptions,
  });
}

// Fetch trips pending manager approval (for managers)
export function useTeamTripApprovals() {
  const { user } = useAuth();

  return useQuery({
    queryKey: queryKeys.businessTrips.teamApprovals,
    queryFn: async () => {
      if (!user) return [];

      // Get the manager's employee ID
      const { data: manager } = await supabase
        .from('employees')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!manager) return [];

      // Get trips from direct reports that are submitted (pending manager approval)
      const { data, error } = await supabase
        .from('business_trips')
        .select(`
          *,
          destination:business_trip_destinations(*),
          origin_location:work_locations(id, name),
          employee:employees!inner(
            id, first_name, last_name, full_name, avatar_url,
            department:departments!employees_department_id_fkey(id, name),
            work_location:work_locations(id, name)
          )
        `)
        .eq('status', 'submitted')
        .eq('employee.manager_id', manager.id)
        .order('submitted_at', { ascending: true });

      if (error) throw error;
      return data as unknown as BusinessTrip[];
    },
    enabled: !!user,
    ...queryPresets.liveData,
  });
}

// Fetch trips pending HR approval (for HR/Admin)
export function useHRTripApprovals() {
  return useQuery({
    queryKey: queryKeys.businessTrips.hrApprovals,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('business_trips')
        .select(`
          *,
          destination:business_trip_destinations(*),
          origin_location:work_locations(id, name),
            employee:employees(
              id, first_name, last_name, full_name, avatar_url,
              department:departments!employees_department_id_fkey(id, name),
              work_location:work_locations(id, name)
            )
        `)
        .in('status', ['submitted', 'manager_approved'])
        .order('submitted_at', { ascending: true });

      if (error) throw error;
      return data as unknown as BusinessTrip[];
    },
    ...queryPresets.liveData,
  });
}

// Fetch pending approvals for approval tab (consolidated query)
export function usePendingTripApprovals(isHROrAdmin: boolean) {
  const { user } = useAuth();

  return useQuery({
    queryKey: queryKeys.businessTrips.pendingApprovals(isHROrAdmin),
    queryFn: async () => {
      if (isHROrAdmin) {
        // HR sees both submitted and manager_approved trips
        const { data, error } = await supabase
          .from('business_trips')
          .select(`
            *,
            destination:business_trip_destinations(*),
            origin_location:work_locations(id, name),
            employee:employees(
              id, first_name, last_name, full_name, avatar_url,
              department:departments!employees_department_id_fkey(id, name),
              work_location:work_locations(id, name)
            )
          `)
          .in('status', ['submitted', 'manager_approved'])
          .order('submitted_at', { ascending: true });

        if (error) throw error;
        return data as unknown as BusinessTrip[];
      } else {
        // Managers see only submitted trips from their team
        if (!user) return [];

        const { data: manager } = await supabase
          .from('employees')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (!manager) return [];

        const { data, error } = await supabase
          .from('business_trips')
          .select(`
            *,
            destination:business_trip_destinations(*),
            origin_location:work_locations(id, name),
            employee:employees!inner(
              id, first_name, last_name, full_name, avatar_url,
              department:departments!employees_department_id_fkey(id, name),
              work_location:work_locations(id, name)
            )
          `)
          .eq('status', 'submitted')
          .eq('employee.manager_id', manager.id)
          .order('submitted_at', { ascending: true });

        if (error) throw error;
        return data as unknown as BusinessTrip[];
      }
    },
    enabled: isHROrAdmin || !!user,
    ...queryPresets.liveData,
  });
}

// Fetch single trip with all details
export function useBusinessTrip(tripId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.businessTrips.detail(tripId || ''),
    queryFn: async () => {
      if (!tripId) return null;

      const { data, error } = await supabase
        .from('business_trips')
        .select(`
          *,
          destination:business_trip_destinations(*),
          origin_location:work_locations(id, name),
          employee:employees(
            id, first_name, last_name, full_name, avatar_url,
            department:departments!employees_department_id_fkey(id, name),
            work_location:work_locations(id, name)
          )
        `)
        .eq('id', tripId)
        .single();

      if (error) throw error;
      return data as unknown as BusinessTrip;
    },
    enabled: !!tripId,
    ...queryPresets.userData,
  });
}

// Create trip mutation
export function useCreateBusinessTrip() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateBusinessTripInput & {
      per_diem_rate_bhd: number;
      nights_count: number;
      car_uplift_per_night_bhd: number;
      car_uplift_total_bhd: number;
      per_diem_budget_bhd: number;
      per_diem_payable_bhd: number;
    }) => {
      const { data, error } = await supabase
        .from('business_trips')
        .insert({
          employee_id: input.employee_id,
          origin_country: input.origin_country,
          origin_city: input.origin_city,
          destination_id: input.destination_id,
          start_date: input.start_date,
          end_date: input.end_date,
          nights_count: input.nights_count,
          travel_mode: input.travel_mode,
          corporate_card_used: input.corporate_card_used,
          per_diem_rate_bhd: input.per_diem_rate_bhd,
          car_uplift_per_night_bhd: input.car_uplift_per_night_bhd,
          car_uplift_total_bhd: input.car_uplift_total_bhd,
          per_diem_budget_bhd: input.per_diem_budget_bhd,
          per_diem_payable_bhd: input.per_diem_payable_bhd,
          flight_details: input.flight_details,
          status: input.status || 'draft',
          submitted_at: input.status === 'submitted' ? new Date().toISOString() : null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      // Force immediate refetch to show new trip - invalidate broadly
      queryClient.invalidateQueries({ 
        queryKey: ['business-trips', 'my'],
        refetchType: 'active'
      });
      // Also invalidate all trips if HR/Admin might be viewing
      queryClient.invalidateQueries({ queryKey: queryKeys.businessTrips.all() });
      toast({
        title: variables.status === 'submitted' ? 'Trip submitted' : 'Trip saved as draft',
        description: variables.status === 'submitted' 
          ? 'Your business trip request has been submitted for approval.'
          : 'Your business trip has been saved as a draft.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create business trip',
        variant: 'destructive',
      });
    },
  });
}

// Update trip mutation
export function useUpdateBusinessTrip() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateBusinessTripInput & {
      per_diem_rate_bhd?: number;
      nights_count?: number;
      car_uplift_per_night_bhd?: number;
      car_uplift_total_bhd?: number;
      per_diem_budget_bhd?: number;
      per_diem_payable_bhd?: number;
    }) => {
      const { id, ...updates } = input;
      
      // Add submitted_at if submitting
      if (updates.status === 'submitted') {
        (updates as Record<string, unknown>).submitted_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('business_trips')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['business-trips', 'my'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.businessTrips.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.businessTrips.all() });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update business trip',
        variant: 'destructive',
      });
    },
  });
}

// Submit trip for approval
export function useSubmitBusinessTrip() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tripId: string) => {
      const { data, error } = await supabase
        .from('business_trips')
        .update({
          status: 'submitted',
          submitted_at: new Date().toISOString(),
        })
        .eq('id', tripId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['business-trips', 'my'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.businessTrips.detail(data.id) });
      toast({
        title: 'Trip submitted',
        description: 'Your business trip request has been submitted for approval.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit trip',
        variant: 'destructive',
      });
    },
  });
}

// Cancel trip
export function useCancelBusinessTrip() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tripId: string) => {
      const { data, error } = await supabase
        .from('business_trips')
        .update({ status: 'cancelled' })
        .eq('id', tripId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['business-trips', 'my'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.businessTrips.detail(data.id) });
      toast({
        title: 'Trip cancelled',
        description: 'Your business trip has been cancelled.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to cancel trip',
        variant: 'destructive',
      });
    },
  });
}

// Approve trip (Manager or HR)
export function useApproveBusinessTrip() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ tripId, asHR = false, comment }: { 
      tripId: string; 
      asHR?: boolean;
      comment?: string;
    }) => {
      // Get current trip status
      const { data: trip, error: fetchError } = await supabase
        .from('business_trips')
        .select('status, employee_id')
        .eq('id', tripId)
        .single();

      if (fetchError) throw fetchError;

      let newStatus: TripStatus;
      if (asHR) {
        newStatus = 'hr_approved';
      } else {
        // Manager approval
        newStatus = 'manager_approved';
      }

      const { data, error } = await supabase
        .from('business_trips')
        .update({ status: newStatus })
        .eq('id', tripId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.businessTrips.teamApprovals });
      queryClient.invalidateQueries({ queryKey: queryKeys.businessTrips.hrApprovals });
      queryClient.invalidateQueries({ queryKey: ['business-trips', 'pending-approvals'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.businessTrips.all() });
      toast({
        title: 'Trip approved',
        description: 'The business trip has been approved.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to approve trip',
        variant: 'destructive',
      });
    },
  });
}

// Reject trip (Manager or HR)
export function useRejectBusinessTrip() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ tripId, reason }: { tripId: string; reason: string }) => {
      const { data, error } = await supabase
        .from('business_trips')
        .update({ 
          status: 'rejected',
          rejection_reason: reason,
        })
        .eq('id', tripId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.businessTrips.teamApprovals });
      queryClient.invalidateQueries({ queryKey: queryKeys.businessTrips.hrApprovals });
      queryClient.invalidateQueries({ queryKey: ['business-trips', 'pending-approvals'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.businessTrips.all() });
      toast({
        title: 'Trip rejected',
        description: 'The business trip has been rejected.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to reject trip',
        variant: 'destructive',
      });
    },
  });
}

// Close/Reconcile trip (HR only)
export function useCloseBusinessTrip() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (tripId: string) => {
      const { data, error } = await supabase
        .from('business_trips')
        .update({ 
          status: 'reconciled',
          closed_at: new Date().toISOString(),
          closed_by: user?.id,
        })
        .eq('id', tripId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.businessTrips.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.businessTrips.all() });
      toast({
        title: 'Trip closed',
        description: 'The business trip has been reconciled and closed.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to close trip',
        variant: 'destructive',
      });
    },
  });
}

// Delete draft trip
export function useDeleteBusinessTrip() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tripId: string) => {
      const { error } = await supabase
        .from('business_trips')
        .delete()
        .eq('id', tripId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-trips', 'my'] });
      toast({
        title: 'Trip deleted',
        description: 'The draft business trip has been deleted.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete trip',
        variant: 'destructive',
      });
    },
  });
}
