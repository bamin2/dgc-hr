// Types
export type { ImpersonatedEmployee, RoleContextType } from './types';

// Constants
export { ROLE_PRIORITY, MANAGEMENT_ROLES, getHighestPriorityRole } from './constants';

// React Query optimized hooks (preferred)
export { useCurrentUserRoleQuery } from './useCurrentUserRoleQuery';
export { useAllUserRolesQuery } from './useAllUserRolesQuery';
export { useTeamMembersQuery } from './useTeamMembersQuery';

// Impersonation and permissions
export { useImpersonation } from './useImpersonation';
export { useRolePermissions } from './useRolePermissions';
export { useRoleManagement } from './useRoleManagement';
