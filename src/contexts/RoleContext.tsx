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
  getEmployeeRole: (employeeId: string) => AppRole;
  updateEmployeeRole: (employeeId: string, newRole: AppRole) => void;
  setCurrentUserRole: (role: AppRole) => void; // For demo purposes
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
  const [loading, setLoading] = useState(true);

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

  // Fetch all user roles for employee management
  useEffect(() => {
    const fetchAllRoles = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from('user_roles')
        .select('id, user_id, role');

      if (!error && data) {
        setUserRoles(data.map(r => ({
          id: r.id,
          userId: r.user_id,
          role: r.role,
        })));
      }
    };

    fetchAllRoles();
  }, [user]);

  const hasRole = useCallback((role: AppRole) => {
    return currentUser.role === role;
  }, [currentUser.role]);

  const canAccessManagement = managementRoles.includes(currentUser.role);
  const canAccessCompany = managementRoles.includes(currentUser.role);
  const canManageRoles = currentUser.role === 'hr' || currentUser.role === 'admin';

  const getEmployeeRole = useCallback((employeeId: string): AppRole => {
    const userRole = userRoles.find(ur => ur.userId === employeeId);
    return userRole?.role || 'employee';
  }, [userRoles]);

  const updateEmployeeRole = useCallback(async (employeeId: string, newRole: AppRole) => {
    // Update in database
    const { error } = await supabase
      .from('user_roles')
      .upsert({
        user_id: employeeId,
        role: newRole,
      }, {
        onConflict: 'user_id',
      });

    if (!error) {
      // Update local state
      setUserRoles(prev => {
        const existing = prev.find(ur => ur.userId === employeeId);
        if (existing) {
          return prev.map(ur => 
            ur.userId === employeeId ? { ...ur, role: newRole } : ur
          );
        }
        return [...prev, { id: `role-${employeeId}`, userId: employeeId, role: newRole }];
      });
    }
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
        getEmployeeRole,
        updateEmployeeRole,
        setCurrentUserRole,
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
