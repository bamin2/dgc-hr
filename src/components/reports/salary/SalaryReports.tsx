import { useState } from 'react';
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

const distributionColumns: ReportColumn<SalaryDistributionRecord>[] = [
  { key: 'department', header: 'Department' },
  { key: 'location', header: 'Location' },
  { key: 'employeeCount', header: 'Employees', format: 'number', align: 'right' },
  { key: 'minSalary', header: 'Min Salary', format: 'currency', align: 'right' },
  { key: 'maxSalary', header: 'Max Salary', format: 'currency', align: 'right' },
  { key: 'avgSalary', header: 'Avg Salary', format: 'currency', align: 'right' },
  { key: 'medianSalary', header: 'Median', format: 'currency', align: 'right' },
  { key: 'totalSalary', header: 'Total', format: 'currency', align: 'right' },
];

const changeColumns: ReportColumn<SalaryChangeRecord>[] = [
  { key: 'employeeCode', header: 'Emp Code' },
  { key: 'employeeName', header: 'Employee Name' },
  { key: 'department', header: 'Department' },
  { key: 'effectiveDate', header: 'Effective Date', format: 'date' },
  { key: 'previousSalary', header: 'Previous', format: 'currency', align: 'right' },
  { key: 'newSalary', header: 'New', format: 'currency', align: 'right' },
  { key: 'changeAmount', header: 'Change', format: 'currency', align: 'right' },
  { key: 'changePercentage', header: '% Change', format: 'percentage', align: 'right' },
  { key: 'changeType', header: 'Type' },
];

export function SalaryDistributionReport() {
  const [filters, setFilters] = useState<ReportFilters>({});
  const { data = [], isLoading, refetch } = useSalaryDistribution(filters);
  const { settings, formatCurrency } = useCompanySettings();

  return (
    <ReportViewer
      title="Salary Distribution Report"
      description="Salary statistics including average, median, and ranges grouped by department and location"
      filters={filters}
      onFiltersChange={setFilters}
      data={data}
      columns={distributionColumns}
      isLoading={isLoading}
      onRefresh={() => refetch()}
      exportFormats={['excel', 'csv']}
      companyName={settings?.name}
    >
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
            {data.map((row, idx) => (
              <TableRow key={`${row.department}-${row.location}-${idx}`}>
                <TableCell>{row.department}</TableCell>
                <TableCell>{row.location}</TableCell>
                <TableCell className="text-right">{row.employeeCount}</TableCell>
                <TableCell className="text-right">{formatCurrency(row.minSalary)}</TableCell>
                <TableCell className="text-right">{formatCurrency(row.maxSalary)}</TableCell>
                <TableCell className="text-right">{formatCurrency(row.avgSalary)}</TableCell>
                <TableCell className="text-right">{formatCurrency(row.medianSalary)}</TableCell>
                <TableCell className="text-right font-medium">{formatCurrency(row.totalSalary)}</TableCell>
              </TableRow>
            ))}
            {data.length === 0 && !isLoading && (
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
  const { data = [], isLoading, refetch } = useSalaryChangeHistory(filters);
  const { settings, formatCurrency } = useCompanySettings();

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
                <TableCell>{format(new Date(row.effectiveDate), 'MMM d, yyyy')}</TableCell>
                <TableCell className="text-right">{formatCurrency(row.previousSalary)}</TableCell>
                <TableCell className="text-right">{formatCurrency(row.newSalary)}</TableCell>
                <TableCell className={`text-right ${row.changeAmount >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {row.changeAmount >= 0 ? '+' : ''}{formatCurrency(row.changeAmount)}
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
