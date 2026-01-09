import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AppRole, CurrentUser } from '@/data/roles';
import { ImpersonatedEmployee } from './types';

interface UseImpersonationResult {
  isImpersonating: boolean;
  actualRole: AppRole;
  impersonatedEmployee: ImpersonatedEmployee | null;
  effectiveRole: AppRole;
  effectiveEmployeeId: string | null;
  effectiveTeamMemberIds: string[];
  startImpersonation: (employee: ImpersonatedEmployee) => void;
  stopImpersonation: () => void;
}

export function useImpersonation(
  currentUser: CurrentUser,
  setCurrentUser: React.Dispatch<React.SetStateAction<CurrentUser>>,
  profileEmployeeId: string | null | undefined,
  teamMemberIds: string[]
): UseImpersonationResult {
  const [isImpersonating, setIsImpersonating] = useState(false);
  const [actualRole, setActualRole] = useState<AppRole>('employee');
  const [impersonatedEmployee, setImpersonatedEmployee] = useState<ImpersonatedEmployee | null>(null);

  // Update actualRole when user role changes (but not during impersonation)
  useEffect(() => {
    if (!isImpersonating && currentUser.role) {
      setActualRole(currentUser.role);
    }
  }, [currentUser.role, isImpersonating]);

  // Effective role for permissions (respects impersonation)
  const effectiveRole = isImpersonating ? 'employee' : currentUser.role;

  // Effective employee ID for data fetching
  const effectiveEmployeeId = isImpersonating
    ? impersonatedEmployee?.id ?? null
    : profileEmployeeId ?? null;

  // Effective team member IDs (impersonated employee's team or actual user's team)
  const effectiveTeamMemberIds = isImpersonating
    ? impersonatedEmployee?.teamMemberIds ?? []
    : teamMemberIds;

  const startImpersonation = useCallback(async (employee: ImpersonatedEmployee) => {
    if (!isImpersonating) {
      setActualRole(currentUser.role);

      // Fetch the employee's team members if they're a manager
      const { data: teamData } = await supabase
        .from('employees')
        .select('id')
        .eq('manager_id', employee.id);

      const employeeTeamIds = teamData?.map(e => e.id) || [];
      const isEmployeeManager = employeeTeamIds.length > 0;

      setImpersonatedEmployee({
        ...employee,
        isManager: isEmployeeManager,
        teamMemberIds: employeeTeamIds,
      });

      setIsImpersonating(true);
      setCurrentUser(prev => ({ ...prev, role: isEmployeeManager ? 'manager' : 'employee' }));
    }
  }, [currentUser.role, isImpersonating, setCurrentUser]);

  const stopImpersonation = useCallback(() => {
    setIsImpersonating(false);
    setImpersonatedEmployee(null);
    setCurrentUser(prev => ({ ...prev, role: actualRole }));
  }, [actualRole, setCurrentUser]);

  return {
    isImpersonating,
    actualRole,
    impersonatedEmployee,
    effectiveRole,
    effectiveEmployeeId,
    effectiveTeamMemberIds,
    startImpersonation,
    stopImpersonation,
  };
}
