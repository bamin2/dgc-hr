import React, { createContext, useContext, useCallback, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AppRole, mockCurrentUser, UserRole } from '@/data/roles';
import {
  RoleContextType,
  ImpersonatedEmployee,
  useCurrentUserRole,
  useAllUserRoles,
  useTeamMembers,
  useImpersonation,
  useRolePermissions,
  useRoleManagement,
} from './role';

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const { user, profile } = useAuth();

  // Core data hooks
  const { currentUser, setCurrentUser, isLoading: userLoading } = useCurrentUserRole(user, profile);
  const { userRoles, isLoading: rolesLoading } = useAllUserRoles(user);
  const { teamMemberIds, isLoading: teamLoading } = useTeamMembers(profile?.employee_id);

  // Local state for userRoles updates (needed for updateEmployeeRole)
  const [localUserRoles, setLocalUserRoles] = useState<UserRole[]>([]);
  
  // Merge fetched roles with local updates
  const mergedUserRoles = useMemo(() => {
    if (localUserRoles.length === 0) return userRoles;
    
    // Local updates take precedence
    const localUserIds = new Set(localUserRoles.map(r => r.userId));
    const filtered = userRoles.filter(r => !localUserIds.has(r.userId));
    return [...filtered, ...localUserRoles];
  }, [userRoles, localUserRoles]);

  // Impersonation
  const impersonation = useImpersonation(
    currentUser,
    setCurrentUser,
    profile?.employee_id,
    teamMemberIds
  );

  // Permissions (based on effective role from impersonation)
  const permissions = useRolePermissions(
    impersonation.effectiveRole,
    impersonation.actualRole,
    impersonation.isImpersonating,
    impersonation.impersonatedEmployee,
    impersonation.isImpersonating 
      ? impersonation.effectiveTeamMemberIds 
      : teamMemberIds
  );

  // Role management (CRUD operations)
  const roleManagement = useRoleManagement(mergedUserRoles, setLocalUserRoles);

  // Simple role check
  const hasRole = useCallback(
    (role: AppRole) => currentUser.role === role,
    [currentUser.role]
  );

  // For demo purposes - allows switching the current user's role
  const setCurrentUserRole = useCallback(
    (role: AppRole) => setCurrentUser(prev => ({ ...prev, role })),
    [setCurrentUser]
  );

  // Combined loading state
  const isLoading = userLoading || rolesLoading || teamLoading;

  // Memoized context value to prevent unnecessary re-renders
  const contextValue = useMemo<RoleContextType>(
    () => ({
      // User info
      currentUser,
      userRoles: mergedUserRoles,
      hasRole,
      setCurrentUserRole,
      
      // Role management
      getEmployeeRole: roleManagement.getEmployeeRole,
      updateEmployeeRole: roleManagement.updateEmployeeRole,
      
      // Permissions
      canAccessManagement: permissions.canAccessManagement,
      canAccessCompany: permissions.canAccessCompany,
      canManageRoles: permissions.canManageRoles,
      canEditEmployees: permissions.canEditEmployees,
      isManager: permissions.isManager,
      canImpersonate: permissions.canImpersonate,
      isTeamMember: permissions.isTeamMember,
      canApproveLeaveFor: permissions.canApproveLeaveFor,
      
      // Team
      teamMemberIds,
      
      // Impersonation
      isImpersonating: impersonation.isImpersonating,
      actualRole: impersonation.actualRole,
      impersonatedEmployee: impersonation.impersonatedEmployee,
      effectiveEmployeeId: impersonation.effectiveEmployeeId,
      effectiveTeamMemberIds: impersonation.effectiveTeamMemberIds,
      startImpersonation: impersonation.startImpersonation,
      stopImpersonation: impersonation.stopImpersonation,
      
      // Loading
      isLoading,
    }),
    [
      currentUser,
      mergedUserRoles,
      hasRole,
      setCurrentUserRole,
      roleManagement,
      permissions,
      teamMemberIds,
      impersonation,
      isLoading,
    ]
  );

  return (
    <RoleContext.Provider value={contextValue}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
}

// Re-export types for consumers
export type { ImpersonatedEmployee, RoleContextType };
