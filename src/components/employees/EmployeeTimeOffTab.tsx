import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { 
  Calendar, 
  Clock, 
  Plus, 
  CheckCircle, 
  XCircle, 
  Hourglass, 
  Inbox,
  SlidersHorizontal,
  CalendarDays,
  CalendarCheck,
  CalendarClock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { useLeaveBalances, useUpdateLeaveBalance } from '@/hooks/useLeaveBalances';
import { useLeaveRequests } from '@/hooks/useLeaveRequests';
import { AdminAddLeaveDialog } from './AdminAddLeaveDialog';
import { BalanceAdjustmentDialog } from './BalanceAdjustmentDialog';

interface EmployeeTimeOffTabProps {
  employeeId: string;
}

const statusConfig: Record<string, { icon: React.ReactNode; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pending: { icon: <Hourglass className="h-3.5 w-3.5" />, variant: 'secondary' },
  approved: { icon: <CheckCircle className="h-3.5 w-3.5" />, variant: 'default' },
  rejected: { icon: <XCircle className="h-3.5 w-3.5" />, variant: 'destructive' },
};

export function EmployeeTimeOffTab({ employeeId }: EmployeeTimeOffTabProps) {
  const [showAddLeaveDialog, setShowAddLeaveDialog] = useState(false);
  const [showAdjustBalanceDialog, setShowAdjustBalanceDialog] = useState(false);
  const [selectedBalance, setSelectedBalance] = useState<{ id: string; leaveTypeId: string; leaveTypeName: string } | null>(null);
  
  const currentYear = new Date().getFullYear();
  
  const { data: balances, isLoading: loadingBalances } = useLeaveBalances(employeeId, currentYear);
  const { data: requests, isLoading: loadingRequests } = useLeaveRequests({ employeeId });

  const isLoading = loadingBalances || loadingRequests;

  // Calculate summary statistics
  const stats = useMemo(() => {
    if (!balances || !requests) return { totalTypes: 0, daysTaken: 0, daysRemaining: 0, pendingRequests: 0 };
    
    const totalTypes = balances.length;
    const daysTaken = balances.reduce((sum, b) => sum + (b.used_days || 0), 0);
    
    // Only show Annual Leave days remaining
    const annualLeaveBalance = balances.find(
      b => b.leave_type?.name?.toLowerCase() === 'annual leave'
    );
    const daysRemaining = annualLeaveBalance 
      ? annualLeaveBalance.total_days - annualLeaveBalance.used_days - annualLeaveBalance.pending_days
      : 0;
    
    const pendingRequests = requests.filter(r => r.status === 'pending').length;
    
    return { totalTypes, daysTaken, daysRemaining, pendingRequests };
  }, [balances, requests]);

  const handleAdjustBalance = (balance: { id: string; leave_type_id: string; leave_type?: { name: string } | null }) => {
    setSelectedBalance({
      id: balance.id,
      leaveTypeId: balance.leave_type_id,
      leaveTypeName: balance.leave_type?.name || 'Leave'
    });
    setShowAdjustBalanceDialog(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-48" />
      </div>
    );
  }

  // Filter out public holidays - they are managed separately and show on calendar only
  const recentRequests = (requests || [])
    .filter(request => request.leave_type?.name !== 'Public Holiday')
    .slice(0, 15);

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Leave Types</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTypes}</div>
            <p className="text-xs text-muted-foreground">Configured for {currentYear}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Days Taken</CardTitle>
            <CalendarCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.daysTaken}</div>
            <p className="text-xs text-muted-foreground">This year</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Annual Leave Remaining</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.daysRemaining}</div>
            <p className="text-xs text-muted-foreground">Available balance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <CalendarClock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingRequests}</div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>
      </div>

      {/* Leave Balances with Admin Actions */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              Leave Balances ({currentYear})
            </CardTitle>
            <div className="flex gap-2">
              <Button onClick={() => setShowAddLeaveDialog(true)} className="gap-2" size="sm">
                <Plus className="h-4 w-4" />
                Add Leave Entry
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!balances || balances.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                No leave balances configured for this year.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {balances.map((balance) => {
                const remaining = balance.total_days - balance.used_days - balance.pending_days;
                const usedPercentage = balance.total_days > 0 ? (balance.used_days / balance.total_days) * 100 : 0;
                const pendingPercentage = balance.total_days > 0 ? (balance.pending_days / balance.total_days) * 100 : 0;
                
                return (
                  <div
                    key={balance.id}
                    className="p-4 border rounded-lg space-y-3 hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: balance.leave_type?.color || '#14b8a6' }}
                        />
                        <span className="font-medium text-sm">
                          {balance.leave_type?.name || 'Leave'}
                        </span>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7"
                        onClick={() => handleAdjustBalance(balance)}
                      >
                        <SlidersHorizontal className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    
                    <Progress 
                      value={usedPercentage + pendingPercentage} 
                      className="h-2"
                    />
                    
                    <div className="grid grid-cols-3 text-xs text-muted-foreground text-center">
                      <div>
                        <div className="font-medium text-foreground">{balance.used_days}</div>
                        <div>Used</div>
                      </div>
                      <div>
                        <div className="font-medium text-amber-600">{balance.pending_days}</div>
                        <div>Pending</div>
                      </div>
                      <div>
                        <div className="font-medium text-green-600">{remaining}</div>
                        <div>Remaining</div>
                      </div>
                    </div>
                    
                    <div className="text-xs text-muted-foreground text-center pt-1 border-t">
                      Total: {balance.total_days} days
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Leave History */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            Leave History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentRequests.length === 0 ? (
            <div className="text-center py-8">
              <Inbox className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                No leave requests yet.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentRequests.map((request) => {
                const config = statusConfig[request.status] || statusConfig.pending;
                
                return (
                  <div
                    key={request.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: request.leave_type?.color || '#14b8a6' }}
                        />
                        <span className="text-sm font-medium">
                          {request.leave_type?.name || 'Leave'}
                        </span>
                        <Badge variant={config.variant} className="gap-1 h-5 text-xs">
                          {config.icon}
                          {request.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(request.start_date), 'MMM d')} - {format(new Date(request.end_date), 'MMM d, yyyy')}
                        <span className="mx-1">•</span>
                        {request.days_count} day{request.days_count !== 1 ? 's' : ''}
                        {request.reason && (
                          <>
                            <span className="mx-1">•</span>
                            {request.reason}
                          </>
                        )}
                      </p>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {format(new Date(request.created_at || request.start_date), 'MMM d, yyyy')}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <AdminAddLeaveDialog
        open={showAddLeaveDialog}
        onOpenChange={setShowAddLeaveDialog}
        employeeId={employeeId}
      />

      {selectedBalance && (
        <BalanceAdjustmentDialog
          open={showAdjustBalanceDialog}
          onOpenChange={setShowAdjustBalanceDialog}
          balanceId={selectedBalance.id}
          leaveTypeId={selectedBalance.leaveTypeId}
          leaveTypeName={selectedBalance.leaveTypeName}
          employeeId={employeeId}
        />
      )}
    </div>
  );
}
