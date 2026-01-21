import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { 
  Calendar, 
  Clock, 
  Plus,
  CheckCircle,
  XCircle,
  Hourglass,
  Inbox
} from 'lucide-react';
import { useMyLeaveBalances } from '@/hooks/useLeaveBalances';
import { useLeaveRequests } from '@/hooks/useLeaveRequests';
import { format } from 'date-fns';
import { RequestTimeOffDialog } from '@/components/timeoff/RequestTimeOffDialog';
import { getFirstTierMax } from '@/lib/dashboard/utils';

interface MyProfileTimeOffTabProps {
  employeeId: string;
}

const statusConfig: Record<string, { icon: React.ReactNode; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pending: { icon: <Hourglass className="h-3.5 w-3.5" />, variant: 'secondary' },
  approved: { icon: <CheckCircle className="h-3.5 w-3.5" />, variant: 'default' },
  rejected: { icon: <XCircle className="h-3.5 w-3.5" />, variant: 'destructive' },
};

export function MyProfileTimeOffTab({ employeeId }: MyProfileTimeOffTabProps) {
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const currentYear = new Date().getFullYear();
  
  const { data: balances, isLoading: loadingBalances } = useMyLeaveBalances(currentYear);
  const { data: requests, isLoading: loadingRequests } = useLeaveRequests({ employeeId });

  const isLoading = loadingBalances || loadingRequests;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  // Filter out public holidays - they should only show on the calendar
  const recentRequests = (requests || [])
    .filter(request => request.leave_type?.name !== 'Public Holiday')
    .slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Action Button */}
      <div className="flex justify-end">
        <Button onClick={() => setShowRequestDialog(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Request Time Off
        </Button>
      </div>

      {/* Leave Balances */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            Leave Balances ({currentYear})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!balances || balances.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No leave balances configured for this year.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {balances.map((balance) => {
                const leaveType = balance.leave_type as any;
                const hasTiers = leaveType?.has_salary_deduction && 
                                 Array.isArray(leaveType?.salary_deduction_tiers) && 
                                 leaveType.salary_deduction_tiers.length > 0;
                
                // For tiered leave types (like Sick Leave), use first tier max as display total
                let displayTotal = balance.total_days;
                if (hasTiers) {
                  const firstTierMax = getFirstTierMax(leaveType.salary_deduction_tiers);
                  if (firstTierMax !== null) {
                    displayTotal = firstTierMax;
                  }
                }
                
                const remaining = Math.max(0, displayTotal - balance.used_days - balance.pending_days);
                const usedPercentage = displayTotal > 0 ? (balance.used_days / displayTotal) * 100 : 0;
                const pendingPercentage = displayTotal > 0 ? (balance.pending_days / displayTotal) * 100 : 0;
                
                return (
                  <div
                    key={balance.id}
                    className="p-4 border rounded-lg space-y-3"
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
                      <span className="text-xs text-muted-foreground">
                        {remaining} days remaining
                      </span>
                    </div>
                    
                    <Progress 
                      value={usedPercentage + pendingPercentage} 
                      className="h-2"
                    />
                    
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Used: {balance.used_days}</span>
                      {balance.pending_days > 0 && (
                        <span className="text-amber-600">Pending: {balance.pending_days}</span>
                      )}
                      <span>Total: {displayTotal}</span>
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
            <div className="text-center py-6">
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
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Request Dialog */}
      <RequestTimeOffDialog
        open={showRequestDialog}
        onOpenChange={setShowRequestDialog}
      />
    </div>
  );
}