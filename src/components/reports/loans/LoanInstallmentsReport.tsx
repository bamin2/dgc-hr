import { useState } from 'react';
import { ReportViewer } from '../ReportViewer';
import { ReportFilters, ReportColumn, LoanInstallmentRecord } from '@/types/reports';
import { useLoanInstallmentsReport } from '@/hooks/reports';
import { useCompanySettings } from '@/contexts/CompanySettingsContext';
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

const columns: ReportColumn<LoanInstallmentRecord>[] = [
  { key: 'employeeName', header: 'Employee Name' },
  { key: 'dueMonth', header: 'Due Month' },
  { key: 'dueDate', header: 'Due Date', format: 'date' },
  { key: 'amount', header: 'Amount', format: 'currency', align: 'right' },
  { key: 'status', header: 'Status' },
  { key: 'paymentMethod', header: 'Payment Method' },
  { key: 'paidDate', header: 'Paid Date', format: 'date' },
];

function getStatusBadge(status: string) {
  const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    paid: 'default',
    due: 'secondary',
    overdue: 'destructive',
    skipped: 'outline',
  };
  return (
    <Badge variant={variants[status] || 'secondary'} className="capitalize">
      {status}
    </Badge>
  );
}

function getPaymentMethodBadge(method: 'payroll' | 'manual' | 'pending') {
  const labels: Record<string, string> = {
    payroll: 'Payroll Deduction',
    manual: 'Manual Payment',
    pending: 'Pending',
  };
  return (
    <Badge variant="outline" className="capitalize">
      {labels[method] || method}
    </Badge>
  );
}

export function LoanInstallmentsReport() {
  const [filters, setFilters] = useState<ReportFilters>({});
  const { data = [], isLoading, refetch } = useLoanInstallmentsReport(filters);
  const { settings, formatCurrency } = useCompanySettings();

  return (
    <ReportViewer
      title="Loan Installments Report"
      description="Monthly breakdown of loan installments with payment status and deduction method"
      filters={filters}
      onFilterChange={setFilters}
      data={data}
      columns={columns}
      isLoading={isLoading}
      onRefresh={() => refetch()}
      exportFormats={['excel', 'csv']}
      companyName={settings?.name}
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
              <TableRow key={row.installmentId}>
                <TableCell>{row.employeeName}</TableCell>
                <TableCell>{row.dueMonth}</TableCell>
                <TableCell>{format(new Date(row.dueDate), 'MMM d, yyyy')}</TableCell>
                <TableCell className="text-right">{formatCurrency(row.amount)}</TableCell>
                <TableCell>{getStatusBadge(row.status)}</TableCell>
                <TableCell>{getPaymentMethodBadge(row.paymentMethod)}</TableCell>
                <TableCell>
                  {row.paidDate ? format(new Date(row.paidDate), 'MMM d, yyyy') : '-'}
                </TableCell>
              </TableRow>
            ))}
            {data.length === 0 && !isLoading && (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  No installments found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </ReportViewer>
  );
}
