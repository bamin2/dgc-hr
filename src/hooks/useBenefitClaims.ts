import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type ClaimStatus = 'pending' | 'approved' | 'rejected' | 'processing';

export interface BenefitClaim {
  id: string;
  employee_id: string;
  plan_id: string;
  enrollment_id: string;
  claim_number: string;
  claim_date: string;
  service_date: string;
  amount: number;
  approved_amount: number | null;
  status: ClaimStatus;
  description: string | null;
  provider_name: string | null;
  rejection_reason: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
  employee?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    avatar_url: string | null;
    department?: {
      id: string;
      name: string;
    } | null;
  };
  plan?: {
    id: string;
    name: string;
    type: string;
    provider: string;
  };
  reviewer?: {
    id: string;
    first_name: string;
    last_name: string;
  } | null;
}

export function useBenefitClaims(filters?: {
  status?: ClaimStatus;
  employeeId?: string;
  planId?: string;
}) {
  return useQuery({
    queryKey: ['benefit-claims', filters],
    queryFn: async () => {
      let query = supabase
        .from('benefit_claims')
        .select(`
          *,
          employee:employees!benefit_claims_employee_id_fkey (
            id,
            first_name,
            last_name,
            email,
            avatar_url,
            department:departments!employees_department_id_fkey (
              id,
              name
            )
          ),
          plan:benefit_plans!benefit_claims_plan_id_fkey (
            id,
            name,
            type,
            provider
          ),
          reviewer:employees!benefit_claims_reviewed_by_fkey (
            id,
            first_name,
            last_name
          )
        `)
        .order('created_at', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.employeeId) {
        query = query.eq('employee_id', filters.employeeId);
      }
      if (filters?.planId) {
        query = query.eq('plan_id', filters.planId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as BenefitClaim[];
    },
  });
}

export function useBenefitClaim(claimId: string | undefined) {
  return useQuery({
    queryKey: ['benefit-claim', claimId],
    queryFn: async () => {
      if (!claimId) return null;

      const { data, error } = await supabase
        .from('benefit_claims')
        .select(`
          *,
          employee:employees!benefit_claims_employee_id_fkey (
            id,
            first_name,
            last_name,
            email,
            avatar_url,
            department:departments!employees_department_id_fkey (
              id,
              name
            )
          ),
          plan:benefit_plans!benefit_claims_plan_id_fkey (
            id,
            name,
            type,
            provider,
            description
          ),
          reviewer:employees!benefit_claims_reviewed_by_fkey (
            id,
            first_name,
            last_name
          )
        `)
        .eq('id', claimId)
        .single();

      if (error) throw error;
      return data as BenefitClaim;
    },
    enabled: !!claimId,
  });
}

function generateClaimNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `CLM-${timestamp}-${random}`;
}

export function useCreateBenefitClaim() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (claim: {
      employee_id: string;
      plan_id: string;
      enrollment_id: string;
      service_date: string;
      amount: number;
      description?: string;
      provider_name?: string;
    }) => {
      const { data, error } = await supabase
        .from('benefit_claims')
        .insert({
          employee_id: claim.employee_id,
          plan_id: claim.plan_id,
          enrollment_id: claim.enrollment_id,
          claim_number: generateClaimNumber(),
          claim_date: new Date().toISOString().split('T')[0],
          service_date: claim.service_date,
          amount: claim.amount,
          description: claim.description,
          provider_name: claim.provider_name,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['benefit-claims'] });
    },
  });
}

export function useApproveBenefitClaim() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      claimId,
      approvedAmount,
      reviewerId,
    }: {
      claimId: string;
      approvedAmount: number;
      reviewerId: string;
    }) => {
      const { data, error } = await supabase
        .from('benefit_claims')
        .update({
          status: 'approved',
          approved_amount: approvedAmount,
          reviewed_by: reviewerId,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', claimId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['benefit-claims'] });
      queryClient.invalidateQueries({ queryKey: ['benefit-claim', variables.claimId] });
    },
  });
}

export function useRejectBenefitClaim() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      claimId,
      rejectionReason,
      reviewerId,
    }: {
      claimId: string;
      rejectionReason: string;
      reviewerId: string;
    }) => {
      const { data, error } = await supabase
        .from('benefit_claims')
        .update({
          status: 'rejected',
          rejection_reason: rejectionReason,
          reviewed_by: reviewerId,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', claimId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['benefit-claims'] });
      queryClient.invalidateQueries({ queryKey: ['benefit-claim', variables.claimId] });
    },
  });
}

export function useUpdateClaimStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      claimId,
      status,
    }: {
      claimId: string;
      status: ClaimStatus;
    }) => {
      const { data, error } = await supabase
        .from('benefit_claims')
        .update({ status })
        .eq('id', claimId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['benefit-claims'] });
      queryClient.invalidateQueries({ queryKey: ['benefit-claim', variables.claimId] });
    },
  });
}
