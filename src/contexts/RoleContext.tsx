import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  AppRole, 
  CurrentUser, 
  mockCurrentUser, 
  UserRole 
} from '@/data/roles';

interface RoleContextType {
  currentUser: CurrentUser;
  userRoles: UserRole[];
  hasRole: (role: AppRole) => boolean;
  canAccessManagement: boolean;
  canAccessCompany: boolean;
  canManageRoles: boolean;
  canEditEmployees: boolean;
  isManager: boolean;
  teamMemberIds: string[];
  isTeamMember: (employeeId: string) => boolean;
  canApproveLeaveFor: (employeeId: string) => boolean;
  getEmployeeRole: (employeeId: string) => AppRole;
  updateEmployeeRole: (employeeId: string, newRole: AppRole) => Promise<{ error?: string }>;
  setCurrentUserRole: (role: AppRole) => void; // For demo purposes
  // Impersonation
  isImpersonating: boolean;
  actualRole: AppRole;
  canImpersonate: boolean;
  startImpersonation: () => void;
  stopImpersonation: () => void;
}

const managementRoles: AppRole[] = ['hr', 'manager', 'admin'];

// Role priority for determining the highest role when user has multiple
const rolePriority: Record<AppRole, number> = {
  employee: 1,
  manager: 2,
  hr: 3,
  admin: 4,
};

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const { user, profile } = useAuth();
  const [currentUser, setCurrentUser] = useState<CurrentUser>(mockCurrentUser);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [teamMemberIds, setTeamMemberIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Impersonation state
  const [isImpersonating, setIsImpersonating] = useState(false);
  const [actualRole, setActualRole] = useState<AppRole>('employee');

  // Fetch current user's role from the database
  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) {
        setCurrentUser(mockCurrentUser);
        setLoading(false);
        return;
      }

      try {
        // Fetch all user roles and determine the highest priority one
        const { data: rolesData, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);

        let role: AppRole = 'employee';
        if (!roleError && rolesData && rolesData.length > 0) {
          role = rolesData.reduce((highest, current) => {
            return rolePriority[current.role as AppRole] > rolePriority[highest]
              ? (current.role as AppRole)
              : highest;
          }, 'employee' as AppRole);
        }

        // Update current user with profile and role info
        setCurrentUser({
          id: user.id,
          name: profile 
            ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || user.email || 'User'
            : user.email || 'User',
          email: user.email || '',
          role,
          avatar: profile?.avatar_url || '',
        });
      } catch (error) {
        console.error('Error fetching user role:', error);
      }

      setLoading(false);
    };

    fetchUserRole();
  }, [user, profile]);

  // Fetch all user roles for employee management (with employee_id mapping)
  useEffect(() => {
    const fetchAllRoles = async () => {
      if (!user) return;

      // Join user_roles with profiles to get employee_id mapping
      const { data, error } = await supabase
        .from('user_roles')
        .select(`
          id, 
          user_id, 
          role,
          profiles!inner(employee_id)
        `);

      if (!error && data) {
        setUserRoles(data.map(r => ({
          id: r.id,
          userId: (r.profiles as unknown as { employee_id: string })?.employee_id || r.user_id,
          role: r.role,
        })));
      }
    };

    fetchAllRoles();
  }, [user]);

  // Fetch team members for managers
  useEffect(() => {
    const fetchTeamMembers = async () => {
      if (!profile?.employee_id) {
        setTeamMemberIds([]);
        return;
      }

      const { data, error } = await supabase
        .from('employees')
        .select('id')
        .eq('manager_id', profile.employee_id);

      if (!error && data) {
        setTeamMemberIds(data.map(e => e.id));
      }
    };

    fetchTeamMembers();
  }, [profile?.employee_id]);

  const hasRole = useCallback((role: AppRole) => {
    return currentUser.role === role;
  }, [currentUser.role]);

  // Update actualRole when user role changes (but not during impersonation)
  useEffect(() => {
    if (!isImpersonating && currentUser.role) {
      setActualRole(currentUser.role);
    }
  }, [currentUser.role, isImpersonating]);

  // Use effective role for permissions (respects impersonation)
  const effectiveRole = isImpersonating ? 'employee' : currentUser.role;
  const canAccessManagement = managementRoles.includes(effectiveRole);
  const canAccessCompany = managementRoles.includes(effectiveRole);
  const canManageRoles = effectiveRole === 'hr' || effectiveRole === 'admin';
  const canEditEmployees = effectiveRole === 'hr' || effectiveRole === 'admin';
  const isManager = effectiveRole === 'manager';
  
  // Impersonation toggle visibility based on actual role (not effective role)
  const canImpersonate = actualRole === 'hr' || actualRole === 'admin';

  // Check if an employee is a team member (for managers)
  const isTeamMember = useCallback((employeeId: string) => {
    return teamMemberIds.includes(employeeId);
  }, [teamMemberIds]);

  // Check if current user can approve leave for a specific employee
  const canApproveLeaveFor = useCallback((employeeId: string) => {
    // HR and Admin can approve any leave
    if (canEditEmployees) return true;
    // Manager can approve their team members' leave
    if (isManager && teamMemberIds.includes(employeeId)) return true;
    return false;
  }, [canEditEmployees, isManager, teamMemberIds]);

  const startImpersonation = useCallback(() => {
    if (!isImpersonating) {
      setActualRole(currentUser.role);
      setIsImpersonating(true);
      setCurrentUser(prev => ({ ...prev, role: 'employee' }));
    }
  }, [currentUser.role, isImpersonating]);

  const stopImpersonation = useCallback(() => {
    setIsImpersonating(false);
    setCurrentUser(prev => ({ ...prev, role: actualRole }));
  }, [actualRole]);

  const getEmployeeRole = useCallback((employeeId: string): AppRole => {
    // userRoles now contains the correct user IDs after the update
    // We need to find by matching - but since we store userId, we check all roles
    // This is a sync function, so we rely on the local state
    const userRole = userRoles.find(ur => ur.userId === employeeId);
    return userRole?.role || 'employee';
  }, [userRoles]);

  const updateEmployeeRole = useCallback(async (employeeId: string, newRole: AppRole): Promise<{ error?: string }> => {
    // First, find the user_id associated with this employee
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('employee_id', employeeId)
      .single();

    if (profileError || !profile) {
      console.error('No user account linked to this employee:', profileError);
      return { error: 'No user account linked to this employee. Create a login first.' };
    }

    const userId = profile.id;

    // Delete existing roles for this user first, then insert the new one
    await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId);

    const { error } = await supabase
      .from('user_roles')
      .insert({
        user_id: userId,
        role: newRole,
      });

    if (error) {
      console.error('Failed to update role:', error);
      return { error: 'Failed to update role in database.' };
    }

    // Update local state with employeeId (since userRoles are keyed by employee_id, not auth user_id)
    setUserRoles(prev => {
      const filtered = prev.filter(ur => ur.userId !== employeeId);
      return [...filtered, { id: `role-${employeeId}`, userId: employeeId, role: newRole }];
    });

    return {};
  }, []);

  // For demo purposes - allows switching the current user's role
  const setCurrentUserRole = useCallback((role: AppRole) => {
    setCurrentUser(prev => ({ ...prev, role }));
  }, []);

  return (
    <RoleContext.Provider
      value={{
        currentUser,
        userRoles,
        hasRole,
        canAccessManagement,
        canAccessCompany,
        canManageRoles,
        canEditEmployees,
        isManager,
        teamMemberIds,
        isTeamMember,
        canApproveLeaveFor,
        getEmployeeRole,
        updateEmployeeRole,
        setCurrentUserRole,
        isImpersonating,
        actualRole,
        canImpersonate,
        startImpersonation,
        stopImpersonation,
      }}
    >
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
