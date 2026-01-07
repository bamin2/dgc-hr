import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar, Header } from '@/components/dashboard';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus } from 'lucide-react';
import {
  AttendanceMetrics,
  AttendanceFilters,
  AttendanceTable,
  LeaveBalanceCard,
  LeaveRequestsTable,
  AttendanceCalendar,
  CorrectionsTab,
  EditAttendanceDialog,
  DeleteAttendanceDialog,
} from '@/components/attendance';
import {
  useCurrentMonthAttendance,
  useTodayAttendance,
  AttendanceRecord,
} from '@/hooks/useAttendanceRecords';
import { useLeaveRequests, usePendingLeaveRequests, LeaveRequestStatus } from '@/hooks/useLeaveRequests';
import { useLeaveBalanceSummary } from '@/hooks/useLeaveBalances';
import { useDepartmentsManagement } from '@/hooks/useDepartmentsManagement';
import { useRole } from '@/contexts/RoleContext';

export default function Attendance() {
  const navigate = useNavigate();
  const { canEditEmployees } = useRole();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all-departments');
  const [statusFilter, setStatusFilter] = useState('all');
  const [leaveStatusFilter, setLeaveStatusFilter] = useState<LeaveRequestStatus | 'all'>('all');

  // Admin dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);

  // Fetch data from database
  const { data: todayAttendance, isLoading: todayLoading } = useTodayAttendance();
  const { data: monthAttendance, isLoading: monthLoading } = useCurrentMonthAttendance();
  const { data: allLeaveRequests, isLoading: requestsLoading } = useLeaveRequests();
  const { data: pendingRequests, isLoading: pendingLoading } = usePendingLeaveRequests();
  const { data: departments } = useDepartmentsManagement();

  // For a logged-in employee, we'd use their employee_id here
  // For now, showing a placeholder since we need to handle this per-user
  const { data: leaveBalances, isLoading: balancesLoading } = useLeaveBalanceSummary(undefined);

  // Filter attendance records
  const filteredAttendance = (monthAttendance || []).filter((record) => {
    const employee = record.employee;
    if (!employee) return false;

    const fullName = `${employee.first_name} ${employee.last_name}`.toLowerCase();
    const matchesSearch = fullName.includes(searchQuery.toLowerCase());
    const matchesDepartment =
      departmentFilter === 'all-departments' || employee.department?.id === departmentFilter;
    const matchesStatus = statusFilter === 'all' || record.status === statusFilter;

    return matchesSearch && matchesDepartment && matchesStatus;
  });

  // Filter leave requests
  const filteredLeaveRequests = (allLeaveRequests || []).filter((request) => {
    const employee = request.employee;
    if (!employee) return false;

    const fullName = `${employee.first_name} ${employee.last_name}`.toLowerCase();
    const matchesSearch = fullName.includes(searchQuery.toLowerCase());
    const matchesStatus = leaveStatusFilter === 'all' || request.status === leaveStatusFilter;

    return matchesSearch && matchesStatus;
  });

  // Admin action handlers
  const handleAddRecord = () => {
    setSelectedRecord(null);
    setEditDialogOpen(true);
  };

  const handleEditRecord = (record: AttendanceRecord) => {
    setSelectedRecord(record);
    setEditDialogOpen(true);
  };

  const handleDeleteRecord = (record: AttendanceRecord) => {
    setSelectedRecord(record);
    setDeleteDialogOpen(true);
  };

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto overflow-x-hidden">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold">Leave & Attendance</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Manage employee attendance and leave requests
              </p>
            </div>
            <div className="flex gap-2">
              {canEditEmployees && (
                <Button variant="outline" onClick={handleAddRecord}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Record
                </Button>
              )}
              <Button
                className="bg-primary hover:bg-primary/90"
                onClick={() => navigate('/attendance/leave/request')}
              >
                <Plus className="h-4 w-4 mr-2" />
                Request Leave
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-muted/50">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="attendance">Attendance</TabsTrigger>
              <TabsTrigger value="leave-requests">Leave Requests</TabsTrigger>
              <TabsTrigger value="corrections">Corrections</TabsTrigger>
              <TabsTrigger value="calendar">Calendar</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <AttendanceMetrics />

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Today's Attendance */}
                <div className="lg:col-span-2">
                  <Card className="border-0 shadow-sm">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base font-semibold">
                          Today's Attendance
                        </CardTitle>
                        <Button
                          variant="link"
                          className="text-primary p-0 h-auto"
                          onClick={() => setActiveTab('attendance')}
                        >
                          View All
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      {todayLoading ? (
                        <div className="p-4 space-y-3">
                          {[1, 2, 3].map((i) => (
                            <Skeleton key={i} className="h-12 w-full" />
                          ))}
                        </div>
                      ) : (
                        <AttendanceTable records={(todayAttendance || []).slice(0, 5)} />
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Leave Balance */}
                <div>
                  <LeaveBalanceCard balances={leaveBalances} isLoading={balancesLoading} />
                </div>
              </div>

              {/* Pending Leave Requests */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold">
                      Pending Leave Requests
                    </CardTitle>
                    <Button
                      variant="link"
                      className="text-primary p-0 h-auto"
                      onClick={() => setActiveTab('leave-requests')}
                    >
                      View All
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {pendingLoading ? (
                    <div className="p-4 space-y-3">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                      ))}
                    </div>
                  ) : (
                    <LeaveRequestsTable requests={(pendingRequests || []).slice(0, 5)} />
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Attendance Tab */}
            <TabsContent value="attendance" className="space-y-6">
              <AttendanceFilters
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                departmentFilter={departmentFilter}
                onDepartmentChange={setDepartmentFilter}
                statusFilter={statusFilter}
                onStatusChange={setStatusFilter}
              />
              {monthLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : (
                <AttendanceTable
                  records={filteredAttendance.slice(0, 20)}
                  showActions={canEditEmployees}
                  onEdit={handleEditRecord}
                  onDelete={handleDeleteRecord}
                />
              )}
            </TabsContent>

            {/* Leave Requests Tab */}
            <TabsContent value="leave-requests" className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-3">
                <Select
                  value={leaveStatusFilter}
                  onValueChange={(value) =>
                    setLeaveStatusFilter(value as LeaveRequestStatus | 'all')
                  }
                >
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Requests</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {requestsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : (
                <LeaveRequestsTable requests={filteredLeaveRequests} />
              )}
            </TabsContent>

            {/* Corrections Tab */}
            <TabsContent value="corrections" className="space-y-6">
              <CorrectionsTab />
            </TabsContent>

            {/* Calendar Tab */}
            <TabsContent value="calendar" className="space-y-6">
              <AttendanceCalendar />
            </TabsContent>
          </Tabs>
        </main>
      </div>

      {/* Admin Dialogs */}
      <EditAttendanceDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        record={selectedRecord}
      />
      <DeleteAttendanceDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        record={selectedRecord}
      />
    </div>
  );
}
