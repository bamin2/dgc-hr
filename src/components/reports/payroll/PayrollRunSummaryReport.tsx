import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ReportViewer } from '../ReportViewer';
import { ReportFilters, ReportColumn, PayrollRunSummary } from '@/types/reports';
import { usePayrollRunSummary } from '@/hooks/reports';
import { useCompanySettings } from '@/contexts/CompanySettingsContext';
import { formatCurrencyWithCode } from '@/lib/salaryUtils';
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
import { DollarSign, Users, TrendingUp, Wallet, AlertTriangle } from 'lucide-react';

const columns: ReportColumn<PayrollRunSummary>[] = [
  { key: 'payPeriodStart', header: 'Pay Period Start', format: 'date' },
  { key: 'payPeriodEnd', header: 'Pay Period End', format: 'date' },
  { key: 'status', header: 'Status' },
  { key: 'currencyCode', header: 'Currency' },
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
  const { settings } = useCompanySettings();

  // Check if there are mixed currencies in totals
  const hasMixedCurrencies = useMemo(() => {
    const currencies = new Set(data.map(r => r.currencyCode));
    return currencies.size > 1;
  }, [data]);

  // Get single currency for display if all same
  const singleCurrency = useMemo(() => {
    if (hasMixedCurrencies) return null;
    return data.length > 0 ? data[0].currencyCode : 'BHD';
  }, [data, hasMixedCurrencies]);

  const totals = data.reduce(
    (acc, run) => ({
      employees: acc.employees + run.employeeCount,
      gross: acc.gross + run.totalGross,
      net: acc.net + run.totalNetPay,
      gosi: acc.gosi + run.employeeGosiTotal + run.employerGosiTotal,
    }),
    { employees: 0, gross: 0, net: 0, gosi: 0 }
  );

  const formatAmount = (amount: number, currencyCode: string) => {
    return formatCurrencyWithCode(amount, currencyCode);
  };

  const formatTotalAmount = (amount: number) => {
    if (hasMixedCurrencies) {
      return `${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (Mixed)`;
    }
    return formatCurrencyWithCode(amount, singleCurrency || 'BHD');
  };

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
              <p className="text-2xl font-bold">{formatTotalAmount(totals.gross)}</p>
              {hasMixedCurrencies && (
                <Badge variant="outline" className="text-xs mt-1">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Mixed Currencies
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-teal-100 dark:bg-teal-900/30 rounded-lg">
              <Wallet className="h-5 w-5 text-teal-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Net Pay</p>
              <p className="text-2xl font-bold">{formatTotalAmount(totals.net)}</p>
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
              <p className="text-2xl font-bold">{formatTotalAmount(totals.gosi)}</p>
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
                <TableCell>
                  {row.hasMixedCurrencies ? (
                    <Badge variant="outline" className="text-xs">Mixed</Badge>
                  ) : (
                    row.currencyCode
                  )}
                </TableCell>
                <TableCell className="text-right">{row.employeeCount}</TableCell>
                <TableCell className="text-right">{formatAmount(row.totalGross, row.currencyCode)}</TableCell>
                <TableCell className="text-right">{formatAmount(row.totalDeductions, row.currencyCode)}</TableCell>
                <TableCell className="text-right">{formatAmount(row.totalNetPay, row.currencyCode)}</TableCell>
                <TableCell className="text-right">{formatAmount(row.employeeGosiTotal, row.currencyCode)}</TableCell>
                <TableCell className="text-right">{formatAmount(row.employerGosiTotal, row.currencyCode)}</TableCell>
                <TableCell className="text-right">{formatAmount(row.loanDeductionsTotal, row.currencyCode)}</TableCell>
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
