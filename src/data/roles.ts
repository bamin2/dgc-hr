// Role types for the application
export type AppRole = 'employee' | 'manager' | 'hr' | 'admin';

export interface UserRole {
  id: string;
  userId: string;
  role: AppRole;
}

// Define which roles can see Management & Company sections
export const managementRoles: AppRole[] = ['hr', 'manager', 'admin'];

// Role labels for display
export const roleLabels: Record<AppRole, string> = {
  employee: 'Employee',
  manager: 'Manager',
  hr: 'HR',
  admin: 'Admin'
};

// Role descriptions
export const roleDescriptions: Record<AppRole, string> = {
  employee: 'Basic access to personal information and time off requests',
  manager: 'Can view team members, approve requests, and access reports',
  hr: 'Full access to employee management, payroll, and benefits',
  admin: 'Complete system access including settings and integrations'
};

// Role colors for badges
export const roleColors: Record<AppRole, { bg: string; text: string }> = {
  employee: { bg: 'bg-secondary', text: 'text-secondary-foreground' },
  manager: { bg: 'bg-info/10', text: 'text-info' },
  hr: { bg: 'bg-primary/10', text: 'text-primary' },
  admin: { bg: 'bg-warning/10', text: 'text-warning' }
};

// Mock current user (for demo purposes - this would come from auth in production)
export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: AppRole;
  avatar: string;
}

export const mockCurrentUser: CurrentUser = {
  id: 'user-9',
  name: 'Jennifer Taylor',
  email: 'jennifer.taylor@franfer.com',
  role: 'hr', // Can be changed to test different roles: 'employee', 'manager', 'hr', 'admin'
  avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face'
};

// Employee role assignments (maps employee IDs to roles)
export const mockUserRoles: UserRole[] = [
  { id: 'role-1', userId: '1', role: 'employee' },
  { id: 'role-2', userId: '2', role: 'manager' },
  { id: 'role-3', userId: '3', role: 'employee' },
  { id: 'role-4', userId: '4', role: 'employee' },
  { id: 'role-5', userId: '5', role: 'manager' },
  { id: 'role-6', userId: '6', role: 'employee' },
  { id: 'role-7', userId: '7', role: 'admin' },
  { id: 'role-8', userId: '8', role: 'employee' },
  { id: 'role-9', userId: '9', role: 'hr' },
  { id: 'role-10', userId: '10', role: 'employee' },
];

// Helper to get role for an employee
export function getEmployeeRole(employeeId: string): AppRole {
  const userRole = mockUserRoles.find(ur => ur.userId === employeeId);
  return userRole?.role || 'employee';
}

// Helper to check if a role can access management features
export function canAccessManagement(role: AppRole): boolean {
  return managementRoles.includes(role);
}
