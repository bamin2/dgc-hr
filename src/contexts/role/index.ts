// Types
export type { ImpersonatedEmployee, RoleContextType } from './types';

// Constants
export { ROLE_PRIORITY, MANAGEMENT_ROLES, getHighestPriorityRole } from './constants';

// Legacy hooks (kept for backward compatibility)
export { useCurrentUserRole } from './useCurrentUserRole';
export { useAllUserRoles } from './useAllUserRoles';
export { useTeamMembers } from './useTeamMembers';

// React Query optimized hooks
export { useCurrentUserRoleQuery } from './useCurrentUserRoleQuery';
export { useAllUserRolesQuery } from './useAllUserRolesQuery';
export { useTeamMembersQuery } from './useTeamMembersQuery';

// Impersonation and permissions
export { useImpersonation } from './useImpersonation';
export { useRolePermissions } from './useRolePermissions';
export { useRoleManagement } from './useRoleManagement';
