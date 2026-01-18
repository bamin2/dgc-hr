import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ReportViewer } from '../ReportViewer';
import { ReportFilters, ReportColumn, GosiContributionRecord } from '@/types/reports';
import { useGosiContributionReport } from '@/hooks/reports';
import { useCompanySettings } from '@/contexts/CompanySettingsContext';
import { formatCurrencyWithCode } from '@/lib/salaryUtils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Users, DollarSign, Building2, Percent } from 'lucide-react';
import { CurrencyViewToggle, CurrencyViewMode } from '../CurrencyViewToggle';
import { cn, getResponsiveFontSize } from '@/lib/utils';
import { useFxRatesForCurrencies, convertToBaseCurrency, getMissingRateCurrencies } from '@/hooks/useFxRates';

const columns: ReportColumn<GosiContributionRecord>[] = [
  { key: 'employeeCode', header: 'Emp Code' },
  { key: 'employeeName', header: 'Employee Name' },
  { key: 'nationality', header: 'Nationality' },
  { key: 'location', header: 'Location' },
  { key: 'currencyCode', header: 'Currency' },
  { key: 'gosiRegisteredSalary', header: 'GOSI Salary', format: 'currency', align: 'right' },
  { key: 'employeeRate', header: 'Emp Rate', format: 'percentage', align: 'right' },
  { key: 'employerRate', header: 'Empr Rate', format: 'percentage', align: 'right' },
  { key: 'employeeContribution', header: 'Employee Contrib.', format: 'currency', align: 'right' },
  { key: 'employerContribution', header: 'Employer Contrib.', format: 'currency', align: 'right' },
  { key: 'totalContribution', header: 'Total', format: 'currency', align: 'right' },
];

export function GosiContributionReport() {
  const [filters, setFilters] = useState<ReportFilters>({});
  const [viewMode, setViewMode] = useState<CurrencyViewMode>('local');
  const { data = [], isLoading, refetch } = useGosiContributionReport(filters);
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

      const gosiSalaryConv = convertToBaseCurrency(row.gosiRegisteredSalary, row.currencyCode, fxRatesMap);
      if (!gosiSalaryConv) return row;

      const empContribConv = convertToBaseCurrency(row.employeeContribution, row.currencyCode, fxRatesMap);
      const emprContribConv = convertToBaseCurrency(row.employerContribution, row.currencyCode, fxRatesMap);
      const totalContribConv = convertToBaseCurrency(row.totalContribution, row.currencyCode, fxRatesMap);

      return {
        ...row,
        gosiRegisteredSalary: gosiSalaryConv.convertedAmount,
        employeeContribution: empContribConv?.convertedAmount ?? row.employeeContribution,
        employerContribution: emprContribConv?.convertedAmount ?? row.employerContribution,
        totalContribution: totalContribConv?.convertedAmount ?? row.totalContribution,
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
      employees: acc.employees + 1,
      gosiSalary: acc.gosiSalary + row.gosiRegisteredSalary,
      employeeContrib: acc.employeeContrib + row.employeeContribution,
      employerContrib: acc.employerContrib + row.employerContribution,
      total: acc.total + row.totalContribution,
    }),
    { employees: 0, gosiSalary: 0, employeeContrib: 0, employerContrib: 0, total: 0 }
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
              <p className="text-sm text-muted-foreground">GOSI Employees</p>
              <p className={cn("font-bold", getResponsiveFontSize(totals.employees))}>{totals.employees}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-teal-100 dark:bg-teal-900/30 rounded-lg">
              <DollarSign className="h-5 w-5 text-teal-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Employee Contributions</p>
              <p className={cn("font-bold", getResponsiveFontSize(formatTotalAmount(totals.employeeContrib)))}>{formatTotalAmount(totals.employeeContrib)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
              <Building2 className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Employer Contributions</p>
              <p className={cn("font-bold", getResponsiveFontSize(formatTotalAmount(totals.employerContrib)))}>{formatTotalAmount(totals.employerContrib)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
              <Percent className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Contributions</p>
              <p className={cn("font-bold", getResponsiveFontSize(formatTotalAmount(totals.total)))}>{formatTotalAmount(totals.total)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );

  return (
    <ReportViewer
      title="GOSI Contribution Report"
      description="Employee and employer GOSI contributions by nationality and location"
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
              <TableRow key={row.employeeId}>
                <TableCell>{row.employeeCode}</TableCell>
                <TableCell>{row.employeeName}</TableCell>
                <TableCell>{row.nationality}</TableCell>
                <TableCell>{row.location}</TableCell>
                <TableCell>{row.currencyCode}</TableCell>
                <TableCell className="text-right">{formatAmount(row.gosiRegisteredSalary, row.currencyCode)}</TableCell>
                <TableCell className="text-right">{row.employeeRate.toFixed(1)}%</TableCell>
                <TableCell className="text-right">{row.employerRate.toFixed(1)}%</TableCell>
                <TableCell className="text-right">{formatAmount(row.employeeContribution, row.currencyCode)}</TableCell>
                <TableCell className="text-right">{formatAmount(row.employerContribution, row.currencyCode)}</TableCell>
                <TableCell className="text-right font-medium">{formatAmount(row.totalContribution, row.currencyCode)}</TableCell>
              </TableRow>
            ))}
            {displayData.length === 0 && !isLoading && (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  No GOSI records found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </ReportViewer>
  );
}
