import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Wallet, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface NextPayrollCardProps {
  nextPayrollDate: string | null;
  lastNetSalary: number | null;
  isLoading?: boolean;
  currency?: string;
}

export function NextPayrollCard({ 
  nextPayrollDate, 
  lastNetSalary, 
  isLoading,
  currency = 'SAR'
}: NextPayrollCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    );
  }

  const formattedDate = nextPayrollDate 
    ? format(new Date(nextPayrollDate), 'MMMM d, yyyy')
    : 'Not scheduled';

  const formattedSalary = lastNetSalary 
    ? new Intl.NumberFormat('en-SA', { 
        style: 'currency', 
        currency,
        maximumFractionDigits: 0 
      }).format(lastNetSalary)
    : null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <Wallet className="h-4 w-4 text-primary" />
          Next Payroll
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-3">
            <Calendar className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-lg font-semibold">{formattedDate}</p>
            {formattedSalary && (
              <p className="text-sm text-muted-foreground">
                Last: {formattedSalary}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
