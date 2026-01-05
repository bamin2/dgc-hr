import { TrendingUp, TrendingDown, DollarSign, Calendar, User, Minus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useSalaryHistory, SalaryChangeType } from "@/hooks/useSalaryHistory";
import { format } from "date-fns";

interface SalaryHistoryCardProps {
  employeeId: string;
  maxItems?: number;
}

const changeTypeLabels: Record<SalaryChangeType, string> = {
  initial: 'Initial Salary',
  adjustment: 'Adjustment',
  promotion: 'Promotion',
  annual_review: 'Annual Review',
  correction: 'Correction',
  bulk_update: 'Bulk Update',
};

const changeTypeVariants: Record<SalaryChangeType, 'default' | 'secondary' | 'outline'> = {
  initial: 'secondary',
  adjustment: 'outline',
  promotion: 'default',
  annual_review: 'default',
  correction: 'outline',
  bulk_update: 'secondary',
};

export function SalaryHistoryCard({ employeeId, maxItems = 5 }: SalaryHistoryCardProps) {
  const { data: history, isLoading } = useSalaryHistory(employeeId);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const calculateChange = (previous: number | null, current: number) => {
    if (!previous || previous === 0) return null;
    const diff = current - previous;
    const percentage = (diff / previous) * 100;
    return { diff, percentage };
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-primary" />
            Salary History
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-start gap-3">
              <Skeleton className="h-2 w-2 rounded-full mt-2" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  const displayHistory = history?.slice(0, maxItems) || [];
  const hasMore = (history?.length || 0) > maxItems;

  if (displayHistory.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-primary" />
            Salary History
          </CardTitle>
          <CardDescription>
            Track all salary changes over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No salary history available yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-primary" />
          Salary History
        </CardTitle>
        <CardDescription>
          {history?.length || 0} salary change(s) recorded
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className={displayHistory.length > 3 ? "h-[280px]" : undefined}>
          <div className="space-y-4">
            {displayHistory.map((record, index) => {
              const change = calculateChange(record.previousSalary, record.newSalary);
              const isIncrease = change && change.diff > 0;
              const isDecrease = change && change.diff < 0;

              return (
                <div
                  key={record.id}
                  className="relative pl-6 pb-4 last:pb-0"
                >
                  {/* Timeline line */}
                  {index < displayHistory.length - 1 && (
                    <div className="absolute left-[3px] top-3 bottom-0 w-px bg-border" />
                  )}
                  
                  {/* Timeline dot */}
                  <div className={`absolute left-0 top-1.5 h-2 w-2 rounded-full ${
                    isIncrease ? 'bg-emerald-500' : isDecrease ? 'bg-destructive' : 'bg-primary'
                  }`} />

                  <div className="space-y-2">
                    {/* Header row */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant={changeTypeVariants[record.changeType]}>
                        {changeTypeLabels[record.changeType]}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(record.effectiveDate), 'MMM d, yyyy')}
                      </span>
                    </div>

                    {/* Salary change */}
                    <div className="flex items-center gap-2 text-sm">
                      {record.previousSalary !== null ? (
                        <>
                          <span className="text-muted-foreground">
                            {formatCurrency(record.previousSalary)}
                          </span>
                          <span className="text-muted-foreground">→</span>
                          <span className="font-medium">
                            {formatCurrency(record.newSalary)}
                          </span>
                          {change && (
                            <span className={`flex items-center gap-0.5 text-xs ${
                              isIncrease ? 'text-emerald-600' : 'text-destructive'
                            }`}>
                              {isIncrease ? (
                                <TrendingUp className="h-3 w-3" />
                              ) : (
                                <TrendingDown className="h-3 w-3" />
                              )}
                              {isIncrease ? '+' : ''}{formatCurrency(change.diff)}
                              <span className="text-muted-foreground ml-1">
                                ({isIncrease ? '+' : ''}{change.percentage.toFixed(1)}%)
                              </span>
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="font-medium">
                          {formatCurrency(record.newSalary)}
                        </span>
                      )}
                    </div>

                    {/* Reason */}
                    {record.reason && (
                      <p className="text-xs text-muted-foreground italic">
                        "{record.reason}"
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>

        {hasMore && (
          <p className="text-xs text-muted-foreground text-center mt-4 pt-4 border-t">
            Showing {maxItems} of {history?.length} records
          </p>
        )}
      </CardContent>
    </Card>
  );
}
