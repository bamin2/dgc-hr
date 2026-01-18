import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/dashboard';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RefreshCw, Users, DollarSign, Calendar, CreditCard, Shield, FileText, ArrowLeft } from 'lucide-react';
import { ExportButton } from '@/components/reports';
import { ReportsOverviewDashboard } from '@/components/reports/overview';
import { useToast } from '@/hooks/use-toast';
import { useRole } from '@/contexts/RoleContext';
import { useTimeToFirstData } from '@/lib/perf';

// Production Report Components
import { PayrollRunSummaryReport, PayrollDetailedReport, PayslipRegisterReport } from '@/components/reports/payroll';
import { LeaveBalanceReport, LeaveRequestsReport } from '@/components/reports/leave';
import { LoanSummaryReport, LoanInstallmentsReport } from '@/components/reports/loans';
import { GosiContributionReport } from '@/components/reports/compliance';
import { EmployeeMasterReport } from '@/components/reports/employees';
import { SalaryDistributionReport, SalaryChangeHistoryReport } from '@/components/reports/salary';
import { ReportCatalogTable } from '@/components/reports/ReportCatalogTable';
import { ExportFormat } from '@/types/reports';

// Report sub-views for each category
type PayrollReportView = 'list' | 'payroll-run-summary' | 'payroll-detailed' | 'payslip-register';
type SalaryReportView = 'list' | 'salary-distribution' | 'salary-change-history';
type LeaveReportView = 'list' | 'leave-balance' | 'leave-requests';
type LoanReportView = 'list' | 'loan-summary' | 'loan-installments';
type ComplianceReportView = 'list' | 'gosi-contribution';
type EmployeeReportView = 'list' | 'employee-master';

const Reports = () => {
  const { toast } = useToast();
  const { hasRole, canAccessManagement, isLoading: roleLoading } = useRole();
  
  // Track time to first data
  useTimeToFirstData('Reports', roleLoading);
  
  const [activeTab, setActiveTab] = useState('overview');
  
  // Sub-views for each category
  const [payrollView, setPayrollView] = useState<PayrollReportView>('list');
  const [salaryView, setSalaryView] = useState<SalaryReportView>('list');
  const [leaveView, setLeaveView] = useState<LeaveReportView>('list');
  const [loanView, setLoanView] = useState<LoanReportView>('list');
  const [complianceView, setComplianceView] = useState<ComplianceReportView>('list');
  const [employeeView, setEmployeeView] = useState<EmployeeReportView>('list');

  // Role-based access control - require HR or Admin
  const canAccessReports = hasRole('hr') || hasRole('admin') || canAccessManagement;
  
  // Show loading state while checking roles
  if (roleLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }
  
  // Redirect if user doesn't have access
  if (!canAccessReports) {
    return <Navigate to="/" replace />;
  }

  const handleExport = (format: 'csv' | 'pdf' | 'json') => {
    toast({
      title: 'Export Started',
      description: `Generating ${activeTab} report as ${format.toUpperCase()}...`
    });
  };

  const handleOpenReport = (reportId: string) => {
    // Navigate to the appropriate tab and view based on report ID
    if (reportId.startsWith('payroll')) {
      setActiveTab('payroll');
      setPayrollView(reportId as PayrollReportView);
    } else if (reportId.startsWith('salary')) {
      setActiveTab('salary');
      setSalaryView(reportId as SalaryReportView);
    } else if (reportId.startsWith('leave')) {
      setActiveTab('leave');
      setLeaveView(reportId as LeaveReportView);
    } else if (reportId.startsWith('loan')) {
      setActiveTab('loans');
      setLoanView(reportId as LoanReportView);
    } else if (reportId === 'gosi-contribution') {
      setActiveTab('compliance');
      setComplianceView('gosi-contribution');
    } else if (reportId === 'employee-master') {
      setActiveTab('employees');
      setEmployeeView('employee-master');
    }
  };

  const handleExportReport = (reportId: string, format: ExportFormat) => {
    // Navigate to report and trigger export
    handleOpenReport(reportId);
    toast({
      title: 'Export Started',
      description: `Generating ${reportId.replace(/-/g, ' ')} as ${format.toUpperCase()}...`,
    });
  };

  // Reset view when changing tabs
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // Reset all sub-views to list when switching tabs
    setPayrollView('list');
    setSalaryView('list');
    setLeaveView('list');
    setLoanView('list');
    setComplianceView('list');
    setEmployeeView('list');
  };

  // Render back button for sub-views
  const renderBackButton = (onBack: () => void) => (
    <Button variant="ghost" onClick={onBack} className="mb-4">
      <ArrowLeft className="h-4 w-4 mr-2" />
      Back to Reports List
    </Button>
  );

  // Report list card component
  const ReportCard = ({ 
    title, 
    description, 
    onClick 
  }: { 
    title: string; 
    description: string; 
    onClick: () => void;
  }) => (
    <Card 
      className="cursor-pointer hover:border-primary/50 transition-colors"
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <PageHeader
          title="Reports"
          subtitle="Analytics and insights for your organization"
          actions={<ExportButton onExport={handleExport} />}
        />

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="w-full sm:w-auto overflow-x-auto flex-wrap h-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="payroll" className="gap-1">
              <DollarSign className="h-3.5 w-3.5" />
              Payroll
            </TabsTrigger>
            <TabsTrigger value="salary" className="gap-1">
              <DollarSign className="h-3.5 w-3.5" />
              Salary
            </TabsTrigger>
            <TabsTrigger value="leave" className="gap-1">
              <Calendar className="h-3.5 w-3.5" />
              Leave
            </TabsTrigger>
            <TabsTrigger value="loans" className="gap-1">
              <CreditCard className="h-3.5 w-3.5" />
              Loans
            </TabsTrigger>
            <TabsTrigger value="compliance" className="gap-1">
              <Shield className="h-3.5 w-3.5" />
              Compliance
            </TabsTrigger>
            <TabsTrigger value="employees" className="gap-1">
              <Users className="h-3.5 w-3.5" />
              Employees
            </TabsTrigger>
            <TabsTrigger value="all-reports" className="gap-1">
              <FileText className="h-3.5 w-3.5" />
              All Reports
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 mt-6">
            <ReportsOverviewDashboard onNavigate={handleOpenReport} />
          </TabsContent>

          {/* Payroll Tab */}
          <TabsContent value="payroll" className="space-y-6 mt-6">
            {payrollView === 'list' ? (
              <div className="grid gap-4 md:grid-cols-3">
                <ReportCard
                  title="Payroll Run Summary"
                  description="Summary of payroll runs with totals for gross, deductions, net pay, and GOSI contributions"
                  onClick={() => setPayrollView('payroll-run-summary')}
                />
                <ReportCard
                  title="Payroll Detailed Report"
                  description="Per-employee breakdown of salary components, allowances, deductions, and net pay"
                  onClick={() => setPayrollView('payroll-detailed')}
                />
                <ReportCard
                  title="Payslip Register"
                  description="Track payslip issuance status for each employee per payroll run"
                  onClick={() => setPayrollView('payslip-register')}
                />
              </div>
            ) : (
              <>
                {renderBackButton(() => setPayrollView('list'))}
                {payrollView === 'payroll-run-summary' && <PayrollRunSummaryReport />}
                {payrollView === 'payroll-detailed' && <PayrollDetailedReport />}
                {payrollView === 'payslip-register' && <PayslipRegisterReport />}
              </>
            )}
          </TabsContent>

          {/* Salary Tab */}
          <TabsContent value="salary" className="space-y-6 mt-6">
            {salaryView === 'list' ? (
              <div className="grid gap-4 md:grid-cols-2">
                <ReportCard
                  title="Salary Distribution"
                  description="Salary statistics including average, median, and ranges grouped by department and location"
                  onClick={() => setSalaryView('salary-distribution')}
                />
                <ReportCard
                  title="Salary Change History"
                  description="Historical record of all salary changes with before/after values and change reasons"
                  onClick={() => setSalaryView('salary-change-history')}
                />
              </div>
            ) : (
              <>
                {renderBackButton(() => setSalaryView('list'))}
                {salaryView === 'salary-distribution' && <SalaryDistributionReport />}
                {salaryView === 'salary-change-history' && <SalaryChangeHistoryReport />}
              </>
            )}
          </TabsContent>

          {/* Leave Tab */}
          <TabsContent value="leave" className="space-y-6 mt-6">
            {leaveView === 'list' ? (
              <div className="grid gap-4 md:grid-cols-2">
                <ReportCard
                  title="Leave Balance Report"
                  description="Current leave balances showing entitled, taken, pending, and remaining days per employee"
                  onClick={() => setLeaveView('leave-balance')}
                />
                <ReportCard
                  title="Leave Requests Report"
                  description="All leave requests with approval workflow status and outcomes"
                  onClick={() => setLeaveView('leave-requests')}
                />
              </div>
            ) : (
              <>
                {renderBackButton(() => setLeaveView('list'))}
                {leaveView === 'leave-balance' && <LeaveBalanceReport />}
                {leaveView === 'leave-requests' && <LeaveRequestsReport />}
              </>
            )}
          </TabsContent>

          {/* Loans Tab */}
          <TabsContent value="loans" className="space-y-6 mt-6">
            {loanView === 'list' ? (
              <div className="grid gap-4 md:grid-cols-2">
                <ReportCard
                  title="Loan Summary Report"
                  description="Overview of all employee loans with original amounts, outstanding balances, and payment status"
                  onClick={() => setLoanView('loan-summary')}
                />
                <ReportCard
                  title="Loan Installments Report"
                  description="Monthly breakdown of loan installments with payment status and deduction method"
                  onClick={() => setLoanView('loan-installments')}
                />
              </div>
            ) : (
              <>
                {renderBackButton(() => setLoanView('list'))}
                {loanView === 'loan-summary' && <LoanSummaryReport />}
                {loanView === 'loan-installments' && <LoanInstallmentsReport />}
              </>
            )}
          </TabsContent>

          {/* Compliance Tab */}
          <TabsContent value="compliance" className="space-y-6 mt-6">
            {complianceView === 'list' ? (
              <div className="grid gap-4 md:grid-cols-2">
                <ReportCard
                  title="GOSI Contribution Report"
                  description="Employee and employer GOSI contributions by nationality and location"
                  onClick={() => setComplianceView('gosi-contribution')}
                />
              </div>
            ) : (
              <>
                {renderBackButton(() => setComplianceView('list'))}
                {complianceView === 'gosi-contribution' && <GosiContributionReport />}
              </>
            )}
          </TabsContent>

          {/* Employees Tab */}
          <TabsContent value="employees" className="space-y-6 mt-6">
            {employeeView === 'list' ? (
              <div className="grid gap-4 md:grid-cols-2">
                <ReportCard
                  title="Employee Master Report"
                  description="Complete employee directory with department, position, location, and employment details"
                  onClick={() => setEmployeeView('employee-master')}
                />
              </div>
            ) : (
              <>
                {renderBackButton(() => setEmployeeView('list'))}
                {employeeView === 'employee-master' && <EmployeeMasterReport />}
              </>
            )}
          </TabsContent>

          {/* All Reports Tab (Catalog) */}
          <TabsContent value="all-reports" className="space-y-6 mt-6">
            <ReportCatalogTable 
              onViewReport={handleOpenReport} 
              onExportReport={handleExportReport}
            />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Reports;
