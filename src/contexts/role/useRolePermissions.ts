import { useCallback, useMemo } from 'react';
import { AppRole } from '@/data/roles';
import { MANAGEMENT_ROLES } from './constants';
import { ImpersonatedEmployee } from './types';

interface UseRolePermissionsResult {
  canAccessManagement: boolean;
  canAccessCompany: boolean;
  canManageRoles: boolean;
  canEditEmployees: boolean;
  isManager: boolean;
  canImpersonate: boolean;
  isTeamMember: (employeeId: string) => boolean;
  canApproveLeaveFor: (employeeId: string) => boolean;
}

export function useRolePermissions(
  effectiveRole: AppRole,
  actualRole: AppRole,
  isImpersonating: boolean,
  impersonatedEmployee: ImpersonatedEmployee | null,
  teamMemberIds: string[]
): UseRolePermissionsResult {
  const canAccessManagement = useMemo(
    () => MANAGEMENT_ROLES.includes(effectiveRole),
    [effectiveRole]
  );

  const canAccessCompany = useMemo(
    () => MANAGEMENT_ROLES.includes(effectiveRole),
    [effectiveRole]
  );

  const canManageRoles = useMemo(
    () => effectiveRole === 'hr' || effectiveRole === 'admin',
    [effectiveRole]
  );

  const canEditEmployees = useMemo(
    () => effectiveRole === 'hr' || effectiveRole === 'admin',
    [effectiveRole]
  );

  const isManager = useMemo(
    () => effectiveRole === 'manager' || (isImpersonating && (impersonatedEmployee?.isManager ?? false)),
    [effectiveRole, isImpersonating, impersonatedEmployee?.isManager]
  );

  // Impersonation toggle visibility based on actual role (not effective role)
  const canImpersonate = useMemo(
    () => actualRole === 'hr' || actualRole === 'admin',
    [actualRole]
  );

  // Check if an employee is a team member (for managers)
  const isTeamMember = useCallback(
    (employeeId: string) => teamMemberIds.includes(employeeId),
    [teamMemberIds]
  );

  // Check if current user can approve leave for a specific employee
  const canApproveLeaveFor = useCallback(
    (employeeId: string) => {
      // HR and Admin can approve any leave
      if (canEditEmployees) return true;
      // Manager can approve their team members' leave
      if (isManager && teamMemberIds.includes(employeeId)) return true;
      return false;
    },
    [canEditEmployees, isManager, teamMemberIds]
  );

  return {
    canAccessManagement,
    canAccessCompany,
    canManageRoles,
    canEditEmployees,
    isManager,
    canImpersonate,
    isTeamMember,
    canApproveLeaveFor,
  };
}
