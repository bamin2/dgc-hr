import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar } from 'lucide-react';
import { LeaveBalanceSummary } from '@/hooks/useLeaveBalances';

interface LeaveBalanceCardProps {
  balances?: LeaveBalanceSummary[];
  isLoading?: boolean;
}

export function LeaveBalanceCard({ balances, isLoading }: LeaveBalanceCardProps) {
  if (isLoading) {
    return (
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Leave Balance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-2 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!balances || balances.length === 0) {
    return (
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Leave Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <Calendar className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No leave balances configured</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Leave Balance</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {balances.map((balance) => {
          const percentage = balance.total > 0 
            ? ((balance.used + balance.pending) / balance.total) * 100 
            : 0;
          
          return (
            <div key={balance.leaveTypeId} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: balance.color }}
                  />
                  <span className="text-sm font-medium">{balance.leaveTypeName}</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {balance.remaining} / {balance.total} days
                </span>
              </div>
              <Progress 
                value={percentage} 
                className="h-2"
                style={{ 
                  ['--progress-color' as string]: balance.color 
                } as React.CSSProperties}
              />
              {balance.pending > 0 && (
                <p className="text-xs text-muted-foreground">
                  {balance.pending} days pending approval
                </p>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
