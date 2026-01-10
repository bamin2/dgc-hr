import { useState } from 'react';
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
  const { data = [], isLoading, refetch } = usePayrollDetailed(filters);
  const { settings } = useCompanySettings();

  const formatAmount = (amount: number, currencyCode: string) => {
    return formatCurrencyWithCode(amount, currencyCode);
  };

  return (
    <ReportViewer
      title="Payroll Detailed Report"
      description="Per-employee breakdown of salary components, allowances, deductions, and net pay"
      filters={filters}
      onFiltersChange={setFilters}
      data={data}
      columns={columns}
      isLoading={isLoading}
      onRefresh={() => refetch()}
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
            {data.length === 0 && !isLoading && (
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
