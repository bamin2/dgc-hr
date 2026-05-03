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
import { DollarSign, Users, TrendingUp, Wallet } from 'lucide-react';
import { CurrencyViewToggle, CurrencyViewMode } from '../CurrencyViewToggle';
import { cn, getResponsiveFontSize } from '@/lib/utils';
import { useFxRatesForCurrencies, convertToBaseCurrency, getMissingRateCurrencies } from '@/hooks/useFxRates';

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
  const [viewMode, setViewMode] = useState<CurrencyViewMode>('local');
  const { data = [], isLoading, refetch } = usePayrollRunSummary(filters);
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

      const grossConv = convertToBaseCurrency(row.totalGross, row.currencyCode, fxRatesMap);
      const deductionsConv = convertToBaseCurrency(row.totalDeductions, row.currencyCode, fxRatesMap);
      const netPayConv = convertToBaseCurrency(row.totalNetPay, row.currencyCode, fxRatesMap);
      const empGosiConv = convertToBaseCurrency(row.employeeGosiTotal, row.currencyCode, fxRatesMap);
      const emprGosiConv = convertToBaseCurrency(row.employerGosiTotal, row.currencyCode, fxRatesMap);
      const loanConv = convertToBaseCurrency(row.loanDeductionsTotal, row.currencyCode, fxRatesMap);

      if (!grossConv) return row;

      return {
        ...row,
        totalGross: grossConv.convertedAmount,
        totalDeductions: deductionsConv?.convertedAmount ?? row.totalDeductions,
        totalNetPay: netPayConv?.convertedAmount ?? row.totalNetPay,
        employeeGosiTotal: empGosiConv?.convertedAmount ?? row.employeeGosiTotal,
        employerGosiTotal: emprGosiConv?.convertedAmount ?? row.employerGosiTotal,
        loanDeductionsTotal: loanConv?.convertedAmount ?? row.loanDeductionsTotal,
        currencyCode: reportingCurrency,
        hasMixedCurrencies: false,
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
              <p className={cn("font-bold", getResponsiveFontSize(totals.employees))}>{totals.employees}</p>
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
              <p className={cn("font-bold", getResponsiveFontSize(formatTotalAmount(totals.gross)))}>{formatTotalAmount(totals.gross)}</p>
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
              <p className={cn("font-bold", getResponsiveFontSize(formatTotalAmount(totals.net)))}>{formatTotalAmount(totals.net)}</p>
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
              <p className={cn("font-bold", getResponsiveFontSize(formatTotalAmount(totals.gosi)))}>{formatTotalAmount(totals.gosi)}</p>
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
      data={displayData}
      columns={columns}
      isLoading={isLoading}
      onRefresh={() => refetch()}
      summaryCards={summaryCards}
      exportFormats={['excel', 'csv', 'pdf']}
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
            {displayData.length === 0 && !isLoading && (
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
