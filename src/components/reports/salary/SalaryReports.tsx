import { useState, useMemo } from 'react';
import { ReportViewer } from '../ReportViewer';
import { ReportFilters, ReportColumn, SalaryDistributionRecord, SalaryChangeRecord } from '@/types/reports';
import { useSalaryDistribution, useSalaryChangeHistory } from '@/hooks/reports';
import { useCompanySettings } from '@/contexts/CompanySettingsContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';
import { CurrencyViewToggle, CurrencyViewMode } from './CurrencyViewToggle';
import { formatCurrencyWithCode } from '@/lib/salaryUtils';
import { useFxRatesForCurrencies, convertToBaseCurrency, getMissingRateCurrencies } from '@/hooks/useFxRates';

const distributionColumns: ReportColumn<SalaryDistributionRecord>[] = [
  { key: 'department', header: 'Department' },
  { key: 'location', header: 'Location' },
  { key: 'currencyCode', header: 'Currency' },
  { key: 'employeeCount', header: 'Employees', format: 'number', align: 'right' },
  { key: 'minGrossPay', header: 'Min Gross Pay', format: 'currency', align: 'right' },
  { key: 'maxGrossPay', header: 'Max Gross Pay', format: 'currency', align: 'right' },
  { key: 'avgGrossPay', header: 'Avg Gross Pay', format: 'currency', align: 'right' },
  { key: 'medianGrossPay', header: 'Median', format: 'currency', align: 'right' },
  { key: 'totalGrossPay', header: 'Total Gross Pay', format: 'currency', align: 'right' },
];

const changeColumns: ReportColumn<SalaryChangeRecord>[] = [
  { key: 'employeeCode', header: 'Emp Code' },
  { key: 'employeeName', header: 'Employee Name' },
  { key: 'department', header: 'Department' },
  { key: 'currencyCode', header: 'Currency' },
  { key: 'effectiveDate', header: 'Effective Date', format: 'date' },
  { key: 'previousSalary', header: 'Previous', format: 'currency', align: 'right' },
  { key: 'newSalary', header: 'New', format: 'currency', align: 'right' },
  { key: 'changeAmount', header: 'Change', format: 'currency', align: 'right' },
  { key: 'changePercentage', header: '% Change', format: 'percentage', align: 'right' },
  { key: 'changeType', header: 'Type' },
];

export function SalaryDistributionReport() {
  const [filters, setFilters] = useState<ReportFilters>({});
  const [viewMode, setViewMode] = useState<CurrencyViewMode>('local');
  const { data = [], isLoading, error, refetch } = useSalaryDistribution(filters);
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
  
  // Get the FX rate info for display (pick the first non-BHD currency rate)
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
    
    // In reporting mode, convert all values to reporting currency
    return data.map(row => {
      if (row.currencyCode === reportingCurrency) return row;
      
      const conversion = convertToBaseCurrency(row.totalGrossPay, row.currencyCode, fxRatesMap);
      if (!conversion) return row; // Can't convert without rate
      
      const minConv = convertToBaseCurrency(row.minGrossPay, row.currencyCode, fxRatesMap);
      const maxConv = convertToBaseCurrency(row.maxGrossPay, row.currencyCode, fxRatesMap);
      const avgConv = convertToBaseCurrency(row.avgGrossPay, row.currencyCode, fxRatesMap);
      const medianConv = convertToBaseCurrency(row.medianGrossPay, row.currencyCode, fxRatesMap);
      
      return {
        ...row,
        minGrossPay: minConv?.convertedAmount ?? row.minGrossPay,
        maxGrossPay: maxConv?.convertedAmount ?? row.maxGrossPay,
        avgGrossPay: avgConv?.convertedAmount ?? row.avgGrossPay,
        medianGrossPay: medianConv?.convertedAmount ?? row.medianGrossPay,
        totalGrossPay: conversion.convertedAmount,
        currencyCode: reportingCurrency,
      };
    });
  }, [data, viewMode, fxRatesMap, reportingCurrency]);

  // Format currency based on view mode
  const formatAmount = (amount: number, currencyCode: string) => {
    return formatCurrencyWithCode(amount, currencyCode);
  };

  return (
    <ReportViewer
      title="Salary Distribution Report"
      description="Total gross pay (basic salary + allowances) statistics grouped by department, location, and currency"
      filters={filters}
      onFiltersChange={setFilters}
      data={displayData}
      columns={distributionColumns}
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
      
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-4">
          <p className="text-destructive font-medium">Error loading salary distribution:</p>
          <p className="text-destructive/80 text-sm">{(error as Error).message}</p>
        </div>
      )}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {distributionColumns.map((col) => (
                <TableHead key={String(col.key)} className={col.align === 'right' ? 'text-right' : ''}>
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayData.map((row, idx) => (
              <TableRow key={`${row.department}-${row.location}-${row.currencyCode}-${idx}`}>
                <TableCell>{row.department}</TableCell>
                <TableCell>{row.location}</TableCell>
                <TableCell>{row.currencyCode}</TableCell>
                <TableCell className="text-right">{row.employeeCount}</TableCell>
                <TableCell className="text-right">{formatAmount(row.minGrossPay, row.currencyCode)}</TableCell>
                <TableCell className="text-right">{formatAmount(row.maxGrossPay, row.currencyCode)}</TableCell>
                <TableCell className="text-right">{formatAmount(row.avgGrossPay, row.currencyCode)}</TableCell>
                <TableCell className="text-right">{formatAmount(row.medianGrossPay, row.currencyCode)}</TableCell>
                <TableCell className="text-right font-medium">{formatAmount(row.totalGrossPay, row.currencyCode)}</TableCell>
              </TableRow>
            ))}
            {displayData.length === 0 && !isLoading && (
              <TableRow>
                <TableCell colSpan={distributionColumns.length} className="h-24 text-center text-muted-foreground">
                  No salary data found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </ReportViewer>
  );
}

export function SalaryChangeHistoryReport() {
  const [filters, setFilters] = useState<ReportFilters>({});
  const { data = [], isLoading, error, refetch } = useSalaryChangeHistory(filters);
  const { settings } = useCompanySettings();

  const formatAmount = (amount: number, currencyCode: string) => {
    return formatCurrencyWithCode(amount, currencyCode);
  };

  return (
    <ReportViewer
      title="Salary Change History"
      description="Historical record of all salary changes with before/after values and change reasons"
      filters={filters}
      onFiltersChange={setFilters}
      data={data}
      columns={changeColumns}
      isLoading={isLoading}
      onRefresh={() => refetch()}
      exportFormats={['excel', 'csv']}
      companyName={settings?.name}
    >
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-4">
          <p className="text-destructive font-medium">Error loading salary change history:</p>
          <p className="text-destructive/80 text-sm">{(error as Error).message}</p>
        </div>
      )}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {changeColumns.map((col) => (
                <TableHead key={String(col.key)} className={col.align === 'right' ? 'text-right' : ''}>
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, idx) => (
              <TableRow key={`${row.employeeId}-${row.effectiveDate}-${idx}`}>
                <TableCell>{row.employeeCode}</TableCell>
                <TableCell>{row.employeeName}</TableCell>
                <TableCell>{row.department}</TableCell>
                <TableCell>{row.currencyCode}</TableCell>
                <TableCell>{format(new Date(row.effectiveDate), 'MMM d, yyyy')}</TableCell>
                <TableCell className="text-right">{formatAmount(row.previousSalary, row.currencyCode)}</TableCell>
                <TableCell className="text-right">{formatAmount(row.newSalary, row.currencyCode)}</TableCell>
                <TableCell className={`text-right ${row.changeAmount >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {row.changeAmount >= 0 ? '+' : ''}{formatAmount(row.changeAmount, row.currencyCode)}
                </TableCell>
                <TableCell className={`text-right ${row.changePercentage >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {row.changePercentage >= 0 ? '+' : ''}{row.changePercentage.toFixed(1)}%
                </TableCell>
                <TableCell className="capitalize">{row.changeType?.replace('_', ' ') || '-'}</TableCell>
              </TableRow>
            ))}
            {data.length === 0 && !isLoading && (
              <TableRow>
                <TableCell colSpan={changeColumns.length} className="h-24 text-center text-muted-foreground">
                  No salary changes found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </ReportViewer>
  );
}

export function SalaryReportsTab() {
  return (
    <Tabs defaultValue="distribution" className="space-y-6">
      <TabsList>
        <TabsTrigger value="distribution">Salary Distribution</TabsTrigger>
        <TabsTrigger value="history">Change History</TabsTrigger>
      </TabsList>
      <TabsContent value="distribution">
        <SalaryDistributionReport />
      </TabsContent>
      <TabsContent value="history">
        <SalaryChangeHistoryReport />
      </TabsContent>
    </Tabs>
  );
}
