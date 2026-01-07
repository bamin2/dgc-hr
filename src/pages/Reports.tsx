import { useState } from 'react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RefreshCw } from 'lucide-react';
import {
  ReportsMetrics,
  AttendanceChart,
  PayrollChart,
  DepartmentTable,
  LeaveChart,
  ReportsTable,
  ReportsFilters,
  ExportButton,
  SalaryMetricsCards,
  SalaryDistributionChart,
  SalaryTrendChart,
  DepartmentSalaryTable,
  SalaryChangeTypeChart,
} from '@/components/reports';
import { useReportAnalytics, reportsList, type ReportSummary } from '@/hooks/useReportAnalytics';
import { useToast } from '@/hooks/use-toast';
import { DateRange } from 'react-day-picker';
import { useSalaryAnalytics } from '@/hooks/useSalaryAnalytics';

type ReportType = 'attendance' | 'payroll' | 'benefits' | 'employees' | 'leave';
type ReportPeriod = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';

const Reports = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<ReportType | 'all'>('all');
  const [periodFilter, setPeriodFilter] = useState<ReportPeriod>('monthly');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  // Data from hooks
  const { 
    stats, 
    attendanceData, 
    payrollData, 
    departmentStats, 
    leaveData,
    refetch 
  } = useReportAnalytics();
  
  // Salary Analytics
  const salaryAnalytics = useSalaryAnalytics();

  // Filter reports
  const filteredReports = reportsList.filter(report => {
    const matchesSearch = report.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || report.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleViewReport = (reportId: string) => {
    const report = reportsList.find(r => r.id === reportId);
    if (report) {
      // Navigate to appropriate tab based on report type
      setActiveTab(report.type === 'employees' ? 'employees' : report.type);
      toast({
        title: 'Report Loaded',
        description: `Viewing ${report.name}`
      });
    }
  };

  const handleDownloadReport = (reportId: string) => {
    const report = reportsList.find(r => r.id === reportId);
    toast({
      title: 'Export Started',
      description: `Generating ${report?.name || 'report'} export...`
    });
  };

  const handleExport = (format: 'csv' | 'pdf' | 'json') => {
    toast({
      title: 'Export Started',
      description: `Generating ${activeTab} report as ${format.toUpperCase()}...`
    });
  };

  const handleRefresh = () => {
    refetch();
    toast({
      title: 'Data Refreshed',
      description: 'Report data has been updated.'
    });
  };

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto overflow-x-hidden">
        <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">Reports</h1>
              <p className="text-muted-foreground text-sm sm:text-base">Analytics and insights for your organization</p>
            </div>
            <div className="flex gap-2 sm:gap-3">
              <Button variant="outline" onClick={handleRefresh} size="sm" className="sm:size-default">
                <RefreshCw className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
              <ExportButton onExport={handleExport} />
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full sm:w-auto overflow-x-auto flex-wrap h-auto">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="attendance">Attendance</TabsTrigger>
              <TabsTrigger value="payroll">Payroll</TabsTrigger>
              <TabsTrigger value="salary">Salary</TabsTrigger>
              <TabsTrigger value="leave">Leave</TabsTrigger>
              <TabsTrigger value="reports">All Reports</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6 mt-6">
              <ReportsMetrics stats={stats} />
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AttendanceChart data={attendanceData.slice(-14)} />
                <PayrollChart data={payrollData} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <DepartmentTable data={departmentStats} />
                </div>
                <LeaveChart data={leaveData} />
              </div>
            </TabsContent>

            {/* Attendance Tab */}
            <TabsContent value="attendance" className="space-y-6 mt-6">
              <div className="flex items-center justify-between">
                <ReportsFilters
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  typeFilter="attendance"
                  onTypeChange={() => {}}
                  periodFilter={periodFilter}
                  onPeriodChange={setPeriodFilter}
                  dateRange={dateRange}
                  onDateRangeChange={setDateRange}
                  showDateRange
                />
              </div>
              
              <AttendanceChart data={attendanceData} />
              
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="text-base font-medium">Attendance Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                      <p className="text-2xl font-bold text-emerald-600">
                        {attendanceData.reduce((sum, d) => sum + d.present, 0)}
                      </p>
                      <p className="text-sm text-muted-foreground">Total Present</p>
                    </div>
                    <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                      <p className="text-2xl font-bold text-red-600">
                        {attendanceData.reduce((sum, d) => sum + d.absent, 0)}
                      </p>
                      <p className="text-sm text-muted-foreground">Total Absent</p>
                    </div>
                    <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                      <p className="text-2xl font-bold text-orange-600">
                        {attendanceData.reduce((sum, d) => sum + d.late, 0)}
                      </p>
                      <p className="text-sm text-muted-foreground">Late Arrivals</p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">
                        {Math.round(attendanceData.reduce((sum, d) => sum + d.attendanceRate, 0) / attendanceData.length)}%
                      </p>
                      <p className="text-sm text-muted-foreground">Avg Attendance</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Payroll Tab */}
            <TabsContent value="payroll" className="space-y-6 mt-6">
              <div className="flex items-center justify-between">
                <ReportsFilters
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  typeFilter="payroll"
                  onTypeChange={() => {}}
                  periodFilter={periodFilter}
                  onPeriodChange={setPeriodFilter}
                />
              </div>
              
              <PayrollChart data={payrollData} />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-border/50">
                  <CardContent className="p-6">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Total Gross Pay (YTD)</p>
                      <p className="text-3xl font-bold">
                        ${payrollData.reduce((sum, d) => sum + d.grossPay, 0).toLocaleString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-border/50">
                  <CardContent className="p-6">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Total Taxes (YTD)</p>
                      <p className="text-3xl font-bold text-blue-600">
                        ${payrollData.reduce((sum, d) => sum + d.taxes, 0).toLocaleString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-border/50">
                  <CardContent className="p-6">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Total Net Pay (YTD)</p>
                      <p className="text-3xl font-bold text-emerald-600">
                        ${payrollData.reduce((sum, d) => sum + d.netPay, 0).toLocaleString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <DepartmentTable data={departmentStats} />
            </TabsContent>

            {/* Salary Tab */}
            <TabsContent value="salary" className="space-y-6 mt-6">
              <SalaryMetricsCards stats={salaryAnalytics.stats} isLoading={salaryAnalytics.isLoading} />
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SalaryDistributionChart data={salaryAnalytics.salaryDistribution} isLoading={salaryAnalytics.isLoading} />
                <SalaryChangeTypeChart data={salaryAnalytics.changeTypeBreakdown} isLoading={salaryAnalytics.isLoading} />
              </div>

              <SalaryTrendChart data={salaryAnalytics.salaryTrends} isLoading={salaryAnalytics.isLoading} />
              
              <DepartmentSalaryTable data={salaryAnalytics.departmentSalaries} isLoading={salaryAnalytics.isLoading} />
            </TabsContent>

            {/* Leave Tab */}
            <TabsContent value="leave" className="space-y-6 mt-6">
              <div className="flex items-center justify-between">
                <ReportsFilters
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  typeFilter="leave"
                  onTypeChange={() => {}}
                  periodFilter={periodFilter}
                  onPeriodChange={setPeriodFilter}
                />
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <LeaveChart data={leaveData} />
                
                <Card className="border-border/50">
                  <CardHeader>
                    <CardTitle className="text-base font-medium">Leave Statistics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {leaveData.map((leave) => (
                        <div key={leave.type} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                          <div>
                            <p className="font-medium">{leave.type}</p>
                            <p className="text-sm text-muted-foreground">
                              {leave.taken} taken, {leave.remaining} remaining
                            </p>
                          </div>
                          {leave.pending > 0 && (
                            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
                              {leave.pending} pending
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="border-border/50">
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                      <p className="text-3xl font-bold text-blue-600">
                        {leaveData.reduce((sum, l) => sum + l.taken, 0)}
                      </p>
                      <p className="text-sm text-muted-foreground">Total Days Taken</p>
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-emerald-600">
                        {leaveData.reduce((sum, l) => sum + l.remaining, 0)}
                      </p>
                      <p className="text-sm text-muted-foreground">Days Remaining</p>
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-amber-600">
                        {leaveData.reduce((sum, l) => sum + l.pending, 0)}
                      </p>
                      <p className="text-sm text-muted-foreground">Pending Requests</p>
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-purple-600">
                        {Math.round((leaveData.reduce((sum, l) => sum + l.taken, 0) / 
                          (leaveData.reduce((sum, l) => sum + l.taken + l.remaining, 0) || 1)) * 100)}%
                      </p>
                      <p className="text-sm text-muted-foreground">Utilization Rate</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* All Reports Tab */}
            <TabsContent value="reports" className="space-y-6 mt-6">
              <ReportsFilters
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                typeFilter={typeFilter}
                onTypeChange={setTypeFilter}
                periodFilter={periodFilter}
                onPeriodChange={setPeriodFilter}
              />
              
              <ReportsTable 
                reports={filteredReports}
                onView={handleViewReport}
                onDownload={handleDownloadReport}
              />
            </TabsContent>
          </Tabs>
        </div>
        </main>
      </div>
    </div>
  );
};

export default Reports;
