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
import { Plus } from 'lucide-react';
import {
  AttendanceMetrics,
  AttendanceFilters,
  AttendanceTable,
  LeaveBalanceCard,
  LeaveRequestsTable,
  AttendanceCalendar,
} from '@/components/attendance';
import { attendanceRecords, leaveRequests, leaveBalances } from '@/data/attendance';
import { mockEmployees as employees } from '@/data/employees';

export default function Attendance() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all-departments');
  const [statusFilter, setStatusFilter] = useState('all');
  const [leaveStatusFilter, setLeaveStatusFilter] = useState('all');

  // Get today's date for filtering
  const today = new Date().toISOString().split('T')[0];

  // Filter attendance records
  const filteredAttendance = attendanceRecords.filter((record) => {
    const employee = employees.find((e) => e.id === record.employeeId);
    if (!employee) return false;

    const matchesSearch = `${employee.firstName} ${employee.lastName}`.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDepartment =
      departmentFilter === 'all-departments' ||
      employee.department.toLowerCase().replace(' ', '-') === departmentFilter;
    const matchesStatus = statusFilter === 'all' || record.status === statusFilter;

    return matchesSearch && matchesDepartment && matchesStatus;
  });

  // Get today's attendance
  const todayAttendance = filteredAttendance.filter((r) => r.date === today);

  // Filter leave requests
  const filteredLeaveRequests = leaveRequests.filter((request) => {
    const employee = employees.find((e) => e.id === request.employeeId);
    if (!employee) return false;

    const matchesSearch = `${employee.firstName} ${employee.lastName}`.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = leaveStatusFilter === 'all' || request.status === leaveStatusFilter;

    return matchesSearch && matchesStatus;
  });

  // Get average leave balance for display
  const avgBalance = leaveBalances[0] || {
    annual: { total: 20, used: 5, remaining: 15 },
    sick: { total: 10, used: 2, remaining: 8 },
    personal: { total: 5, used: 1, remaining: 4 },
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 overflow-auto">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-semibold">Leave & Attendance</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Manage employee attendance and leave requests
              </p>
            </div>
            <Button
              className="bg-primary hover:bg-primary/90"
              onClick={() => navigate('/attendance/leave/request')}
            >
              <Plus className="h-4 w-4 mr-2" />
              Request Leave
            </Button>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-muted/50">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="attendance">Attendance</TabsTrigger>
              <TabsTrigger value="leave-requests">Leave Requests</TabsTrigger>
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
                        <Button variant="link" className="text-primary p-0 h-auto" onClick={() => setActiveTab('attendance')}>
                          View All
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      <AttendanceTable records={todayAttendance.slice(0, 5)} />
                    </CardContent>
                  </Card>
                </div>

                {/* Leave Balance */}
                <div>
                  <LeaveBalanceCard balance={avgBalance} />
                </div>
              </div>

              {/* Pending Leave Requests */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold">
                      Pending Leave Requests
                    </CardTitle>
                    <Button variant="link" className="text-primary p-0 h-auto" onClick={() => setActiveTab('leave-requests')}>
                      View All
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <LeaveRequestsTable
                    requests={leaveRequests.filter((r) => r.status === 'pending').slice(0, 5)}
                  />
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
              <AttendanceTable records={filteredAttendance.slice(0, 20)} />
            </TabsContent>

            {/* Leave Requests Tab */}
            <TabsContent value="leave-requests" className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-3">
                <Select value={leaveStatusFilter} onValueChange={setLeaveStatusFilter}>
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
              <LeaveRequestsTable requests={filteredLeaveRequests} />
            </TabsContent>

            {/* Calendar Tab */}
            <TabsContent value="calendar" className="space-y-6">
              <AttendanceCalendar />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
