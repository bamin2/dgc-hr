import { useState, useMemo } from 'react';
import { ReportViewer } from '../ReportViewer';
import { ReportFilters, ReportColumn, PayrollDetailedRecord } from '@/types/reports';
import { usePayrollDetailed } from '@/hooks/reports';
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
import { CurrencyViewToggle, CurrencyViewMode } from '../CurrencyViewToggle';
import { useFxRatesForCurrencies, convertToBaseCurrency, getMissingRateCurrencies } from '@/hooks/useFxRates';

const columns: ReportColumn<PayrollDetailedRecord>[] = [
  { key: 'employeeCode', header: 'Emp Code' },
  { key: 'employeeName', header: 'Employee Name' },
  { key: 'department', header: 'Department' },
  { key: 'currencyCode', header: 'Currency' },
  { key: 'baseSalary', header: 'Base Salary', format: 'currency', align: 'right' },
  { key: 'housingAllowance', header: 'Housing', format: 'currency', align: 'right' },
  { key: 'transportationAllowance', header: 'Transport', format: 'currency', align: 'right' },
  { key: 'otherAllowances', header: 'Other Allow.', format: 'currency', align: 'right' },
  { key: 'grossPay', header: 'Gross Pay', format: 'currency', align: 'right' },
  { key: 'employeeGosi', header: 'Emp GOSI', format: 'currency', align: 'right' },
  { key: 'loanDeductions', header: 'Loans', format: 'currency', align: 'right' },
  { key: 'totalDeductions', header: 'Total Ded.', format: 'currency', align: 'right' },
  { key: 'netPay', header: 'Net Pay', format: 'currency', align: 'right' },
];

export function PayrollDetailedReport() {
  const [filters, setFilters] = useState<ReportFilters>({});
  const [viewMode, setViewMode] = useState<CurrencyViewMode>('local');
  const { data = [], isLoading, refetch } = usePayrollDetailed(filters);
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

      const baseConv = convertToBaseCurrency(row.baseSalary, row.currencyCode, fxRatesMap);
      if (!baseConv) return row;

      const housingConv = convertToBaseCurrency(row.housingAllowance, row.currencyCode, fxRatesMap);
      const transportConv = convertToBaseCurrency(row.transportationAllowance, row.currencyCode, fxRatesMap);
      const otherConv = convertToBaseCurrency(row.otherAllowances, row.currencyCode, fxRatesMap);
      const grossConv = convertToBaseCurrency(row.grossPay, row.currencyCode, fxRatesMap);
      const empGosiConv = convertToBaseCurrency(row.employeeGosi, row.currencyCode, fxRatesMap);
      const loanConv = convertToBaseCurrency(row.loanDeductions, row.currencyCode, fxRatesMap);
      const totalDedConv = convertToBaseCurrency(row.totalDeductions, row.currencyCode, fxRatesMap);
      const netConv = convertToBaseCurrency(row.netPay, row.currencyCode, fxRatesMap);

      return {
        ...row,
        baseSalary: baseConv.convertedAmount,
        housingAllowance: housingConv?.convertedAmount ?? row.housingAllowance,
        transportationAllowance: transportConv?.convertedAmount ?? row.transportationAllowance,
        otherAllowances: otherConv?.convertedAmount ?? row.otherAllowances,
        grossPay: grossConv?.convertedAmount ?? row.grossPay,
        employeeGosi: empGosiConv?.convertedAmount ?? row.employeeGosi,
        loanDeductions: loanConv?.convertedAmount ?? row.loanDeductions,
        totalDeductions: totalDedConv?.convertedAmount ?? row.totalDeductions,
        netPay: netConv?.convertedAmount ?? row.netPay,
        currencyCode: reportingCurrency,
      };
    });
  }, [data, viewMode, fxRatesMap, reportingCurrency]);

  const formatAmount = (amount: number, currencyCode: string) => {
    return formatCurrencyWithCode(amount, currencyCode);
  };

  return (
    <ReportViewer
      title="Payroll Detailed Report"
      description="Per-employee breakdown of salary components, allowances, deductions, and net pay"
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
              <TableRow key={row.employeeId}>
                <TableCell>{row.employeeCode}</TableCell>
                <TableCell>{row.employeeName}</TableCell>
                <TableCell>{row.department}</TableCell>
                <TableCell>{row.currencyCode}</TableCell>
                <TableCell className="text-right">{formatAmount(row.baseSalary, row.currencyCode)}</TableCell>
                <TableCell className="text-right">{formatAmount(row.housingAllowance, row.currencyCode)}</TableCell>
                <TableCell className="text-right">{formatAmount(row.transportationAllowance, row.currencyCode)}</TableCell>
                <TableCell className="text-right">{formatAmount(row.otherAllowances, row.currencyCode)}</TableCell>
                <TableCell className="text-right font-medium">{formatAmount(row.grossPay, row.currencyCode)}</TableCell>
                <TableCell className="text-right">{formatAmount(row.employeeGosi, row.currencyCode)}</TableCell>
                <TableCell className="text-right">{formatAmount(row.loanDeductions, row.currencyCode)}</TableCell>
                <TableCell className="text-right">{formatAmount(row.totalDeductions, row.currencyCode)}</TableCell>
                <TableCell className="text-right font-medium">{formatAmount(row.netPay, row.currencyCode)}</TableCell>
              </TableRow>
            ))}
            {displayData.length === 0 && !isLoading && (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  No payroll records found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </ReportViewer>
  );
}
