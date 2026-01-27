import { useState, useCallback } from "react";
import { History, Download } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AuditFilters, AuditTable } from "@/components/audit";
import { useAuditLogs, type AuditLogFilters } from "@/hooks/useAuditLogs";
import { usePrefetchPagination } from "@/hooks/usePrefetchPagination";
import { queryKeys } from "@/lib/queryKeys";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { toast } from "sonner";

export default function AuditTrail() {
  const [filters, setFilters] = useState<AuditLogFilters>({});
  const [page, setPage] = useState(1);
  const pageSize = 50;

  const { data, isLoading } = useAuditLogs({
    filters,
    page,
    pageSize,
  });

  // Prefetch next page for instant navigation
  const prefetchAuditLogs = useCallback(async (nextPage: number) => {
    let query = supabase
      .from('audit_logs')
      .select(`*, employee:employees(id, first_name, last_name, avatar_url)`, { count: 'exact' })
      .order('created_at', { ascending: false });

    if (filters.employeeId) query = query.eq('employee_id', filters.employeeId);
    if (filters.entityType && filters.entityType !== 'all') query = query.eq('entity_type', filters.entityType);
    if (filters.action && filters.action !== 'all') query = query.eq('action', filters.action);
    if (filters.dateFrom) query = query.gte('created_at', filters.dateFrom.toISOString());
    if (filters.dateTo) {
      const endDate = new Date(filters.dateTo);
      endDate.setDate(endDate.getDate() + 1);
      query = query.lt('created_at', endDate.toISOString());
    }
    if (filters.search) query = query.or(`description.ilike.%${filters.search}%,field_name.ilike.%${filters.search}%`);

    const from = (nextPage - 1) * pageSize;
    query = query.range(from, from + pageSize - 1);

    const { data } = await query;
    return data;
  }, [filters, pageSize]);

  usePrefetchPagination({
    queryKey: [...queryKeys.audit.logs, filters, page, pageSize],
    currentPage: page,
    totalPages: data?.totalPages || 1,
    prefetchFn: prefetchAuditLogs,
    enabled: !isLoading && !!data,
  });

  // Reset to page 1 when filters change
  const handleFiltersChange = (newFilters: AuditLogFilters) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handleExportCSV = async () => {
    if (!data?.logs.length) {
      toast.error("No data to export");
      return;
    }

    try {
      const headers = ['Timestamp', 'Employee', 'Category', 'Action', 'Field', 'Old Value', 'New Value', 'Description', 'Changed By'];
      
      const rows = data.logs.map((log) => [
        format(new Date(log.created_at), "yyyy-MM-dd HH:mm:ss"),
        log.employee ? `${log.employee.first_name} ${log.employee.last_name}` : '',
        log.entity_type,
        log.action,
        log.field_name || '',
        log.old_value || '',
        log.new_value || '',
        log.description || '',
        log.performer ? `${log.performer.first_name} ${log.performer.last_name}` : 'System',
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map((row) =>
          row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
        ),
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `audit-trail-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("Audit log exported successfully");
    } catch (error) {
      toast.error("Failed to export audit log");
      console.error(error);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Audit Trail"
          subtitle="Track all changes made to employee data, time off, loans, and documents."
          actions={
            <Button onClick={handleExportCSV} variant="outline" disabled={!data?.logs.length}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          }
        />

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Entries</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{data?.totalCount || 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Current Page</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">
                {data?.currentPage || 1} of {data?.totalPages || 1}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">
                {Object.values(filters).filter((v) => v && v !== 'all').length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Last Updated</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">
                {data?.logs[0] ? format(new Date(data.logs[0].created_at), "MMM d") : "—"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters & Table */}
        <Card>
          <CardHeader>
            <CardTitle>Activity Log</CardTitle>
            <CardDescription>
              All changes are automatically recorded for compliance and accountability.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <AuditFilters filters={filters} onFiltersChange={handleFiltersChange} />
            <AuditTable
              logs={data?.logs || []}
              isLoading={isLoading}
              currentPage={data?.currentPage || 1}
              totalPages={data?.totalPages || 1}
              totalCount={data?.totalCount || 0}
              onPageChange={setPage}
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
