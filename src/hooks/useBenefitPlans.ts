import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { queryKeys } from '@/lib/queryKeys';

export type BenefitType = 'health' | 'dental' | 'vision' | 'life' | 'disability' | 'retirement' | 'wellness' | 'other';
export type BenefitStatus = 'active' | 'inactive' | 'pending';

export interface CoverageLevel {
  id: string;
  plan_id: string;
  name: string;
  employee_cost: number;
  employer_cost: number;
  coverage_details: Record<string, string | number | boolean | null> | null;
  created_at: string;
}

export interface BenefitPlan {
  id: string;
  name: string;
  type: BenefitType;
  provider: string;
  description: string | null;
  status: BenefitStatus;
  enrolled_count: number;
  features: string[];
  policy_document_url: string | null;
  created_at: string;
  updated_at: string;
  coverage_levels?: CoverageLevel[];
}

export function useBenefitPlans(status?: BenefitStatus) {
  return useQuery({
    queryKey: status ? queryKeys.benefits.plans.byStatus(status) : queryKeys.benefits.plans.all,
    queryFn: async () => {
      let query = supabase
        .from('benefit_plans')
        .select(`
          *,
          coverage_levels:benefit_coverage_levels (*)
        `)
        .order('name');

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as BenefitPlan[];
    },
  });
}

export function useBenefitPlan(planId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.benefits.plans.detail(planId || ''),
    queryFn: async () => {
      if (!planId) return null;

      const { data, error } = await supabase
        .from('benefit_plans')
        .select(`
          *,
          coverage_levels:benefit_coverage_levels (*)
        `)
        .eq('id', planId)
        .single();

      if (error) throw error;
      return data as BenefitPlan;
    },
    enabled: !!planId,
  });
}

export function useCreateBenefitPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (plan: {
      name: string;
      type: BenefitType;
      provider: string;
      description?: string;
      status?: BenefitStatus;
      features?: string[];
      coverageLevels?: Array<{
        name: string;
        employee_cost: number;
        employer_cost: number;
        coverage_details?: Record<string, unknown>;
      }>;
    }) => {
      // Insert the plan first
      const { data: planData, error: planError } = await supabase
        .from('benefit_plans')
        .insert({
          name: plan.name,
          type: plan.type,
          provider: plan.provider,
          description: plan.description,
          status: plan.status || 'active',
          features: plan.features || [],
        })
        .select()
        .single();

      if (planError) throw planError;

      // Insert coverage levels if provided
      if (plan.coverageLevels && plan.coverageLevels.length > 0) {
        const { error: levelsError } = await supabase
          .from('benefit_coverage_levels')
          .insert(
            plan.coverageLevels.map(level => ({
              plan_id: planData.id,
              name: level.name,
              employee_cost: level.employee_cost,
              employer_cost: level.employer_cost,
            }))
          );

        if (levelsError) throw levelsError;
      }

      return planData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.benefits.plans.all });
    },
  });
}

export function useUpdateBenefitPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: Partial<BenefitPlan> & { id: string }) => {
      const { data, error } = await supabase
        .from('benefit_plans')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.benefits.plans.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.benefits.plans.detail(variables.id) });
    },
  });
}

export function useDeleteBenefitPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (planId: string) => {
      const { error } = await supabase
        .from('benefit_plans')
        .delete()
        .eq('id', planId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.benefits.plans.all });
    },
  });
}
