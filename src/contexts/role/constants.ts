import { AppRole } from '@/data/roles';

// Role priority for determining the highest role when user has multiple
export const ROLE_PRIORITY: Record<AppRole, number> = {
  employee: 1,
  manager: 2,
  hr: 3,
  admin: 4,
} as const;

// Roles that can access management features
export const MANAGEMENT_ROLES: readonly AppRole[] = ['hr', 'manager', 'admin'] as const;

// Helper to get highest priority role from a list
export function getHighestPriorityRole(roles: AppRole[]): AppRole {
  if (roles.length === 0) return 'employee';
  
  return roles.reduce((highest, current) => {
    return ROLE_PRIORITY[current] > ROLE_PRIORITY[highest] ? current : highest;
  }, 'employee' as AppRole);
}
