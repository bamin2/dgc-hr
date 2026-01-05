import { History, User } from 'lucide-react';
import { SettingsCard } from './SettingsCard';
import { useCompanySettingsAudit, formatFieldName } from '@/hooks/useCompanySettingsAudit';
import { useCompanySettings } from '@/contexts/CompanySettingsContext';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';

export const AuditLogCard = () => {
  const { auditLog, isLoading } = useCompanySettingsAudit(20);
  const { formatDate } = useCompanySettings();

  if (isLoading) {
    return (
      <SettingsCard title="Change History" description="Recent changes to company settings" icon={History}>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex justify-between items-start py-3 border-b border-border/50">
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
              <Skeleton className="h-3 w-24" />
            </div>
          ))}
        </div>
      </SettingsCard>
    );
  }

  if (auditLog.length === 0) {
    return (
      <SettingsCard title="Change History" description="Recent changes to company settings" icon={History}>
        <div className="py-8 text-center text-muted-foreground">
          <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No changes recorded yet</p>
        </div>
      </SettingsCard>
    );
  }

  return (
    <SettingsCard title="Change History" description="Recent changes to company settings" icon={History}>
      <ScrollArea className="h-[400px] pr-4">
        <div className="divide-y divide-border/50">
          {auditLog.map((entry) => {
            const changerName = entry.changedByProfile
              ? `${entry.changedByProfile.first_name || ''} ${entry.changedByProfile.last_name || ''}`.trim() || 'Unknown'
              : 'System';

            const isLogoChange = entry.field_name === 'logo_url';
            const oldDisplay = isLogoChange ? (entry.old_value ? 'Previous logo' : 'No logo') : (entry.old_value || 'Empty');
            const newDisplay = isLogoChange ? (entry.new_value ? 'New logo' : 'Removed') : (entry.new_value || 'Empty');

            return (
              <div key={entry.id} className="py-3 space-y-1">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">
                      {formatFieldName(entry.field_name)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      <span className="text-destructive/80 line-through">{oldDisplay}</span>
                      <span className="mx-2">→</span>
                      <span className="text-primary">{newDisplay}</span>
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <User className="h-3 w-3" />
                      <span>{changerName}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatDate(entry.changed_at)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </SettingsCard>
  );
};