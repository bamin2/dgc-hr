import { useState } from 'react';
import { ReportViewer } from '../ReportViewer';
import { usePayslipRegister } from '@/hooks/reports';
import { ReportFilters, ReportColumn, PayslipRegisterRecord } from '@/types/reports';
import { useCompanySettings } from '@/contexts/CompanySettingsContext';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';
import { CheckCircle, XCircle } from 'lucide-react';
import { cn, getResponsiveFontSize } from '@/lib/utils';

export function PayslipRegisterReport() {
  const { settings } = useCompanySettings();
  const [filters, setFilters] = useState<ReportFilters>({});
  
  const { data, isLoading, refetch } = usePayslipRegister(filters);
  
  const columns: ReportColumn<PayslipRegisterRecord>[] = [
    { key: 'payPeriod', header: 'Pay Period', format: 'text' },
    { key: 'employeeCode', header: 'Employee Code', format: 'text' },
    { key: 'employeeName', header: 'Employee Name', format: 'text' },
    { key: 'department', header: 'Department', format: 'text' },
    { key: 'payslipIssued', header: 'Payslip Issued', format: 'text' },
    { key: 'issueDate', header: 'Issue Date', format: 'date' },
    { key: 'issuedBy', header: 'Issued By', format: 'text' },
  ];

  // Calculate summary stats
  const totalPayslips = (data || []).length;
  const issuedCount = (data || []).filter(d => d.payslipIssued).length;
  const pendingCount = totalPayslips - issuedCount;
  
  // Group data by payroll run
  const runGroups = (data || []).reduce((acc, record) => {
    acc.add(record.payrollRunId);
    return acc;
  }, new Set<string>());

  const summaryCards = (
    <>
      <Card>
        <CardContent className="pt-6">
          <div className={cn("font-bold", getResponsiveFontSize(totalPayslips))}>{totalPayslips}</div>
          <p className="text-xs text-muted-foreground">Total Payslips</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className={cn("font-bold text-emerald-600", getResponsiveFontSize(issuedCount))}>{issuedCount}</div>
          <p className="text-xs text-muted-foreground">Issued</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className={cn("font-bold text-amber-600", getResponsiveFontSize(pendingCount))}>{pendingCount}</div>
          <p className="text-xs text-muted-foreground">Pending</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className={cn("font-bold", getResponsiveFontSize(runGroups.size))}>{runGroups.size}</div>
          <p className="text-xs text-muted-foreground">Payroll Runs</p>
        </CardContent>
      </Card>
    </>
  );

  return (
    <ReportViewer
      title="Payslip Register"
      description="Track payslip issuance status for each employee per payroll run"
      filters={filters}
      onFiltersChange={setFilters}
      data={data || []}
      columns={columns as ReportColumn<any>[]}
      isLoading={isLoading}
      onRefresh={refetch}
      summaryCards={summaryCards}
      exportFormats={['excel', 'csv']}
      companyName={settings?.name}
      locationName={settings?.address?.city || undefined}
    >
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pay Period</TableHead>
              <TableHead>Employee Code</TableHead>
              <TableHead>Employee Name</TableHead>
              <TableHead>Department</TableHead>
              <TableHead className="text-center">Payslip Issued</TableHead>
              <TableHead>Issue Date</TableHead>
              <TableHead>Issued By</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  Loading payslip register...
                </TableCell>
              </TableRow>
            ) : (data || []).length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No payslip records found
                </TableCell>
              </TableRow>
            ) : (
              (data || []).map((record) => (
                <TableRow key={`${record.payrollRunId}-${record.employeeId}`}>
                  <TableCell className="font-medium">{record.payPeriod}</TableCell>
                  <TableCell>{record.employeeCode}</TableCell>
                  <TableCell>{record.employeeName}</TableCell>
                  <TableCell>{record.department}</TableCell>
                  <TableCell className="text-center">
                    {record.payslipIssued ? (
                      <Badge variant="default" className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Issued
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                        <XCircle className="h-3 w-3 mr-1" />
                        Pending
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {record.issueDate 
                      ? format(new Date(record.issueDate), 'MMM d, yyyy')
                      : '-'}
                  </TableCell>
                  <TableCell>{record.issuedBy || '-'}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </ReportViewer>
  );
}
