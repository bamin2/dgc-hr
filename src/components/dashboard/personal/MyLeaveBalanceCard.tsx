import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { CalendarDays } from 'lucide-react';

interface LeaveBalanceData {
  leaveTypeId: string;
  leaveTypeName: string;
  color: string;
  total: number;
  used: number;
  pending: number;
  remaining: number;
}

interface MyLeaveBalanceCardProps {
  leaveBalances: LeaveBalanceData[];
  isLoading?: boolean;
}

export function MyLeaveBalanceCard({ leaveBalances, isLoading }: MyLeaveBalanceCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </CardContent>
      </Card>
    );
  }

  // Show only the main leave types (Annual and Sick typically)
  const mainBalances = leaveBalances.slice(0, 3);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-primary" />
          My Leave Balance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {mainBalances.length === 0 ? (
          <p className="text-sm text-muted-foreground">No leave balances available</p>
        ) : (
          mainBalances.map((balance) => {
            const usedPercent = balance.total > 0 
              ? Math.round(((balance.used + balance.pending) / balance.total) * 100) 
              : 0;
            
            return (
              <div key={balance.leaveTypeId} className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{balance.leaveTypeName}</span>
                  <span className="text-muted-foreground">
                    {balance.remaining} of {balance.total} days
                  </span>
                </div>
                <Progress 
                  value={usedPercent} 
                  className="h-2"
                  style={{ 
                    '--progress-background': balance.color 
                  } as React.CSSProperties}
                />
                {balance.pending > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {balance.pending} day(s) pending approval
                  </p>
                )}
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
