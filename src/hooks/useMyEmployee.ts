import { useAuth } from '@/contexts/AuthContext';
import { useEmployee } from '@/hooks/useEmployees';

export function useMyEmployee() {
  const { profile } = useAuth();
  const employeeId = profile?.employee_id;
  
  return useEmployee(employeeId || '');
}
