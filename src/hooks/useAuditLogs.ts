import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { queryKeys } from "@/lib/queryKeys";

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
  // Joined data
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

export interface UseAuditLogsOptions {
  filters?: AuditLogFilters;
  page?: number;
  pageSize?: number;
}

export function useAuditLogs({ filters = {}, page = 1, pageSize = 50 }: UseAuditLogsOptions = {}) {
  return useQuery({
    queryKey: [...queryKeys.audit.logs, filters, page, pageSize],
    queryFn: async () => {
      let query = supabase
        .from('audit_logs')
        .select(`
          *,
          employee:employees(id, first_name, last_name, avatar_url)
        `, { count: 'exact' })
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.employeeId) {
        query = query.eq('employee_id', filters.employeeId);
      }

      if (filters.entityType && filters.entityType !== 'all') {
        query = query.eq('entity_type', filters.entityType);
      }

      if (filters.action && filters.action !== 'all') {
        query = query.eq('action', filters.action);
      }

      if (filters.dateFrom) {
        query = query.gte('created_at', filters.dateFrom.toISOString());
      }

      if (filters.dateTo) {
        // Add one day to include the entire end date
        const endDate = new Date(filters.dateTo);
        endDate.setDate(endDate.getDate() + 1);
        query = query.lt('created_at', endDate.toISOString());
      }

      if (filters.performedBy) {
        query = query.eq('performed_by', filters.performedBy);
      }

      if (filters.search) {
        query = query.or(`description.ilike.%${filters.search}%,field_name.ilike.%${filters.search}%`);
      }

      // Apply pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      // Fetch performer profiles separately
      const performerIds = [...new Set((data || []).map(d => d.performed_by).filter(Boolean))] as string[];
      let performersMap: Record<string, any> = {};
      
      if (performerIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, avatar_url, email')
          .in('id', performerIds);
        
        performersMap = (profiles || []).reduce((acc, p) => {
          acc[p.id] = p;
          return acc;
        }, {} as Record<string, any>);
      }

      const logs = (data || []).map(log => ({
        ...log,
        performer: log.performed_by ? performersMap[log.performed_by] || null : null,
      })) as AuditLog[];

      return {
        logs,
        totalCount: count || 0,
        totalPages: Math.ceil((count || 0) / pageSize),
        currentPage: page,
      };
    },
  });
}

// Hook for getting unique performers for filter dropdown
export function useAuditPerformers() {
  return useQuery({
    queryKey: [...queryKeys.audit.logs, 'performers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('performed_by')
        .not('performed_by', 'is', null);

      if (error) throw error;

      // Get unique performer IDs
      const uniqueIds = [...new Set(data.map(d => d.performed_by))].filter(Boolean) as string[];

      if (uniqueIds.length === 0) return [];

      // Fetch profile details for each performer
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email, avatar_url')
        .in('id', uniqueIds);

      if (profilesError) throw profilesError;

      return profiles || [];
    },
  });
}
