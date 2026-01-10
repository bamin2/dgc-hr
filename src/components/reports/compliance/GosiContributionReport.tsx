import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ReportViewer } from '../ReportViewer';
import { ReportFilters, ReportColumn, GosiContributionRecord } from '@/types/reports';
import { useGosiContributionReport } from '@/hooks/reports';
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
import { Users, DollarSign, Building2, Percent, AlertTriangle } from 'lucide-react';

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
  const { data = [], isLoading, refetch } = useGosiContributionReport(filters);
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
              <p className="text-2xl font-bold">{totals.employees}</p>
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
              <p className="text-2xl font-bold">{formatTotalAmount(totals.employeeContrib)}</p>
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
              <Building2 className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Employer Contributions</p>
              <p className="text-2xl font-bold">{formatTotalAmount(totals.employerContrib)}</p>
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
              <p className="text-2xl font-bold">{formatTotalAmount(totals.total)}</p>
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
            {data.length === 0 && !isLoading && (
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
