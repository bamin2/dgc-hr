import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { queryKeys } from '@/lib/queryKeys';
import { measureAsync } from '@/lib/perf';

export interface BenefitsMetrics {
  totalPlans: number;
  activeEnrollments: number;
  pendingClaims: number;
  monthlyBenefitsCost: number;
  enrollmentRate: number;
}

export function useBenefitsMetrics() {
  return useQuery({
    queryKey: queryKeys.benefits.metrics,
    queryFn: () => measureAsync('BenefitsMetrics: all queries', async () => {
      // Get active plans count
      const { count: totalPlans, error: plansError } = await supabase
        .from('benefit_plans')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'active');

      if (plansError) throw plansError;

      // Get active enrollments count and total monthly cost
      const { data: enrollments, error: enrollmentsError } = await supabase
        .from('benefit_enrollments')
        .select('employee_contribution, employer_contribution')
        .eq('status', 'active');

      if (enrollmentsError) throw enrollmentsError;

      const activeEnrollments = enrollments?.length || 0;
      const monthlyBenefitsCost = enrollments?.reduce(
        (sum, e) => sum + Number(e.employee_contribution) + Number(e.employer_contribution),
        0
      ) || 0;

      // Get pending claims count
      const { count: pendingClaims, error: claimsError } = await supabase
        .from('benefit_claims')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'pending');

      if (claimsError) throw claimsError;

      // Get total active employees for enrollment rate
      const { count: totalEmployees, error: employeesError } = await supabase
        .from('employees')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'active');

      if (employeesError) throw employeesError;

      // Get unique employees with active enrollments
      const { data: enrolledEmployees, error: enrolledError } = await supabase
        .from('benefit_enrollments')
        .select('employee_id')
        .eq('status', 'active');

      if (enrolledError) throw enrolledError;

      const uniqueEnrolledEmployees = new Set(enrolledEmployees?.map(e => e.employee_id)).size;
      const enrollmentRate = totalEmployees && totalEmployees > 0
        ? Math.round((uniqueEnrolledEmployees / totalEmployees) * 100)
        : 0;

      return {
        totalPlans: totalPlans || 0,
        activeEnrollments,
        pendingClaims: pendingClaims || 0,
        monthlyBenefitsCost,
        enrollmentRate,
      } as BenefitsMetrics;
    }),
  });
}
