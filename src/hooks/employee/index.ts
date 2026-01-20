// Core utilities
export { 
  EMPLOYEE_SELECT_QUERY, 
  EMPLOYEE_SELECT_QUERY_MINIMAL,
  fetchEmployeesBase, 
  fetchEmployeeBase,
  extractManagerName,
} from './core';
export type { DbEmployeeBase } from './core';

// Types
export type { 
  Employee, 
  TeamMember, 
  TeamMemberStatus,
  WorkerType,
  EmploymentType,
  PayFrequency,
  EmployeeStatus,
  GenderType,
} from './types';

// Mappers
export { mapDbEmployeeToEmployee, mapDbToTeamMember } from './mappers';

// Shared mutations
export {
  useCreateEmployeeMutation,
  useUpdateEmployeeMutation,
  useDeleteEmployeeMutation,
} from './mutations';
