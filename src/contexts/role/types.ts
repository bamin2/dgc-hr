import { AppRole, CurrentUser, UserRole } from '@/data/roles';

export interface ImpersonatedEmployee {
  id: string;
  name: string;
  avatar?: string;
  department?: string;
  position?: string;
  isManager?: boolean;
  teamMemberIds?: string[];
}

export interface RoleContextType {
  // Current user info
  currentUser: CurrentUser;
  userRoles: UserRole[];
  
  // Role checks
  hasRole: (role: AppRole) => boolean;
  getEmployeeRole: (employeeId: string) => AppRole;
  updateEmployeeRole: (employeeId: string, newRole: AppRole) => Promise<{ error?: string }>;
  setCurrentUserRole: (role: AppRole) => void;
  
  // Permission flags
  canAccessManagement: boolean;
  canAccessCompany: boolean;
  canManageRoles: boolean;
  canEditEmployees: boolean;
  isManager: boolean;
  
  // Team management
  teamMemberIds: string[];
  isTeamMember: (employeeId: string) => boolean;
  canApproveLeaveFor: (employeeId: string) => boolean;
  
  // Impersonation
  isImpersonating: boolean;
  actualRole: AppRole;
  canImpersonate: boolean;
  impersonatedEmployee: ImpersonatedEmployee | null;
  effectiveEmployeeId: string | null;
  effectiveTeamMemberIds: string[];
  startImpersonation: (employee: ImpersonatedEmployee) => void;
  stopImpersonation: () => void;
  
  // Loading state
  isLoading: boolean;
}

// Re-export for convenience
export type { AppRole, CurrentUser, UserRole };
