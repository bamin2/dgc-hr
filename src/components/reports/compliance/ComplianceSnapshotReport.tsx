import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RefreshCw, Download, FileWarning, Clock, AlertTriangle, ShieldAlert } from 'lucide-react';
import { useComplianceSnapshotReport } from '@/hooks/reports/useComplianceSnapshotReport';
import { useWorkLocationsFilter, useDepartmentsFilter } from '@/hooks/reports/useReportFilters';
import { CostReportFilters } from '@/types/reports';
import { exportToCSV, exportToPDF, generateReportFilename } from '@/utils/reportExport';
import { format, parseISO } from 'date-fns';

export function ComplianceSnapshotReport() {
  const [filters, setFilters] = useState<CostReportFilters>({ expiryWindowDays: 30 });
  const [activeTab, setActiveTab] = useState('missing');

  // Fetch locations and departments for filters
  const { data: locations } = useWorkLocationsFilter('compliance');
  const { data: departments } = useDepartmentsFilter('compliance');

  // Fetch compliance snapshot data
  const { data, isLoading, refetch } = useComplianceSnapshotReport(filters);

  const handleExportMissingDocs = () => {
    if (!data?.missingDocs) return;
    const columns = [
      { key: 'employeeCode', header: 'Employee Code' },
      { key: 'employeeName', header: 'Employee Name' },
      { key: 'department', header: 'Department' },
      { key: 'location', header: 'Location' },
      { key: 'missingDocumentType', header: 'Missing Document' },
    ];
    exportToCSV(data.missingDocs as unknown as Record<string, unknown>[], columns, generateReportFilename('Missing Documents', 'csv'));
  };

  const handleExportExpiredDocs = () => {
    if (!data?.expiredDocs) return;
    const columns = [
      { key: 'employeeCode', header: 'Employee Code' },
      { key: 'employeeName', header: 'Employee Name' },
      { key: 'department', header: 'Department' },
      { key: 'documentType', header: 'Document Type' },
      { key: 'documentName', header: 'Document Name' },
      { key: 'expiryDate', header: 'Expired On' },
      { key: 'daysPastExpiry', header: 'Days Overdue' },
    ];
    exportToCSV(data.expiredDocs as unknown as Record<string, unknown>[], columns, generateReportFilename('Expired Documents', 'csv'));
  };

  const handleExportExpiringDocs = () => {
    if (!data?.expiringDocs) return;
    const columns = [
      { key: 'employeeCode', header: 'Employee Code' },
      { key: 'employeeName', header: 'Employee Name' },
      { key: 'department', header: 'Department' },
      { key: 'documentType', header: 'Document Type' },
      { key: 'documentName', header: 'Document Name' },
      { key: 'expiryDate', header: 'Expires On' },
      { key: 'daysUntilExpiry', header: 'Days Remaining' },
    ];
    exportToCSV(data.expiringDocs as unknown as Record<string, unknown>[], columns, generateReportFilename('Expiring Documents', 'csv'));
  };

  const handleExportGosiMismatches = () => {
    if (!data?.gosiMismatches) return;
    const columns = [
      { key: 'employeeCode', header: 'Employee Code' },
      { key: 'employeeName', header: 'Employee Name' },
      { key: 'department', header: 'Department' },
      { key: 'location', header: 'Location' },
      { key: 'issue', header: 'Issue' },
    ];
    exportToCSV(data.gosiMismatches as unknown as Record<string, unknown>[], columns, generateReportFilename('GOSI Mismatches', 'csv'));
  };

  const handleExportAllPDF = async () => {
    if (!data) return;
    const allIssues = [
      ...data.missingDocs.map(d => ({ type: 'Missing Document', employee: d.employeeName, detail: d.missingDocumentType })),
      ...data.expiredDocs.map(d => ({ type: 'Expired Document', employee: d.employeeName, detail: `${d.documentType} (${d.daysPastExpiry} days overdue)` })),
      ...data.expiringDocs.map(d => ({ type: 'Expiring Soon', employee: d.employeeName, detail: `${d.documentType} (${d.daysUntilExpiry} days)` })),
      ...data.gosiMismatches.map(d => ({ type: 'GOSI Mismatch', employee: d.employeeName, detail: d.issue })),
    ];
    const columns = [
      { key: 'type', header: 'Issue Type' },
      { key: 'employee', header: 'Employee' },
      { key: 'detail', header: 'Details' },
    ];
    await exportToPDF({
      title: 'Compliance Snapshot Report',
      data: allIssues.slice(0, 50),
      columns,
      filename: generateReportFilename('Compliance Snapshot', 'pdf'),
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Compliance Snapshot</h2>
          <p className="text-muted-foreground">
            Identify missing documents, expired IDs, and GOSI registration issues
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="default" size="sm" onClick={handleExportAllPDF} disabled={!data}>
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 p-4 bg-muted/30 rounded-lg border">
        <Select
          value={filters.locationId || 'all'}
          onValueChange={(v) => setFilters({ ...filters, locationId: v === 'all' ? undefined : v })}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Locations" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Locations</SelectItem>
            {locations?.map(loc => (
              <SelectItem key={loc.id} value={loc.id}>{loc.name}</SelectItem>
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

        <Select
          value={filters.status || 'active'}
          onValueChange={(v) => setFilters({ ...filters, status: v })}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="on_leave">On Leave</SelectItem>
            <SelectItem value="probation">Probation</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={String(filters.expiryWindowDays || 30)}
          onValueChange={(v) => setFilters({ ...filters, expiryWindowDays: parseInt(v) })}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Expiry Window" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="30">Expiring in 30 days</SelectItem>
            <SelectItem value="60">Expiring in 60 days</SelectItem>
            <SelectItem value="90">Expiring in 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* KPI Cards */}
      {data?.summary && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className={data.summary.missingDocsCount > 0 ? 'border-red-200 bg-red-50/50' : ''}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Missing Documents</CardTitle>
              <FileWarning className={`h-4 w-4 ${data.summary.missingDocsCount > 0 ? 'text-red-500' : 'text-muted-foreground'}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${data.summary.missingDocsCount > 0 ? 'text-red-600' : ''}`}>
                {data.summary.missingDocsCount}
              </div>
              <p className="text-xs text-muted-foreground">required docs not uploaded</p>
            </CardContent>
          </Card>
          <Card className={data.summary.expiredDocsCount > 0 ? 'border-red-200 bg-red-50/50' : ''}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expired Documents</CardTitle>
              <AlertTriangle className={`h-4 w-4 ${data.summary.expiredDocsCount > 0 ? 'text-red-500' : 'text-muted-foreground'}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${data.summary.expiredDocsCount > 0 ? 'text-red-600' : ''}`}>
                {data.summary.expiredDocsCount}
              </div>
              <p className="text-xs text-muted-foreground">documents past expiry</p>
            </CardContent>
          </Card>
          <Card className={data.summary.expiringDocsCount > 0 ? 'border-amber-200 bg-amber-50/50' : ''}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
              <Clock className={`h-4 w-4 ${data.summary.expiringDocsCount > 0 ? 'text-amber-500' : 'text-muted-foreground'}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${data.summary.expiringDocsCount > 0 ? 'text-amber-600' : ''}`}>
                {data.summary.expiringDocsCount}
              </div>
              <p className="text-xs text-muted-foreground">within {filters.expiryWindowDays || 30} days</p>
            </CardContent>
          </Card>
          <Card className={data.summary.gosiMismatchCount > 0 ? 'border-orange-200 bg-orange-50/50' : ''}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">GOSI Mismatches</CardTitle>
              <ShieldAlert className={`h-4 w-4 ${data.summary.gosiMismatchCount > 0 ? 'text-orange-500' : 'text-muted-foreground'}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${data.summary.gosiMismatchCount > 0 ? 'text-orange-600' : ''}`}>
                {data.summary.gosiMismatchCount}
              </div>
              <p className="text-xs text-muted-foreground">registration issues</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabbed Content */}
      <Card>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <CardHeader className="pb-0">
            <TabsList>
              <TabsTrigger value="missing" className="gap-1">
                Missing Docs
                {data?.summary?.missingDocsCount ? (
                  <Badge variant="destructive" className="ml-1">{data.summary.missingDocsCount}</Badge>
                ) : null}
              </TabsTrigger>
              <TabsTrigger value="expired" className="gap-1">
                Expired
                {data?.summary?.expiredDocsCount ? (
                  <Badge variant="destructive" className="ml-1">{data.summary.expiredDocsCount}</Badge>
                ) : null}
              </TabsTrigger>
              <TabsTrigger value="expiring" className="gap-1">
                Expiring Soon
                {data?.summary?.expiringDocsCount ? (
                  <Badge variant="secondary" className="ml-1">{data.summary.expiringDocsCount}</Badge>
                ) : null}
              </TabsTrigger>
              <TabsTrigger value="gosi" className="gap-1">
                GOSI Issues
                {data?.summary?.gosiMismatchCount ? (
                  <Badge variant="secondary" className="ml-1">{data.summary.gosiMismatchCount}</Badge>
                ) : null}
              </TabsTrigger>
            </TabsList>
          </CardHeader>
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                {/* Missing Documents Tab */}
                <TabsContent value="missing" className="mt-0">
                  <div className="flex justify-end mb-4">
                    <Button variant="outline" size="sm" onClick={handleExportMissingDocs} disabled={!data?.missingDocs?.length}>
                      <Download className="h-4 w-4 mr-2" />
                      Export CSV
                    </Button>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Code</TableHead>
                        <TableHead>Employee Name</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Missing Document</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data?.missingDocs?.map((record, idx) => (
                        <TableRow key={`${record.employeeId}-${record.documentTypeId}-${idx}`}>
                          <TableCell className="font-mono text-sm">{record.employeeCode}</TableCell>
                          <TableCell className="font-medium">{record.employeeName}</TableCell>
                          <TableCell>{record.department}</TableCell>
                          <TableCell>{record.location}</TableCell>
                          <TableCell>
                            <Badge variant="destructive">{record.missingDocumentType}</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                      {(!data?.missingDocs || data.missingDocs.length === 0) && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                            No missing required documents found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TabsContent>

                {/* Expired Documents Tab */}
                <TabsContent value="expired" className="mt-0">
                  <div className="flex justify-end mb-4">
                    <Button variant="outline" size="sm" onClick={handleExportExpiredDocs} disabled={!data?.expiredDocs?.length}>
                      <Download className="h-4 w-4 mr-2" />
                      Export CSV
                    </Button>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Code</TableHead>
                        <TableHead>Employee Name</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Document Type</TableHead>
                        <TableHead>Expired On</TableHead>
                        <TableHead className="text-right">Days Overdue</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data?.expiredDocs?.map((record, idx) => (
                        <TableRow key={`${record.employeeId}-${idx}`}>
                          <TableCell className="font-mono text-sm">{record.employeeCode}</TableCell>
                          <TableCell className="font-medium">{record.employeeName}</TableCell>
                          <TableCell>{record.department}</TableCell>
                          <TableCell>{record.documentType}</TableCell>
                          <TableCell>{format(parseISO(record.expiryDate), 'MMM d, yyyy')}</TableCell>
                          <TableCell className="text-right">
                            <Badge variant="destructive">{record.daysPastExpiry} days</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                      {(!data?.expiredDocs || data.expiredDocs.length === 0) && (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                            No expired documents found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TabsContent>

                {/* Expiring Soon Tab */}
                <TabsContent value="expiring" className="mt-0">
                  <div className="flex justify-end mb-4">
                    <Button variant="outline" size="sm" onClick={handleExportExpiringDocs} disabled={!data?.expiringDocs?.length}>
                      <Download className="h-4 w-4 mr-2" />
                      Export CSV
                    </Button>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Code</TableHead>
                        <TableHead>Employee Name</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Document Type</TableHead>
                        <TableHead>Expires On</TableHead>
                        <TableHead className="text-right">Days Left</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data?.expiringDocs?.map((record, idx) => (
                        <TableRow key={`${record.employeeId}-${idx}`}>
                          <TableCell className="font-mono text-sm">{record.employeeCode}</TableCell>
                          <TableCell className="font-medium">{record.employeeName}</TableCell>
                          <TableCell>{record.department}</TableCell>
                          <TableCell>{record.documentType}</TableCell>
                          <TableCell>{format(parseISO(record.expiryDate), 'MMM d, yyyy')}</TableCell>
                          <TableCell className="text-right">
                            <Badge variant={record.daysUntilExpiry <= 7 ? 'destructive' : 'secondary'}>
                              {record.daysUntilExpiry} days
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                      {(!data?.expiringDocs || data.expiringDocs.length === 0) && (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                            No documents expiring within {filters.expiryWindowDays || 30} days.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TabsContent>

                {/* GOSI Mismatches Tab */}
                <TabsContent value="gosi" className="mt-0">
                  <div className="flex justify-end mb-4">
                    <Button variant="outline" size="sm" onClick={handleExportGosiMismatches} disabled={!data?.gosiMismatches?.length}>
                      <Download className="h-4 w-4 mr-2" />
                      Export CSV
                    </Button>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Code</TableHead>
                        <TableHead>Employee Name</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Issue</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data?.gosiMismatches?.map((record, idx) => (
                        <TableRow key={`${record.employeeId}-${idx}`}>
                          <TableCell className="font-mono text-sm">{record.employeeCode}</TableCell>
                          <TableCell className="font-medium">{record.employeeName}</TableCell>
                          <TableCell>{record.department}</TableCell>
                          <TableCell>{record.location}</TableCell>
                          <TableCell>
                            <span className="text-orange-600">{record.issue}</span>
                          </TableCell>
                        </TableRow>
                      ))}
                      {(!data?.gosiMismatches || data.gosiMismatches.length === 0) && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                            No GOSI registration mismatches found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TabsContent>
              </>
            )}
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
}
