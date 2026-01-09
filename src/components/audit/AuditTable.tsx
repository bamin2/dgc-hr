import { formatDisplayDate, formatTime } from "@/lib/dateUtils";
import {
  User,
  Calendar,
  Banknote,
  FileText,
  DollarSign,
  Scale,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { AuditLog, EntityType, ActionType } from "@/hooks/useAuditLogs";
import { Link } from "react-router-dom";

interface AuditTableProps {
  logs: AuditLog[];
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  totalCount: number;
  onPageChange: (page: number) => void;
}

const ENTITY_TYPE_CONFIG: Record<EntityType, { label: string; icon: React.ElementType; color: string }> = {
  employee: { label: 'Employee', icon: User, color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  leave_request: { label: 'Leave', icon: Calendar, color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  loan: { label: 'Loan', icon: Banknote, color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  document: { label: 'Document', icon: FileText, color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
  compensation: { label: 'Compensation', icon: DollarSign, color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  leave_balance: { label: 'Balance', icon: Scale, color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400' },
};

const ACTION_CONFIG: Record<ActionType, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  create: { label: 'Created', variant: 'default' },
  update: { label: 'Updated', variant: 'secondary' },
  delete: { label: 'Deleted', variant: 'destructive' },
  approve: { label: 'Approved', variant: 'default' },
  reject: { label: 'Rejected', variant: 'destructive' },
  upload: { label: 'Uploaded', variant: 'default' },
  skip: { label: 'Skipped', variant: 'outline' },
};

function formatFieldName(fieldName: string | null): string {
  if (!fieldName) return '';
  return fieldName
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

function getInitials(firstName?: string | null, lastName?: string | null): string {
  return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || '?';
}

export function AuditTable({
  logs,
  isLoading,
  currentPage,
  totalPages,
  totalCount,
  onPageChange,
}: AuditTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-6 w-20" />
          </div>
        ))}
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p className="text-lg font-medium">No audit logs found</p>
        <p className="text-sm">Try adjusting your filters or wait for new activity.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[180px]">Timestamp</TableHead>
              <TableHead>Employee</TableHead>
              <TableHead className="w-[120px]">Category</TableHead>
              <TableHead className="w-[100px]">Action</TableHead>
              <TableHead>Details</TableHead>
              <TableHead className="w-[180px]">Changed By</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => {
              const entityConfig = ENTITY_TYPE_CONFIG[log.entity_type as EntityType];
              const actionConfig = ACTION_CONFIG[log.action as ActionType];
              const EntityIcon = entityConfig?.icon || FileText;

              return (
                <TableRow key={log.id}>
                  {/* Timestamp */}
                  <TableCell className="text-sm">
                    <div className="font-medium">
                      {formatDisplayDate(log.created_at)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatTime(log.created_at)}
                    </div>
                  </TableCell>

                  {/* Employee */}
                  <TableCell>
                    {log.employee ? (
                      <Link 
                        to={`/employees/${log.employee.id}`}
                        className="flex items-center gap-2 hover:underline"
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={log.employee.avatar_url || undefined} />
                          <AvatarFallback className="text-xs">
                            {getInitials(log.employee.first_name, log.employee.last_name)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">
                          {log.employee.first_name} {log.employee.last_name}
                        </span>
                      </Link>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>

                  {/* Category */}
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={`gap-1 ${entityConfig?.color || ''}`}
                    >
                      <EntityIcon className="h-3 w-3" />
                      {entityConfig?.label || log.entity_type}
                    </Badge>
                  </TableCell>

                  {/* Action */}
                  <TableCell>
                    <Badge variant={actionConfig?.variant || 'secondary'}>
                      {actionConfig?.label || log.action}
                    </Badge>
                  </TableCell>

                  {/* Details */}
                  <TableCell>
                    <div className="space-y-1">
                      {log.description && (
                        <p className="text-sm">{log.description}</p>
                      )}
                      {log.field_name && log.action === 'update' && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="font-medium">{formatFieldName(log.field_name)}:</span>
                          {log.old_value && (
                            <>
                              <span className="line-through">{log.old_value}</span>
                              <ArrowRight className="h-3 w-3" />
                            </>
                          )}
                          <span className="text-foreground">{log.new_value || '—'}</span>
                        </div>
                      )}
                    </div>
                  </TableCell>

                  {/* Changed By */}
                  <TableCell>
                    {log.performer ? (
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={log.performer.avatar_url || undefined} />
                          <AvatarFallback className="text-xs">
                            {getInitials(log.performer.first_name, log.performer.last_name)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">
                          {log.performer.first_name} {log.performer.last_name}
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">System</span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {((currentPage - 1) * 50) + 1} to {Math.min(currentPage * 50, totalCount)} of {totalCount} entries
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <span className="text-sm text-muted-foreground px-2">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
