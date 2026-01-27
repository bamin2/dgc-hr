import { useAuth } from '@/contexts/AuthContext';
import { useEmployee } from '@/hooks/useEmployees';

export function useMyEmployee() {
  const { profile, loading: authLoading } = useAuth();
  const employeeId = profile?.employee_id;
  
  const employeeQuery = useEmployee(employeeId || undefined);
  
  return {
    ...employeeQuery,
    // Consider auth loading as part of overall loading state
    isLoading: authLoading || employeeQuery.isLoading,
    // Profile may be loaded but employee_id not linked yet
    isProfileLoading: authLoading,
  };
}
