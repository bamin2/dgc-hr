/**
 * Audit Log Types
 * Types for audit logging and activity tracking
 */

export type EntityType = 'employee' | 'leave_request' | 'loan' | 'document' | 'compensation' | 'leave_balance';
export type ActionType = 'create' | 'update' | 'delete' | 'approve' | 'reject' | 'skip' | 'upload';

export interface AuditLog {
  id: string;
  entity_type: EntityType;
  entity_id: string;
  employee_id: string | null;
  action: ActionType;
  field_name: string | null;
  old_value: string | null;
  new_value: string | null;
  description: string | null;
  performed_by: string | null;
  created_at: string;
  employee?: {
    id: string;
    first_name: string;
    last_name: string;
    avatar_url: string | null;
  } | null;
  performer?: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
    email: string | null;
  } | null;
}

export interface AuditLogFilters {
  employeeId?: string;
  entityType?: EntityType | 'all';
  action?: ActionType | 'all';
  dateFrom?: Date;
  dateTo?: Date;
  performedBy?: string;
  search?: string;
}

export interface AuditLogParams {
  entityType: EntityType;
  entityId: string;
}

export interface UseAuditLogsOptions {
  filters?: AuditLogFilters;
  page?: number;
  pageSize?: number;
}

export interface AuditLogsResult {
  logs: AuditLog[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}
