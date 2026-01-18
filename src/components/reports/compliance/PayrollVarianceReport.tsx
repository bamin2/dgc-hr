import { useState, Fragment } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RefreshCw, Download, ChevronDown, ChevronRight, TrendingUp, TrendingDown, Users, ArrowRightLeft } from 'lucide-react';
import { usePayrollVarianceReport, usePayrollRunsForLocation } from '@/hooks/reports/useCostReports';
import { useWorkLocationsFilter, useDepartmentsFilter } from '@/hooks/reports/useReportFilters';
import { CostReportFilters, PayrollVarianceRecord, VarianceReasonTag } from '@/types/reports';
import { exportToCSV, exportToPDF, generateReportFilename } from '@/utils/reportExport';
import { format, parseISO } from 'date-fns';
import { cn, getResponsiveFontSize } from '@/lib/utils';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-BH', {
    style: 'currency',
    currency: 'BHD',
    minimumFractionDigits: 3,
  }).format(amount);
};

const formatPercent = (value: number) => {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
};

const reasonLabels: Record<VarianceReasonTag, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  salary_change: { label: 'Salary Change', variant: 'default' },
  allowance_change: { label: 'Allowance Change', variant: 'secondary' },
  loan_started: { label: 'Loan Started', variant: 'outline' },
  loan_changed: { label: 'Loan Changed', variant: 'outline' },
  loan_ended: { label: 'Loan Ended', variant: 'outline' },
  adjustment: { label: 'Adjustment', variant: 'secondary' },
  joiner: { label: 'Joiner', variant: 'default' },
  leaver: { label: 'Leaver', variant: 'destructive' },
};

export function PayrollVarianceReport() {
  const [filters, setFilters] = useState<CostReportFilters>({});
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // Fetch locations and departments for filters
  const { data: locations } = useWorkLocationsFilter('variance');
  const { data: departments } = useDepartmentsFilter('variance');

  // Fetch payroll runs for selected location
  const { data: payrollRuns } = usePayrollRunsForLocation(filters.locationId);

  // Fetch variance report data
  const { data, isLoading, refetch } = usePayrollVarianceReport(filters);

  const toggleRow = (id: string) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleExportCSV = () => {
    if (!data?.records) return;
    const exportData = data.records.map(r => ({
      ...r,
      reasons: r.reasons.map(tag => reasonLabels[tag].label).join(', '),
    }));
    const columns = [
      { key: 'employeeCode', header: 'Employee Code' },
      { key: 'employeeName', header: 'Employee Name' },
      { key: 'department', header: 'Department' },
      { key: 'previousGrossPay', header: 'Previous Gross (BHD)', format: 'currency' as const },
      { key: 'currentGrossPay', header: 'Current Gross (BHD)', format: 'currency' as const },
      { key: 'deltaBHD', header: 'Delta (BHD)', format: 'currency' as const },
      { key: 'deltaPercent', header: 'Delta %', format: 'percentage' as const },
      { key: 'reasons', header: 'Reasons' },
    ];
    exportToCSV(exportData as unknown as Record<string, unknown>[], columns, generateReportFilename('Payroll Variance', 'csv'));
  };

  const handleExportPDF = async () => {
    if (!data?.records) return;
    const exportData = data.records.map(r => ({
      ...r,
      reasons: r.reasons.map(tag => reasonLabels[tag].label).join(', '),
    }));
    const columns = [
      { key: 'employeeCode', header: 'Code' },
      { key: 'employeeName', header: 'Name' },
      { key: 'previousGrossPay', header: 'Previous', format: 'currency' as const },
      { key: 'currentGrossPay', header: 'Current', format: 'currency' as const },
      { key: 'deltaBHD', header: 'Delta', format: 'currency' as const },
      { key: 'reasons', header: 'Reasons' },
    ];
    await exportToPDF({
      title: 'Payroll Variance Report',
      data: exportData as unknown as Record<string, unknown>[],
      columns,
      filename: generateReportFilename('Payroll Variance', 'pdf'),
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Payroll Variance Report</h2>
          <p className="text-muted-foreground">
            Compare payroll costs between periods and identify change drivers
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportCSV} disabled={!data?.records?.length}>
            <Download className="h-4 w-4 mr-2" />
            CSV
          </Button>
          <Button variant="default" size="sm" onClick={handleExportPDF} disabled={!data?.records?.length}>
            <Download className="h-4 w-4 mr-2" />
            PDF
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 p-4 bg-muted/30 rounded-lg border">
        <Select
          value={filters.locationId || 'all'}
          onValueChange={(v) => setFilters({ ...filters, locationId: v === 'all' ? undefined : v, payrollRunId: undefined, comparePayrollRunId: undefined })}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Location" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Locations</SelectItem>
            {locations?.map(loc => (
              <SelectItem key={loc.id} value={loc.id}>{loc.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.payrollRunId || ''}
          onValueChange={(v) => setFilters({ ...filters, payrollRunId: v || undefined })}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Current Period" />
          </SelectTrigger>
          <SelectContent>
            {payrollRuns?.map(run => (
              <SelectItem key={run.id} value={run.id}>
                {format(parseISO(run.pay_period_start), 'MMM yyyy')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />

        <Select
          value={filters.comparePayrollRunId || 'auto'}
          onValueChange={(v) => setFilters({ ...filters, comparePayrollRunId: v === 'auto' ? undefined : v })}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Previous (auto)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="auto">Auto (Previous Month)</SelectItem>
            {payrollRuns?.filter(r => r.id !== filters.payrollRunId).map(run => (
              <SelectItem key={run.id} value={run.id}>
                {format(parseISO(run.pay_period_start), 'MMM yyyy')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.departmentId || 'all'}
          onValueChange={(v) => setFilters({ ...filters, departmentId: v === 'all' ? undefined : v })}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Departments" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {departments?.map(dept => (
              <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      {data?.summary && filters.payrollRunId && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Total</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={cn("font-bold", getResponsiveFontSize(formatCurrency(data.summary.currentTotalGross)))}>{formatCurrency(data.summary.currentTotalGross)}</div>
              <p className="text-xs text-muted-foreground">{data.summary.currentHeadcount} employees</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Previous Total</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={cn("font-bold", getResponsiveFontSize(formatCurrency(data.summary.previousTotalGross)))}>{formatCurrency(data.summary.previousTotalGross)}</div>
              <p className="text-xs text-muted-foreground">{data.summary.previousHeadcount} employees</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Delta Amount</CardTitle>
              {data.summary.deltaAmount >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
            </CardHeader>
            <CardContent>
              <div className={cn("font-bold", getResponsiveFontSize(formatCurrency(data.summary.deltaAmount)), data.summary.deltaAmount >= 0 ? 'text-green-600' : 'text-red-600')}>
                {formatCurrency(data.summary.deltaAmount)}
              </div>
              <p className={cn("text-sm", data.summary.deltaPercent >= 0 ? 'text-green-600' : 'text-red-600')}>
                {formatPercent(data.summary.deltaPercent)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Headcount Change</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={cn("font-bold", getResponsiveFontSize(`${data.summary.headcountDelta >= 0 ? '+' : ''}${data.summary.headcountDelta}`), data.summary.headcountDelta >= 0 ? 'text-green-600' : 'text-red-600')}>
                {data.summary.headcountDelta >= 0 ? '+' : ''}{data.summary.headcountDelta}
              </div>
              <p className="text-xs text-muted-foreground">net change</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Variance Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {data?.records?.length || 0} Employees with Changes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!filters.payrollRunId ? (
            <div className="text-center py-8 text-muted-foreground">
              Select a current payroll run to view variance analysis
            </div>
          ) : isLoading ? (
            <div className="flex items-center justify-center h-32">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8"></TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Employee Name</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead className="text-right">Previous (BHD)</TableHead>
                    <TableHead className="text-right">Current (BHD)</TableHead>
                    <TableHead className="text-right">Delta (BHD)</TableHead>
                    <TableHead className="text-right">Delta %</TableHead>
                    <TableHead>Reasons</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.records?.map((record: PayrollVarianceRecord) => (
                    <Fragment key={record.employeeId}>
                      <TableRow className="cursor-pointer hover:bg-muted/50" onClick={() => toggleRow(record.employeeId)}>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="p-0 h-6 w-6"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleRow(record.employeeId);
                            }}
                          >
                            {expandedRows.has(record.employeeId) ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </Button>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{record.employeeCode}</TableCell>
                        <TableCell className="font-medium">{record.employeeName}</TableCell>
                        <TableCell>{record.department}</TableCell>
                        <TableCell className="text-right">{formatCurrency(record.previousGrossPay)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(record.currentGrossPay)}</TableCell>
                        <TableCell className={`text-right font-medium ${record.deltaBHD >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(record.deltaBHD)}
                        </TableCell>
                        <TableCell className={`text-right ${record.deltaPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatPercent(record.deltaPercent)}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {record.reasons.map((reason, idx) => (
                              <Badge key={idx} variant={reasonLabels[reason].variant}>
                                {reasonLabels[reason].label}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                      {expandedRows.has(record.employeeId) && (
                        <TableRow className="bg-muted/30">
                          <TableCell colSpan={9}>
                            <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div>
                                <p className="text-sm font-medium">Basic Salary</p>
                                <p className="text-sm text-muted-foreground">
                                  {formatCurrency(record.details.previousBasic)} → {formatCurrency(record.details.currentBasic)}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm font-medium">Allowances</p>
                                <p className="text-sm text-muted-foreground">
                                  {formatCurrency(record.details.previousAllowances)} → {formatCurrency(record.details.currentAllowances)}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm font-medium">Deductions</p>
                                <p className="text-sm text-muted-foreground">
                                  {formatCurrency(record.details.previousDeductions)} → {formatCurrency(record.details.currentDeductions)}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm font-medium">Loan Installment</p>
                                <p className="text-sm text-muted-foreground">
                                  {formatCurrency(record.details.previousLoanInstallment)} → {formatCurrency(record.details.currentLoanInstallment)}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </Fragment>
                  ))}
                  {(!data?.records || data.records.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                        No variance detected between the selected periods.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
