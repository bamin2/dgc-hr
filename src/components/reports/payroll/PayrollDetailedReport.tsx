import { useState } from 'react';
import { ReportViewer } from '../ReportViewer';
import { ReportFilters, ReportColumn, PayrollDetailedRecord } from '@/types/reports';
import { usePayrollDetailed } from '@/hooks/reports';
import { useCompanySettings } from '@/contexts/CompanySettingsContext';
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
  const { settings, formatCurrency } = useCompanySettings();

  return (
    <ReportViewer
      title="Payroll Detailed Report"
      description="Per-employee breakdown of salary components, allowances, deductions, and net pay"
      filters={filters}
      onFilterChange={setFilters}
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
                <TableCell className="text-right">{formatCurrency(row.baseSalary)}</TableCell>
                <TableCell className="text-right">{formatCurrency(row.housingAllowance)}</TableCell>
                <TableCell className="text-right">{formatCurrency(row.transportationAllowance)}</TableCell>
                <TableCell className="text-right">{formatCurrency(row.otherAllowances)}</TableCell>
                <TableCell className="text-right font-medium">{formatCurrency(row.grossPay)}</TableCell>
                <TableCell className="text-right">{formatCurrency(row.employeeGosi)}</TableCell>
                <TableCell className="text-right">{formatCurrency(row.loanDeductions)}</TableCell>
                <TableCell className="text-right">{formatCurrency(row.totalDeductions)}</TableCell>
                <TableCell className="text-right font-medium">{formatCurrency(row.netPay)}</TableCell>
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
