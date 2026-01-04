import React, { createContext, useContext, useState, useCallback } from 'react';
import { 
  AppRole, 
  CurrentUser, 
  mockCurrentUser, 
  mockUserRoles, 
  managementRoles,
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

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<CurrentUser>(mockCurrentUser);
  const [userRoles, setUserRoles] = useState<UserRole[]>(mockUserRoles);

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

  const updateEmployeeRole = useCallback((employeeId: string, newRole: AppRole) => {
    setUserRoles(prev => {
      const existing = prev.find(ur => ur.userId === employeeId);
      if (existing) {
        return prev.map(ur => 
          ur.userId === employeeId ? { ...ur, role: newRole } : ur
        );
      }
      return [...prev, { id: `role-${employeeId}`, userId: employeeId, role: newRole }];
    });
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
