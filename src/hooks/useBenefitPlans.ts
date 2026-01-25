import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { queryKeys } from '@/lib/queryKeys';
import type { Json } from '@/integrations/supabase/types';

export type BenefitType = 'health' | 'dental' | 'vision' | 'life' | 'disability' | 'retirement' | 'wellness' | 'air_ticket' | 'car_park' | 'phone' | 'other';
export type BenefitStatus = 'active' | 'inactive' | 'pending';
export type CostFrequency = 'monthly' | 'yearly';

// Type-specific configuration interfaces
export interface AirTicketConfig {
  tickets_per_period: number;
  period_years: number;
}

// CarParkConfig is intentionally empty - car park plans use standard coverage levels
// Spot location is stored in enrollment.entitlement_data, not in the plan config
export interface CarParkConfig {
  // Reserved for future plan-level settings
}

// Car Park enrollment-specific data (stored in entitlement_data)
export interface CarParkData {
  spot_location?: string;
}

export interface PhoneConfig {
  total_device_cost: number;
  monthly_installment: number;
  installment_months: number;
}

export type EntitlementConfig = AirTicketConfig | CarParkConfig | PhoneConfig;

// Type-specific tracking data interfaces
export interface AirTicketData {
  tickets_used: number;
  last_ticket_date: string | null;
  entitlement_start_date: string;
}

export interface PhoneData {
  installments_paid: number;
  total_paid: number;
  remaining_balance: number;
}

export type EntitlementData = AirTicketData | PhoneData;

// Coverage level details can include air ticket config for per-level entitlements
export interface CoverageLevelDetails {
  tickets_per_period?: number;
  period_years?: number;
  [key: string]: string | number | boolean | null | undefined;
}

export interface CoverageLevel {
  id: string;
  plan_id: string;
  name: string;
  employee_cost: number;
  employer_cost: number;
  coverage_details: CoverageLevelDetails | null;
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
  expiry_date: string | null;
  cost_frequency: CostFrequency;
  created_at: string;
  updated_at: string;
  currency: string;
  entitlement_config: EntitlementConfig | null;
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
      expiry_date?: string;
      cost_frequency?: CostFrequency;
      entitlement_config?: EntitlementConfig;
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
          expiry_date: plan.expiry_date,
          cost_frequency: plan.cost_frequency || 'monthly',
          entitlement_config: plan.entitlement_config as Json | null,
        } as never)
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
              coverage_details: (level.coverage_details || null) as Json,
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
      coverage_levels: _coverageLevels, // Exclude from update
      ...updates
    }: Partial<BenefitPlan> & { id: string }) => {
      // Cast entitlement_config for JSON compatibility
      const updatePayload = {
        ...updates,
        entitlement_config: updates.entitlement_config as Json | null | undefined,
      };
      
      const { data, error } = await supabase
        .from('benefit_plans')
        .update(updatePayload as never)
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

export function useUpdateCoverageLevels() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      planId,
      coverageLevels,
      originalLevelIds,
    }: {
      planId: string;
      coverageLevels: Array<{
        id?: string;
        name: string;
        employee_cost: number;
        employer_cost: number;
        coverage_details?: CoverageLevelDetails | null;
      }>;
      originalLevelIds: string[];
    }): Promise<{ skippedLevels: string[] }> => {
      // Separate existing levels (with id) from new levels (without id)
      const existingLevels = coverageLevels.filter(cl => cl.id);
      const newLevels = coverageLevels.filter(cl => !cl.id);
      
      // Find levels to delete (in original but not in current)
      const currentIds = existingLevels.map(cl => cl.id!);
      const idsToDelete = originalLevelIds.filter(id => !currentIds.includes(id));

      // Check which levels have enrollments before deleting
      const skippedLevels: string[] = [];
      const levelsThatCanBeDeleted: string[] = [];

      for (const id of idsToDelete) {
        const { count } = await supabase
          .from('benefit_enrollments')
          .select('*', { count: 'exact', head: true })
          .eq('coverage_level_id', id);
        
        if (count && count > 0) {
          skippedLevels.push(id);
        } else {
          levelsThatCanBeDeleted.push(id);
        }
      }

      // Only delete levels without enrollments
      if (levelsThatCanBeDeleted.length > 0) {
        const { error: deleteError } = await supabase
          .from('benefit_coverage_levels')
          .delete()
          .in('id', levelsThatCanBeDeleted);
        if (deleteError) throw deleteError;
      }

      // Update existing levels
      for (const level of existingLevels) {
        const { error: updateError } = await supabase
          .from('benefit_coverage_levels')
          .update({
            name: level.name,
            employee_cost: level.employee_cost,
            employer_cost: level.employer_cost,
            coverage_details: (level.coverage_details || null) as Json,
          })
          .eq('id', level.id!);
        if (updateError) throw updateError;
      }

      // Insert new levels
      if (newLevels.length > 0) {
        const { error: insertError } = await supabase
          .from('benefit_coverage_levels')
          .insert(
            newLevels.map(level => ({
              plan_id: planId,
              name: level.name,
              employee_cost: level.employee_cost,
              employer_cost: level.employer_cost,
              coverage_details: (level.coverage_details || null) as Json,
            }))
          );
        if (insertError) throw insertError;
      }

      return { skippedLevels };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.benefits.plans.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.benefits.plans.detail(variables.planId) });
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
