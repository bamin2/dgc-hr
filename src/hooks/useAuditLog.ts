import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import type { EntityType, ActionType } from "./useAuditLogs";
import { queryKeys } from "@/lib/queryKeys";

export interface AuditLogParams {
  entityType: EntityType;
  entityId: string;
  employeeId?: string;
  action: ActionType;
  fieldName?: string;
  oldValue?: string;
  newValue?: string;
  description?: string;
}

export function useAuditLog() {
  const queryClient = useQueryClient();

  const logAction = async ({
    entityType,
    entityId,
    employeeId,
    action,
    fieldName,
    oldValue,
    newValue,
    description,
  }: AuditLogParams) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase.from('audit_logs').insert({
      entity_type: entityType,
      entity_id: entityId,
      employee_id: employeeId || null,
      action,
      field_name: fieldName || null,
      old_value: oldValue || null,
      new_value: newValue || null,
      description: description || null,
      performed_by: user?.id || null,
    });

    if (error) {
      console.error('Failed to log audit action:', error);
      throw error;
    }

    // Invalidate audit logs cache
    queryClient.invalidateQueries({ queryKey: queryKeys.audit.logs });
  };

  return { logAction };
}
