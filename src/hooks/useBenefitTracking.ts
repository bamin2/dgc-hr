import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { queryKeys } from '@/lib/queryKeys';
import type { Json } from '@/integrations/supabase/types';
import type { AirTicketData, PhoneData } from '@/types/benefits';

// ==================== Air Ticket Usage ====================

export interface AirTicketUsage {
  id: string;
  enrollment_id: string;
  usage_date: string;
  notes: string | null;
  created_at: string;
  created_by: string | null;
}

export function useAirTicketUsage(enrollmentId: string | undefined) {
  return useQuery({
    queryKey: ['benefit-ticket-usage', enrollmentId],
    queryFn: async () => {
      if (!enrollmentId) return [];

      const { data, error } = await supabase
        .from('benefit_ticket_usage')
        .select('*')
        .eq('enrollment_id', enrollmentId)
        .order('usage_date', { ascending: false });

      if (error) throw error;
      return data as AirTicketUsage[];
    },
    enabled: !!enrollmentId,
  });
}

export function useMarkTicketUsed() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      enrollmentId,
      usageDate,
      notes,
    }: {
      enrollmentId: string;
      usageDate: string;
      notes?: string;
    }) => {
      // 1. Insert the usage record
      const { error: usageError } = await supabase
        .from('benefit_ticket_usage')
        .insert({
          enrollment_id: enrollmentId,
          usage_date: usageDate,
          notes: notes || null,
        });

      if (usageError) throw usageError;

      // 2. Get current enrollment's entitlement_data
      const { data: enrollment, error: fetchError } = await supabase
        .from('benefit_enrollments')
        .select('entitlement_data')
        .eq('id', enrollmentId)
        .single();

      if (fetchError) throw fetchError;

      // 3. Update the entitlement_data with incremented ticket count
      const currentData = (enrollment?.entitlement_data as unknown as AirTicketData) || {
        tickets_used: 0,
        last_ticket_date: null,
        entitlement_start_date: new Date().toISOString().split('T')[0],
      };

      const updatedData: AirTicketData = {
        ...currentData,
        tickets_used: (currentData.tickets_used || 0) + 1,
        last_ticket_date: usageDate,
      };

      const { error: updateError } = await supabase
        .from('benefit_enrollments')
        .update({ entitlement_data: updatedData as unknown as Json })
        .eq('id', enrollmentId);

      if (updateError) throw updateError;

      return { success: true };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['benefit-ticket-usage', variables.enrollmentId] });
      queryClient.invalidateQueries({ queryKey: queryKeys.benefits.enrollments.all });
    },
  });
}

export function useDeleteTicketUsage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      usageId,
      enrollmentId,
    }: {
      usageId: string;
      enrollmentId: string;
    }) => {
      // 1. Delete the usage record
      const { error: deleteError } = await supabase
        .from('benefit_ticket_usage')
        .delete()
        .eq('id', usageId);

      if (deleteError) throw deleteError;

      // 2. Get current enrollment's entitlement_data
      const { data: enrollment, error: fetchError } = await supabase
        .from('benefit_enrollments')
        .select('entitlement_data')
        .eq('id', enrollmentId)
        .single();

      if (fetchError) throw fetchError;

      // 3. Decrement the ticket count
      const currentData = (enrollment?.entitlement_data as unknown as AirTicketData) || {
        tickets_used: 0,
        last_ticket_date: null,
        entitlement_start_date: new Date().toISOString().split('T')[0],
      };

      const updatedData: AirTicketData = {
        ...currentData,
        tickets_used: Math.max(0, (currentData.tickets_used || 0) - 1),
      };

      const { error: updateError } = await supabase
        .from('benefit_enrollments')
        .update({ entitlement_data: updatedData as unknown as Json })
        .eq('id', enrollmentId);

      if (updateError) throw updateError;

      return { success: true };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['benefit-ticket-usage', variables.enrollmentId] });
      queryClient.invalidateQueries({ queryKey: queryKeys.benefits.enrollments.all });
    },
  });
}

// ==================== Phone Payment Tracking ====================

export function useRecordPhonePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      enrollmentId,
      paymentAmount,
    }: {
      enrollmentId: string;
      paymentAmount: number;
    }) => {
      // 1. Get current enrollment's entitlement_data
      const { data: enrollment, error: fetchError } = await supabase
        .from('benefit_enrollments')
        .select('entitlement_data')
        .eq('id', enrollmentId)
        .single();

      if (fetchError) throw fetchError;

      // 2. Update the entitlement_data with new payment
      const currentData = (enrollment?.entitlement_data as unknown as PhoneData) || {
        installments_paid: 0,
        total_paid: 0,
        remaining_balance: 0,
      };

      const updatedData: PhoneData = {
        installments_paid: (currentData.installments_paid || 0) + 1,
        total_paid: (currentData.total_paid || 0) + paymentAmount,
        remaining_balance: Math.max(0, (currentData.remaining_balance || 0) - paymentAmount),
      };

      const { error: updateError } = await supabase
        .from('benefit_enrollments')
        .update({ entitlement_data: updatedData as unknown as Json })
        .eq('id', enrollmentId);

      if (updateError) throw updateError;

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.benefits.enrollments.all });
    },
  });
}

// ==================== Entitlement Data Initialization ====================

export function initializeAirTicketData(startDate: string): AirTicketData {
  return {
    tickets_used: 0,
    last_ticket_date: null,
    entitlement_start_date: startDate,
  };
}

export function initializePhoneData(totalDeviceCost: number): PhoneData {
  return {
    installments_paid: 0,
    total_paid: 0,
    remaining_balance: totalDeviceCost,
  };
}

// ==================== Update Enrollment Entitlement Data ====================

export function useUpdateEnrollmentEntitlementData() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      enrollmentId,
      entitlementData,
    }: {
      enrollmentId: string;
      entitlementData: AirTicketData | PhoneData;
    }) => {
      const { error } = await supabase
        .from('benefit_enrollments')
        .update({ entitlement_data: entitlementData as unknown as Json })
        .eq('id', enrollmentId);

      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.benefits.enrollments.all });
    },
  });
}
