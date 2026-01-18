import { useState, Fragment } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RefreshCw, Download, ChevronDown, ChevronRight, DollarSign, Users, Building2, Briefcase } from 'lucide-react';
import { useCTCReport, usePayrollRunsForLocation } from '@/hooks/reports/useCostReports';
import { useWorkLocationsFilter, useDepartmentsFilter } from '@/hooks/reports/useReportFilters';
import { CostReportFilters, CTCRecord } from '@/types/reports';
import { CurrencyConversionTooltip } from '../CurrencyConversionTooltip';
import { exportToCSV, exportToPDF, generateReportFilename } from '@/utils/reportExport';
import { format, parseISO } from 'date-fns';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-BH', {
    style: 'currency',
    currency: 'BHD',
    minimumFractionDigits: 3,
  }).format(amount);
};

export function CTCReport() {
  const [filters, setFilters] = useState<CostReportFilters>({});
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // Fetch locations and departments for filters
  const { data: locations } = useWorkLocationsFilter('ctc');
  const { data: departments } = useDepartmentsFilter('ctc');

  // Fetch payroll runs for selected location
  const { data: payrollRuns } = usePayrollRunsForLocation(filters.locationId);

  // Fetch CTC report data
  const { data, isLoading, refetch } = useCTCReport(filters);

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
    const columns = [
      { key: 'employeeCode', header: 'Employee Code' },
      { key: 'employeeName', header: 'Employee Name' },
      { key: 'department', header: 'Department' },
      { key: 'position', header: 'Job Title' },
      { key: 'basicSalary', header: 'Basic Salary (BHD)', format: 'currency' as const },
      { key: 'allowancesTotal', header: 'Allowances (BHD)', format: 'currency' as const },
      { key: 'grossPay', header: 'Gross Pay (BHD)', format: 'currency' as const },
      { key: 'employerGosi', header: 'Employer GOSI (BHD)', format: 'currency' as const },
      { key: 'employerBenefitsCost', header: 'Benefits Cost (BHD)', format: 'currency' as const },
      { key: 'ctcTotal', header: 'CTC Total (BHD)', format: 'currency' as const },
    ];
    exportToCSV(data.records as unknown as Record<string, unknown>[], columns, generateReportFilename('CTC Report', 'csv'));
  };

  const handleExportPDF = async () => {
    if (!data?.records) return;
    const columns = [
      { key: 'employeeCode', header: 'Code' },
      { key: 'employeeName', header: 'Name' },
      { key: 'department', header: 'Dept' },
      { key: 'grossPay', header: 'Gross (BHD)', format: 'currency' as const },
      { key: 'employerGosi', header: 'GOSI (BHD)', format: 'currency' as const },
      { key: 'ctcTotal', header: 'CTC (BHD)', format: 'currency' as const },
    ];
    await exportToPDF({
      title: 'Cost-to-Company Report',
      data: data.records as unknown as Record<string, unknown>[],
      columns,
      filename: generateReportFilename('CTC Report', 'pdf'),
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Cost-to-Company Report</h2>
          <p className="text-muted-foreground">
            True employer cost per employee including gross pay, GOSI, and benefits
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
          value={filters.locationId || ''}
          onValueChange={(v) => setFilters({ ...filters, locationId: v || undefined, payrollRunId: undefined })}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Locations" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Locations</SelectItem>
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
            <SelectValue placeholder="Latest Payroll Run" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Latest Payroll Run</SelectItem>
            {payrollRuns?.map(run => (
              <SelectItem key={run.id} value={run.id}>
                {format(parseISO(run.pay_period_start), 'MMM yyyy')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.departmentId || ''}
          onValueChange={(v) => setFilters({ ...filters, departmentId: v || undefined })}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Departments" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Departments</SelectItem>
            {departments?.map(dept => (
              <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.status || ''}
          onValueChange={(v) => setFilters({ ...filters, status: v || undefined })}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="on_leave">On Leave</SelectItem>
            <SelectItem value="probation">Probation</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      {data?.summary && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total CTC</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(data.summary.totalCTC)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Gross Pay</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(data.summary.totalGrossPay)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Employer GOSI</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(data.summary.totalEmployerGosi)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Benefits Cost</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(data.summary.totalEmployerBenefitsCost)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Employees</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.summary.employeeCount}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {data?.records?.length || 0} {(data?.records?.length || 0) === 1 ? 'Employee' : 'Employees'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
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
                    <TableHead>Position</TableHead>
                    <TableHead className="text-right">Basic (BHD)</TableHead>
                    <TableHead className="text-right">Allowances (BHD)</TableHead>
                    <TableHead className="text-right">Gross (BHD)</TableHead>
                    <TableHead className="text-right">GOSI (BHD)</TableHead>
                    <TableHead className="text-right">Benefits (BHD)</TableHead>
                    <TableHead className="text-right">CTC (BHD)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.records?.map((record: CTCRecord) => (
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
                        <TableCell className="font-medium">
                          {record.employeeName}
                          {record.wasConverted && record.conversionInfo && (
                            <CurrencyConversionTooltip 
                              fromCurrency={record.conversionInfo.fromCurrency}
                              rate={record.conversionInfo.rate}
                              effectiveDate={record.conversionInfo.effectiveDate}
                            />
                          )}
                        </TableCell>
                        <TableCell>{record.department}</TableCell>
                        <TableCell>{record.position}</TableCell>
                        <TableCell className="text-right">{formatCurrency(record.basicSalary)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(record.allowancesTotal)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(record.grossPay)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(record.employerGosi)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(record.employerBenefitsCost)}</TableCell>
                        <TableCell className="text-right font-bold">{formatCurrency(record.ctcTotal)}</TableCell>
                      </TableRow>
                      {expandedRows.has(record.employeeId) && (
                        <TableRow className="bg-muted/30">
                          <TableCell colSpan={11}>
                            <div className="p-4 space-y-3">
                              <h4 className="font-medium text-sm">Allowances Breakdown</h4>
                              {record.allowancesBreakdown.length > 0 ? (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                  {record.allowancesBreakdown.map((allowance, idx) => (
                                    <div key={idx} className="flex justify-between text-sm">
                                      <span className="text-muted-foreground">{allowance.name}:</span>
                                      <span>{formatCurrency(allowance.amount)}</span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-sm text-muted-foreground">No allowances</p>
                              )}
                              {record.wasConverted && record.conversionInfo && (
                                <p className="text-xs text-muted-foreground mt-2">
                                  Note: Values converted from {record.conversionInfo.fromCurrency} to BHD 
                                  using rate {record.conversionInfo.rate.toFixed(4)}
                                </p>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </Fragment>
                  ))}
                  {(!data?.records || data.records.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={11} className="text-center py-8 text-muted-foreground">
                        No data available. Select a payroll run to view CTC breakdown.
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
