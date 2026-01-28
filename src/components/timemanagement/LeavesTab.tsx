import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { LayoutDashboard, FileText, Users, History, Calendar, ClipboardList } from 'lucide-react';
import {
  LeaveTypePoliciesTab,
  EmployeeBalancesTab,
  AdjustmentHistoryTab,
  PublicHolidaysTab,
} from '@/components/timemanagement';
import {
  LeaveMetrics,
  LeaveBalanceCard,
  LeaveRequestsTable,
} from '@/components/attendance';
import { useLeaveRequests, usePendingLeaveRequests, LeaveRequestStatus } from '@/hooks/useLeaveRequests';
import { useLeaveBalanceSummary } from '@/hooks/useLeaveBalances';

export function LeavesTab() {
  const [activeTab, setActiveTab] = useState('overview');
  const [leaveStatusFilter, setLeaveStatusFilter] = useState<LeaveRequestStatus | 'all'>('all');

  // Fetch leave data
  const { data: allLeaveRequests, isLoading: requestsLoading } = useLeaveRequests();
  const { data: pendingRequests, isLoading: pendingLoading } = usePendingLeaveRequests();
  const { data: leaveBalances, isLoading: balancesLoading } = useLeaveBalanceSummary(undefined);

  // Filter leave requests
  const filteredLeaveRequests = (allLeaveRequests || []).filter((request) => {
    const matchesStatus = leaveStatusFilter === 'all' || request.status === leaveStatusFilter;
    return matchesStatus;
  });

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
      <TabsList>
        <TabsTrigger value="overview">
          <LayoutDashboard className="h-4 w-4" />
          Overview
        </TabsTrigger>
        <TabsTrigger value="requests">
          <ClipboardList className="h-4 w-4" />
          Leave Requests
        </TabsTrigger>
        <TabsTrigger value="policies">
          <FileText className="h-4 w-4" />
          Leave Policies
        </TabsTrigger>
        <TabsTrigger value="balances">
          <Users className="h-4 w-4" />
          Employee Balances
        </TabsTrigger>
        <TabsTrigger value="holidays">
          <Calendar className="h-4 w-4" />
          Public Holidays
        </TabsTrigger>
        <TabsTrigger value="history">
          <History className="h-4 w-4" />
          Adjustment History
        </TabsTrigger>
      </TabsList>

      {/* Overview Tab */}
      <TabsContent value="overview" className="space-y-6">
        <LeaveMetrics />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Leave Balance */}
          <div>
            <LeaveBalanceCard balances={leaveBalances} isLoading={balancesLoading} />
          </div>

          {/* Pending Leave Requests */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold">
                    Pending Leave Requests
                  </CardTitle>
                  <Button
                    variant="link"
                    className="text-primary p-0 h-auto"
                    onClick={() => setActiveTab('requests')}
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
          </div>
        </div>
      </TabsContent>

      {/* Leave Requests Tab */}
      <TabsContent value="requests" className="space-y-6">
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

      <TabsContent value="policies" className="mt-6">
        <LeaveTypePoliciesTab />
      </TabsContent>

      <TabsContent value="balances" className="mt-6">
        <EmployeeBalancesTab />
      </TabsContent>

      <TabsContent value="holidays" className="mt-6">
        <PublicHolidaysTab />
      </TabsContent>

      <TabsContent value="history" className="mt-6">
        <AdjustmentHistoryTab />
      </TabsContent>
    </Tabs>
  );
}
