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
import { Wallet, TrendingDown, Clock, CheckCircle } from 'lucide-react';
import { CurrencyViewToggle, CurrencyViewMode } from '../CurrencyViewToggle';
import { useFxRatesForCurrencies, convertToBaseCurrency, getMissingRateCurrencies } from '@/hooks/useFxRates';

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
  const [viewMode, setViewMode] = useState<CurrencyViewMode>('local');
  const { data = [], isLoading, refetch } = useLoanSummaryReport(filters);
  const { settings } = useCompanySettings();

  const reportingCurrency = settings?.branding?.reportingCurrency || 'BHD';

  // Get unique currencies from data (excluding reporting currency)
  const currencies = useMemo(() => {
    const uniqueCurrencies = [...new Set(data.map(r => r.currencyCode))];
    return uniqueCurrencies.filter(c => c && c !== reportingCurrency);
  }, [data, reportingCurrency]);

  // Fetch FX rates for all currencies
  const { data: fxRatesMap } = useFxRatesForCurrencies(currencies);

  // Check for missing rates
  const missingRates = useMemo(() => {
    if (!fxRatesMap) return currencies;
    return getMissingRateCurrencies(currencies, fxRatesMap);
  }, [currencies, fxRatesMap]);

  // Get the FX rate info for display
  const fxRateInfo = useMemo(() => {
    if (!fxRatesMap || currencies.length === 0) return null;
    const firstCurrency = currencies[0];
    const rateInfo = fxRatesMap.get(firstCurrency);
    if (!rateInfo) return null;
    return {
      currency: firstCurrency,
      rate: rateInfo.rate,
      effectiveDate: rateInfo.effectiveDate,
    };
  }, [fxRatesMap, currencies]);

  // Convert data to reporting currency if needed
  const displayData = useMemo(() => {
    if (viewMode === 'local' || !fxRatesMap) return data;

    return data.map(row => {
      if (row.currencyCode === reportingCurrency) return row;

      const originalConv = convertToBaseCurrency(row.originalAmount, row.currencyCode, fxRatesMap);
      if (!originalConv) return row;

      const outstandingConv = convertToBaseCurrency(row.outstandingBalance, row.currencyCode, fxRatesMap);
      const installmentConv = convertToBaseCurrency(row.installmentAmount, row.currencyCode, fxRatesMap);

      return {
        ...row,
        originalAmount: originalConv.convertedAmount,
        outstandingBalance: outstandingConv?.convertedAmount ?? row.outstandingBalance,
        installmentAmount: installmentConv?.convertedAmount ?? row.installmentAmount,
        currencyCode: reportingCurrency,
      };
    });
  }, [data, viewMode, fxRatesMap, reportingCurrency]);

  // Check if there are mixed currencies in totals (only in local mode)
  const hasMixedCurrencies = useMemo(() => {
    if (viewMode === 'reporting') return false;
    const currencies = new Set(data.map(r => r.currencyCode));
    return currencies.size > 1;
  }, [data, viewMode]);

  // Get single currency for display if all same
  const singleCurrency = useMemo(() => {
    if (viewMode === 'reporting') return reportingCurrency;
    if (hasMixedCurrencies) return null;
    return data.length > 0 ? data[0].currencyCode : 'BHD';
  }, [data, hasMixedCurrencies, viewMode, reportingCurrency]);

  const totals = displayData.reduce(
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
            <div className="p-2 bg-teal-100 dark:bg-teal-900/30 rounded-lg">
              <Clock className="h-5 w-5 text-teal-600" />
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
      data={displayData}
      columns={columns}
      isLoading={isLoading}
      onRefresh={() => refetch()}
      summaryCards={summaryCards}
      exportFormats={['excel', 'csv']}
      companyName={settings?.name}
    >
      <div className="mb-4">
        <CurrencyViewToggle
          mode={viewMode}
          onModeChange={setViewMode}
          reportingCurrency={reportingCurrency}
          fxRateInfo={fxRateInfo}
          missingRateCurrencies={missingRates}
        />
      </div>

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
            {displayData.map((row) => (
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
            {displayData.length === 0 && !isLoading && (
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
