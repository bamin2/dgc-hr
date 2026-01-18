import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { queryKeys } from '@/lib/queryKeys';

export type EnrollmentStatus = 'active' | 'pending' | 'cancelled' | 'expired';

export interface BenefitEnrollment {
  id: string;
  employee_id: string;
  plan_id: string;
  coverage_level_id: string;
  status: EnrollmentStatus;
  start_date: string;
  end_date: string | null;
  employee_contribution: number;
  employer_contribution: number;
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
    currency: string;
  };
  coverage_level?: {
    id: string;
    name: string;
    employee_cost: number;
    employer_cost: number;
  };
  beneficiaries?: Array<{
    id: string;
    name: string;
    relationship: string;
    date_of_birth: string | null;
    percentage: number;
    national_id?: string | null;
  }>;
}

export function useBenefitEnrollments(filters?: {
  status?: EnrollmentStatus;
  employeeId?: string;
  planId?: string;
}) {
  return useQuery({
    queryKey: [...queryKeys.benefits.enrollments.all, filters],
    queryFn: async () => {
      let query = supabase
        .from('benefit_enrollments')
        .select(`
          *,
          employee:employees!benefit_enrollments_employee_id_fkey (
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
          plan:benefit_plans!benefit_enrollments_plan_id_fkey (
            id,
            name,
            type,
            provider,
            currency
          ),
          coverage_level:benefit_coverage_levels!benefit_enrollments_coverage_level_id_fkey (
            id,
            name,
            employee_cost,
            employer_cost
          ),
          beneficiaries:benefit_beneficiaries (
            id,
            name,
            relationship,
            date_of_birth,
            percentage,
            national_id
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
      return data as BenefitEnrollment[];
    },
  });
}

export function useBenefitEnrollment(enrollmentId: string | undefined) {
  return useQuery({
    queryKey: [...queryKeys.benefits.enrollments.all, enrollmentId],
    queryFn: async () => {
      if (!enrollmentId) return null;

      const { data, error } = await supabase
        .from('benefit_enrollments')
        .select(`
          *,
          employee:employees!benefit_enrollments_employee_id_fkey (
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
          plan:benefit_plans!benefit_enrollments_plan_id_fkey (
            id,
            name,
            type,
            provider,
            currency,
            description,
            features
          ),
          coverage_level:benefit_coverage_levels!benefit_enrollments_coverage_level_id_fkey (
            id,
            name,
            employee_cost,
            employer_cost
          ),
          beneficiaries:benefit_beneficiaries (
            id,
            name,
            relationship,
            date_of_birth,
            percentage,
            national_id
          )
        `)
        .eq('id', enrollmentId)
        .single();

      if (error) throw error;
      return data as BenefitEnrollment;
    },
    enabled: !!enrollmentId,
  });
}

export function useCreateBenefitEnrollment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (enrollment: {
      employee_id: string;
      plan_id: string;
      coverage_level_id: string;
      start_date: string;
      end_date?: string;
      employee_contribution: number;
      employer_contribution: number;
      beneficiaries?: Array<{
        name: string;
        relationship: string;
        date_of_birth?: string;
        percentage?: number;
        national_id?: string;
      }>;
    }) => {
      // Insert the enrollment
      const { data: enrollmentData, error: enrollmentError } = await supabase
        .from('benefit_enrollments')
        .insert({
          employee_id: enrollment.employee_id,
          plan_id: enrollment.plan_id,
          coverage_level_id: enrollment.coverage_level_id,
          start_date: enrollment.start_date,
          end_date: enrollment.end_date,
          employee_contribution: enrollment.employee_contribution,
          employer_contribution: enrollment.employer_contribution,
          status: 'active',
        })
        .select()
        .single();

      if (enrollmentError) throw enrollmentError;

      // Insert beneficiaries if provided
      if (enrollment.beneficiaries && enrollment.beneficiaries.length > 0) {
        const { error: beneficiariesError } = await supabase
          .from('benefit_beneficiaries')
          .insert(
            enrollment.beneficiaries.map(b => ({
              enrollment_id: enrollmentData.id,
              name: b.name,
              relationship: b.relationship,
              date_of_birth: b.date_of_birth,
              percentage: b.percentage || 100,
              national_id: b.national_id,
            }))
          );

        if (beneficiariesError) throw beneficiariesError;
      }

      return enrollmentData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.benefits.enrollments.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.benefits.plans.all });
    },
  });
}

export function useUpdateBenefitEnrollment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: {
      id: string;
      status?: EnrollmentStatus;
      coverage_level_id?: string;
      start_date?: string;
      end_date?: string | null;
      employee_contribution?: number;
      employer_contribution?: number;
    }) => {
      const { data, error } = await supabase
        .from('benefit_enrollments')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.benefits.enrollments.all });
      queryClient.invalidateQueries({ queryKey: [...queryKeys.benefits.enrollments.all, variables.id] });
    },
  });
}

export function useUpdateBeneficiaries() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      enrollmentId,
      beneficiaries,
    }: {
      enrollmentId: string;
      beneficiaries: Array<{
        id?: string;
        name: string;
        relationship: string;
        date_of_birth?: string | null;
        percentage?: number;
        national_id?: string | null;
      }>;
    }) => {
      // Delete existing beneficiaries
      await supabase
        .from('benefit_beneficiaries')
        .delete()
        .eq('enrollment_id', enrollmentId);

      // Insert new beneficiaries if any
      if (beneficiaries.length > 0) {
        const { error } = await supabase
          .from('benefit_beneficiaries')
          .insert(
            beneficiaries.map(b => ({
              enrollment_id: enrollmentId,
              name: b.name,
              relationship: b.relationship,
              date_of_birth: b.date_of_birth,
              percentage: b.percentage || 100,
              national_id: b.national_id,
            }))
          );
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.benefits.enrollments.all });
    },
  });
}

export function useCancelBenefitEnrollment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (enrollmentId: string) => {
      const { data, error } = await supabase
        .from('benefit_enrollments')
        .update({ status: 'cancelled', end_date: new Date().toISOString().split('T')[0] })
        .eq('id', enrollmentId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.benefits.enrollments.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.benefits.plans.all });
    },
  });
}
