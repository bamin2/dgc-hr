import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface AuditLogEntry {
  id: string;
  company_settings_id: string;
  changed_by: string | null;
  changed_at: string;
  field_name: string;
  old_value: string | null;
  new_value: string | null;
  changedByProfile?: {
    first_name: string | null;
    last_name: string | null;
  };
}

// Map field names to human-readable labels
const fieldLabels: Record<string, string> = {
  name: 'Company Name',
  legal_name: 'Legal Name',
  industry: 'Industry',
  company_size: 'Company Size',
  tax_id: 'Tax ID',
  year_founded: 'Year Founded',
  email: 'Email',
  phone: 'Phone',
  website: 'Website',
  address_street: 'Street Address',
  address_city: 'City',
  address_state: 'State',
  address_zip_code: 'ZIP Code',
  address_country: 'Country',
  logo_url: 'Logo',
  primary_color: 'Brand Color',
  timezone: 'Timezone',
  date_format: 'Date Format',
  currency: 'Currency',
};

export function formatFieldName(fieldName: string): string {
  return fieldLabels[fieldName] || fieldName.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export function useCompanySettingsAudit(limit: number = 50) {
  const query = useQuery({
    queryKey: ['company-settings-audit', limit],
    queryFn: async () => {
      // First get the audit logs
      const { data: auditData, error: auditError } = await supabase
        .from('company_settings_audit')
        .select('*')
        .order('changed_at', { ascending: false })
        .limit(limit);

      if (auditError) throw auditError;
      if (!auditData || auditData.length === 0) return [];

      // Get unique user IDs
      const userIds = [...new Set(auditData.map(a => a.changed_by).filter(Boolean))];
      
      // Fetch profiles for those users
      let profilesMap: Record<string, { first_name: string | null; last_name: string | null }> = {};
      if (userIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, first_name, last_name')
          .in('id', userIds);
        
        if (profilesData) {
          profilesMap = profilesData.reduce((acc, p) => {
            acc[p.id] = { first_name: p.first_name, last_name: p.last_name };
            return acc;
          }, {} as Record<string, { first_name: string | null; last_name: string | null }>);
        }
      }

      // Combine audit data with profile info
      return auditData.map(entry => ({
        ...entry,
        changedByProfile: entry.changed_by ? profilesMap[entry.changed_by] : undefined,
      })) as AuditLogEntry[];
    },
  });

  return {
    auditLog: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}