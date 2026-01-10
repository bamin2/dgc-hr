import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ReportViewer } from '../ReportViewer';
import { ReportFilters, ReportColumn, LeaveBalanceRecord } from '@/types/reports';
import { useLeaveBalanceReport } from '@/hooks/reports';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Calendar, Clock, CheckCircle, AlertCircle } from 'lucide-react';

const columns: ReportColumn<LeaveBalanceRecord>[] = [
  { key: 'employeeCode', header: 'Emp Code' },
  { key: 'employeeName', header: 'Employee Name' },
  { key: 'department', header: 'Department' },
  { key: 'leaveType', header: 'Leave Type' },
  { key: 'entitledDays', header: 'Entitled', format: 'number', align: 'right' },
  { key: 'takenDays', header: 'Taken', format: 'number', align: 'right' },
  { key: 'pendingDays', header: 'Pending', format: 'number', align: 'right' },
  { key: 'remainingDays', header: 'Remaining', format: 'number', align: 'right' },
];

export function LeaveBalanceReport() {
  const [filters, setFilters] = useState<ReportFilters>({ year: new Date().getFullYear() });
  const { data = [], isLoading, refetch } = useLeaveBalanceReport(filters);

  const totals = data.reduce(
    (acc, row) => ({
      entitled: acc.entitled + row.entitledDays,
      taken: acc.taken + row.takenDays,
      pending: acc.pending + row.pendingDays,
      remaining: acc.remaining + row.remainingDays,
    }),
    { entitled: 0, taken: 0, pending: 0, remaining: 0 }
  );

  const summaryCards = (
    <>
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Entitled</p>
              <p className="text-2xl font-bold">{totals.entitled} days</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <CheckCircle className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Taken</p>
              <p className="text-2xl font-bold">{totals.taken} days</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending Approval</p>
              <p className="text-2xl font-bold">{totals.pending} days</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
              <AlertCircle className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Remaining</p>
              <p className="text-2xl font-bold">{totals.remaining} days</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );

  return (
    <ReportViewer
      title="Leave Balance Report"
      description="Current leave balances showing entitled, taken, pending, and remaining days per employee"
      filters={filters}
      onFilterChange={setFilters}
      data={data}
      columns={columns}
      isLoading={isLoading}
      onRefresh={() => refetch()}
      summaryCards={summaryCards}
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
            {data.map((row, idx) => (
              <TableRow key={`${row.employeeId}-${row.leaveType}-${idx}`}>
                <TableCell>{row.employeeCode}</TableCell>
                <TableCell>{row.employeeName}</TableCell>
                <TableCell>{row.department}</TableCell>
                <TableCell>{row.leaveType}</TableCell>
                <TableCell className="text-right">{row.entitledDays}</TableCell>
                <TableCell className="text-right">{row.takenDays}</TableCell>
                <TableCell className="text-right">{row.pendingDays}</TableCell>
                <TableCell className="text-right font-medium">{row.remainingDays}</TableCell>
              </TableRow>
            ))}
            {data.length === 0 && !isLoading && (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  No leave balance records found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </ReportViewer>
  );
}
