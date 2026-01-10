import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ReportViewer } from '../ReportViewer';
import { ReportFilters, ReportColumn, PayrollRunSummary } from '@/types/reports';
import { usePayrollRunSummary } from '@/hooks/reports';
import { useCompanySettings } from '@/contexts/CompanySettingsContext';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';
import { DollarSign, Users, TrendingUp, Wallet } from 'lucide-react';

const columns: ReportColumn<PayrollRunSummary>[] = [
  { key: 'payPeriodStart', header: 'Pay Period Start', format: 'date' },
  { key: 'payPeriodEnd', header: 'Pay Period End', format: 'date' },
  { key: 'status', header: 'Status' },
  { key: 'employeeCount', header: 'Employees', format: 'number', align: 'right' },
  { key: 'totalGross', header: 'Gross Pay', format: 'currency', align: 'right' },
  { key: 'totalDeductions', header: 'Deductions', format: 'currency', align: 'right' },
  { key: 'totalNetPay', header: 'Net Pay', format: 'currency', align: 'right' },
  { key: 'employeeGosiTotal', header: 'Employee GOSI', format: 'currency', align: 'right' },
  { key: 'employerGosiTotal', header: 'Employer GOSI', format: 'currency', align: 'right' },
  { key: 'loanDeductionsTotal', header: 'Loan Deductions', format: 'currency', align: 'right' },
];

export function PayrollRunSummaryReport() {
  const [filters, setFilters] = useState<ReportFilters>({});
  const { data = [], isLoading, refetch } = usePayrollRunSummary(filters);
  const { settings, formatCurrency } = useCompanySettings();

  const totals = data.reduce(
    (acc, run) => ({
      employees: acc.employees + run.employeeCount,
      gross: acc.gross + run.totalGross,
      net: acc.net + run.totalNetPay,
      gosi: acc.gosi + run.employeeGosiTotal + run.employerGosiTotal,
    }),
    { employees: 0, gross: 0, net: 0, gosi: 0 }
  );

  const summaryCards = (
    <>
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Employees</p>
              <p className="text-2xl font-bold">{totals.employees}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
              <DollarSign className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Gross</p>
              <p className="text-2xl font-bold">{formatCurrency(totals.gross)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Wallet className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Net Pay</p>
              <p className="text-2xl font-bold">{formatCurrency(totals.net)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
              <TrendingUp className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total GOSI</p>
              <p className="text-2xl font-bold">{formatCurrency(totals.gosi)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );

  return (
    <ReportViewer
      title="Payroll Run Summary Report"
      description="Summary of payroll runs with totals for gross, deductions, net pay, and GOSI contributions"
      filters={filters}
      onFiltersChange={setFilters}
      data={data}
      columns={columns}
      isLoading={isLoading}
      onRefresh={() => refetch()}
      summaryCards={summaryCards}
      exportFormats={['excel', 'csv', 'pdf']}
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
              <TableRow key={row.id}>
                <TableCell>{format(new Date(row.payPeriodStart), 'MMM d, yyyy')}</TableCell>
                <TableCell>{format(new Date(row.payPeriodEnd), 'MMM d, yyyy')}</TableCell>
                <TableCell className="capitalize">{row.status.replace('_', ' ')}</TableCell>
                <TableCell className="text-right">{row.employeeCount}</TableCell>
                <TableCell className="text-right">{formatCurrency(row.totalGross)}</TableCell>
                <TableCell className="text-right">{formatCurrency(row.totalDeductions)}</TableCell>
                <TableCell className="text-right">{formatCurrency(row.totalNetPay)}</TableCell>
                <TableCell className="text-right">{formatCurrency(row.employeeGosiTotal)}</TableCell>
                <TableCell className="text-right">{formatCurrency(row.employerGosiTotal)}</TableCell>
                <TableCell className="text-right">{formatCurrency(row.loanDeductionsTotal)}</TableCell>
              </TableRow>
            ))}
            {data.length === 0 && !isLoading && (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  No payroll runs found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </ReportViewer>
  );
}
