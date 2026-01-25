import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Wallet, Calendar, Info } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface NextPayrollCardProps {
  nextPayrollDate: string | null;
  lastNetSalary: number | null;
  isLoading?: boolean;
  currency?: string;
  wasAdjusted?: boolean;
  originalDay?: number;
  adjustmentReason?: string;
}

function getOrdinalSuffix(day: number): string {
  if (day >= 11 && day <= 13) return 'th';
  switch (day % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
}

export function NextPayrollCard({ 
  nextPayrollDate, 
  lastNetSalary, 
  isLoading,
  currency = 'SAR',
  wasAdjusted,
  originalDay,
  adjustmentReason,
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
    ? format(parseISO(nextPayrollDate), 'MMMM d, yyyy')
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
            <p className="text-lg font-semibold flex items-center gap-1.5">
              {formattedDate}
              {wasAdjusted && originalDay && adjustmentReason && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-[280px]">
                      <p className="text-sm">
                        Adjusted from the {originalDay}{getOrdinalSuffix(originalDay)} because it falls on a {adjustmentReason}. 
                        Payroll is moved to the Thursday before.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </p>
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
