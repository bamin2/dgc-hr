import { useState } from 'react';
import { ReportViewer } from '../ReportViewer';
import { ReportFilters, ReportColumn, LeaveRequestRecord } from '@/types/reports';
import { useLeaveRequestsReport } from '@/hooks/reports';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';

const columns: ReportColumn<LeaveRequestRecord>[] = [
  { key: 'employeeCode', header: 'Emp Code' },
  { key: 'employeeName', header: 'Employee Name' },
  { key: 'department', header: 'Department' },
  { key: 'leaveType', header: 'Leave Type' },
  { key: 'startDate', header: 'Start Date', format: 'date' },
  { key: 'endDate', header: 'End Date', format: 'date' },
  { key: 'daysCount', header: 'Days', format: 'number', align: 'right' },
  { key: 'status', header: 'Status' },
  { key: 'finalOutcome', header: 'Outcome' },
];

function getStatusBadge(status: string) {
  const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    approved: 'default',
    pending: 'secondary',
    rejected: 'destructive',
    cancelled: 'outline',
  };
  return (
    <Badge variant={variants[status] || 'secondary'} className="capitalize">
      {status}
    </Badge>
  );
}

export function LeaveRequestsReport() {
  const [filters, setFilters] = useState<ReportFilters>({});
  const { data = [], isLoading, refetch } = useLeaveRequestsReport(filters);

  return (
    <ReportViewer
      title="Leave Requests Report"
      description="All leave requests with approval workflow status and outcomes"
      filters={filters}
      onFiltersChange={setFilters}
      data={data}
      columns={columns}
      isLoading={isLoading}
      onRefresh={() => refetch()}
      exportFormats={['excel', 'csv']}
    >
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead key={String(col.key)} className={col.align === 'right' ? 'text-right' : ''}>
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row) => (
              <TableRow key={row.requestId}>
                <TableCell>{row.employeeCode}</TableCell>
                <TableCell>{row.employeeName}</TableCell>
                <TableCell>{row.department}</TableCell>
                <TableCell>{row.leaveType}</TableCell>
                <TableCell>{format(new Date(row.startDate), 'MMM d, yyyy')}</TableCell>
                <TableCell>{format(new Date(row.endDate), 'MMM d, yyyy')}</TableCell>
                <TableCell className="text-right">{row.daysCount}</TableCell>
                <TableCell>{getStatusBadge(row.status)}</TableCell>
                <TableCell className="capitalize">{row.finalOutcome}</TableCell>
              </TableRow>
            ))}
            {data.length === 0 && !isLoading && (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  No leave requests found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </ReportViewer>
  );
}
