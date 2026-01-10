import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ReportViewer } from '../ReportViewer';
import { ReportFilters, ReportColumn, LoanSummaryRecord } from '@/types/reports';
import { useLoanSummaryReport } from '@/hooks/reports';
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
import { Wallet, TrendingDown, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

const columns: ReportColumn<LoanSummaryRecord>[] = [
  { key: 'employeeCode', header: 'Emp Code' },
  { key: 'employeeName', header: 'Employee Name' },
  { key: 'department', header: 'Department' },
  { key: 'currencyCode', header: 'Currency' },
  { key: 'originalAmount', header: 'Original Amount', format: 'currency', align: 'right' },
  { key: 'outstandingBalance', header: 'Outstanding', format: 'currency', align: 'right' },
  { key: 'installmentAmount', header: 'Installment', format: 'currency', align: 'right' },
  { key: 'paidInstallments', header: 'Paid', format: 'number', align: 'right' },
  { key: 'remainingInstallments', header: 'Remaining', format: 'number', align: 'right' },
  { key: 'status', header: 'Status' },
  { key: 'startDate', header: 'Start Date', format: 'date' },
];

function getStatusBadge(status: string) {
  const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    active: 'default',
    pending: 'secondary',
    closed: 'outline',
    rejected: 'destructive',
  };
  return (
    <Badge variant={variants[status] || 'secondary'} className="capitalize">
      {status}
    </Badge>
  );
}

export function LoanSummaryReport() {
  const [filters, setFilters] = useState<ReportFilters>({});
  const { data = [], isLoading, refetch } = useLoanSummaryReport(filters);
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
    (acc, row) => ({
      originalAmount: acc.originalAmount + row.originalAmount,
      outstanding: acc.outstanding + row.outstandingBalance,
      activeLoans: acc.activeLoans + (row.status === 'active' ? 1 : 0),
      closedLoans: acc.closedLoans + (row.status === 'closed' ? 1 : 0),
    }),
    { originalAmount: 0, outstanding: 0, activeLoans: 0, closedLoans: 0 }
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
              <Wallet className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Disbursed</p>
              <p className="text-2xl font-bold">{formatTotalAmount(totals.originalAmount)}</p>
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
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
              <TrendingDown className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Outstanding Balance</p>
              <p className="text-2xl font-bold">{formatTotalAmount(totals.outstanding)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Loans</p>
              <p className="text-2xl font-bold">{totals.activeLoans}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
              <CheckCircle className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Closed Loans</p>
              <p className="text-2xl font-bold">{totals.closedLoans}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );

  return (
    <ReportViewer
      title="Loan Summary Report"
      description="Overview of all employee loans with original amounts, outstanding balances, and payment status"
      filters={filters}
      onFiltersChange={setFilters}
      data={data}
      columns={columns}
      isLoading={isLoading}
      onRefresh={() => refetch()}
      summaryCards={summaryCards}
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
              <TableRow key={row.loanId}>
                <TableCell>{row.employeeCode}</TableCell>
                <TableCell>{row.employeeName}</TableCell>
                <TableCell>{row.department}</TableCell>
                <TableCell>{row.currencyCode}</TableCell>
                <TableCell className="text-right">{formatAmount(row.originalAmount, row.currencyCode)}</TableCell>
                <TableCell className="text-right">{formatAmount(row.outstandingBalance, row.currencyCode)}</TableCell>
                <TableCell className="text-right">{formatAmount(row.installmentAmount, row.currencyCode)}</TableCell>
                <TableCell className="text-right">{row.paidInstallments}</TableCell>
                <TableCell className="text-right">{row.remainingInstallments}</TableCell>
                <TableCell>{getStatusBadge(row.status)}</TableCell>
                <TableCell>{format(new Date(row.startDate), 'MMM d, yyyy')}</TableCell>
              </TableRow>
            ))}
            {data.length === 0 && !isLoading && (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  No loans found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </ReportViewer>
  );
}
