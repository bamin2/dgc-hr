import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Wallet, Calendar, CheckCircle } from 'lucide-react';
import { formatDisplayDate, formatShortDate } from "@/lib/dateUtils";

interface PayrollStatus {
  lastRunDate: string | null;
  lastRunAmount: number | null;
  nextPayrollDate: string | null;
}

interface PayrollStatusCardProps {
  status: PayrollStatus;
  isLoading?: boolean;
  currency?: string;
}

export function PayrollStatusCard({ status, isLoading, currency = 'SAR' }: PayrollStatusCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-SA', { 
      style: 'currency', 
      currency,
      maximumFractionDigits: 0 
    }).format(amount);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <Wallet className="h-4 w-4 text-primary" />
          Payroll Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {status.lastRunDate && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-500" />
              <span className="text-sm">Last Run</span>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">
                {formatDisplayDate(status.lastRunDate)}
              </p>
              {status.lastRunAmount && (
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(status.lastRunAmount)}
                </p>
              )}
            </div>
          </div>
        )}

        {status.nextPayrollDate && (
          <div className="flex items-center justify-between rounded-lg bg-muted p-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Next Payroll</span>
            </div>
            <Badge variant="secondary">
              {formatShortDate(status.nextPayrollDate)}
            </Badge>
          </div>
        )}

        {!status.lastRunDate && !status.nextPayrollDate && (
          <p className="text-sm text-muted-foreground text-center py-2">
            No payroll runs yet
          </p>
        )}
      </CardContent>
    </Card>
  );
}
