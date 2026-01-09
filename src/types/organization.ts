/**
 * Organization Types
 * Types for positions, departments, and organizational structure
 */

export interface Position {
  id: string;
  title: string;
  department_id: string | null;
  department_name: string | null;
  level: number | null;
  job_description: string | null;
  created_at: string;
  employeeCount: number;
}

export interface PositionInput {
  title: string;
  department_id?: string | null;
  level?: number | null;
  job_description?: string | null;
}

export interface Department {
  id: string;
  name: string;
  description: string | null;
  manager_id: string | null;
  created_at: string;
  manager?: {
    id: string;
    first_name: string;
    last_name: string;
    avatar_url: string | null;
  } | null;
  employeeCount?: number;
}

export interface DepartmentInput {
  name: string;
  description?: string | null;
  manager_id?: string | null;
}

export interface SmartTag {
  id: string;
  tag: string;
  field: string;
  source: string;
  category: string;
  description: string;
  is_system: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type SmartTagInsert = Omit<SmartTag, 'id' | 'created_at' | 'updated_at'>;
export type SmartTagUpdate = Partial<SmartTagInsert>;
