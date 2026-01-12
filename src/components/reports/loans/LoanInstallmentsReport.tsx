import { useState, useMemo } from 'react';
import { ReportViewer } from '../ReportViewer';
import { ReportFilters, ReportColumn, LoanInstallmentRecord } from '@/types/reports';
import { useLoanInstallmentsReport } from '@/hooks/reports';
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
import { CurrencyViewToggle, CurrencyViewMode } from '../CurrencyViewToggle';
import { useFxRatesForCurrencies, convertToBaseCurrency, getMissingRateCurrencies } from '@/hooks/useFxRates';

const columns: ReportColumn<LoanInstallmentRecord>[] = [
  { key: 'employeeName', header: 'Employee Name' },
  { key: 'currencyCode', header: 'Currency' },
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
  const [viewMode, setViewMode] = useState<CurrencyViewMode>('local');
  const { data = [], isLoading, refetch } = useLoanInstallmentsReport(filters);
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

      const amountConv = convertToBaseCurrency(row.amount, row.currencyCode, fxRatesMap);
      if (!amountConv) return row;

      return {
        ...row,
        amount: amountConv.convertedAmount,
        currencyCode: reportingCurrency,
      };
    });
  }, [data, viewMode, fxRatesMap, reportingCurrency]);

  const formatAmount = (amount: number, currencyCode: string) => {
    return formatCurrencyWithCode(amount, currencyCode);
  };

  return (
    <ReportViewer
      title="Loan Installments Report"
      description="Monthly breakdown of loan installments with payment status and deduction method"
      filters={filters}
      onFiltersChange={setFilters}
      data={displayData}
      columns={columns}
      isLoading={isLoading}
      onRefresh={() => refetch()}
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
              <TableRow key={row.installmentId}>
                <TableCell>{row.employeeName}</TableCell>
                <TableCell>{row.currencyCode}</TableCell>
                <TableCell>{row.dueMonth}</TableCell>
                <TableCell>{format(new Date(row.dueDate), 'MMM d, yyyy')}</TableCell>
                <TableCell className="text-right">{formatAmount(row.amount, row.currencyCode)}</TableCell>
                <TableCell>{getStatusBadge(row.status)}</TableCell>
                <TableCell>{getPaymentMethodBadge(row.paymentMethod)}</TableCell>
                <TableCell>
                  {row.paidDate ? format(new Date(row.paidDate), 'MMM d, yyyy') : '-'}
                </TableCell>
              </TableRow>
            ))}
            {displayData.length === 0 && !isLoading && (
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
