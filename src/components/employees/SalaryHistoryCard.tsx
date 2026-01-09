import { TrendingUp, TrendingDown, DollarSign, Calendar, Plus, Minus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useSalaryHistory, SalaryChangeType, CompensationComponent } from "@/hooks/useSalaryHistory";
import { format } from "date-fns";
import { useCompanySettings } from "@/contexts/CompanySettingsContext";

interface SalaryHistoryCardProps {
  employeeId: string;
  currencyCode?: string;
  maxItems?: number;
}

const changeTypeLabels: Record<SalaryChangeType, string> = {
  initial: 'Initial Salary',
  adjustment: 'Adjustment',
  promotion: 'Promotion',
  annual_review: 'Annual Review',
  correction: 'Correction',
  bulk_update: 'Bulk Update',
  allowance_change: 'Allowance Change',
  deduction_change: 'Deduction Change',
  compensation_update: 'Compensation Update',
};

const changeTypeVariants: Record<SalaryChangeType, 'default' | 'secondary' | 'outline'> = {
  initial: 'secondary',
  adjustment: 'outline',
  promotion: 'default',
  annual_review: 'default',
  correction: 'outline',
  bulk_update: 'secondary',
  allowance_change: 'outline',
  deduction_change: 'outline',
  compensation_update: 'default',
};

export function SalaryHistoryCard({ employeeId, currencyCode, maxItems = 5 }: SalaryHistoryCardProps) {
  const { data: history, isLoading } = useSalaryHistory(employeeId);
  const { formatCurrency, formatCurrencyWithCode } = useCompanySettings();

  const formatSalaryCurrency = (amount: number) => {
    if (currencyCode) {
      return formatCurrencyWithCode(amount, currencyCode);
    }
    return formatCurrency(amount);
  };

  const calculateChange = (previous: number | null, current: number | null) => {
    if (!previous || previous === 0 || !current) return null;
    const diff = current - previous;
    const percentage = (diff / previous) * 100;
    return { diff, percentage };
  };

  const getComponentChanges = (
    previous: CompensationComponent[] | null | undefined,
    current: CompensationComponent[] | null | undefined
  ) => {
    const prevMap = new Map((previous || []).map(c => [c.name, c.amount]));
    const currMap = new Map((current || []).map(c => [c.name, c.amount]));
    
    const added: CompensationComponent[] = [];
    const removed: CompensationComponent[] = [];
    const changed: { name: string; from: number; to: number }[] = [];
    
    // Check for added or changed
    (current || []).forEach(c => {
      if (!prevMap.has(c.name)) {
        added.push(c);
      } else if (prevMap.get(c.name) !== c.amount) {
        changed.push({ name: c.name, from: prevMap.get(c.name)!, to: c.amount });
      }
    });
    
    // Check for removed
    (previous || []).forEach(p => {
      if (!currMap.has(p.name)) {
        removed.push(p);
      }
    });
    
    return { added, removed, changed };
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
          Compensation History
        </CardTitle>
        <CardDescription>
          {history?.length || 0} change(s) recorded
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className={displayHistory.length > 3 ? "h-[320px]" : undefined}>
          <div className="space-y-4">
            {displayHistory.map((record, index) => {
              const hasSalaryChange = record.previousSalary !== null && record.newSalary !== null;
              const change = hasSalaryChange ? calculateChange(record.previousSalary, record.newSalary) : null;
              const isIncrease = change && change.diff > 0;
              const isDecrease = change && change.diff < 0;
              
              const allowanceChanges = getComponentChanges(record.previousAllowances, record.newAllowances);
              const deductionChanges = getComponentChanges(record.previousDeductions, record.newDeductions);
              
              const hasAllowanceChanges = allowanceChanges.added.length > 0 || allowanceChanges.removed.length > 0 || allowanceChanges.changed.length > 0;
              const hasDeductionChanges = deductionChanges.added.length > 0 || deductionChanges.removed.length > 0 || deductionChanges.changed.length > 0;

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
                    {hasSalaryChange && (
                      <div className="flex items-center gap-2 text-sm">
                        {record.previousSalary !== null ? (
                          <>
                            <span className="text-muted-foreground">
                              {formatSalaryCurrency(record.previousSalary)}
                            </span>
                            <span className="text-muted-foreground">→</span>
                            <span className="font-medium">
                              {formatSalaryCurrency(record.newSalary!)}
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
                                {isIncrease ? '+' : ''}{formatSalaryCurrency(change.diff)}
                                <span className="text-muted-foreground ml-1">
                                  ({isIncrease ? '+' : ''}{change.percentage.toFixed(1)}%)
                                </span>
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="font-medium">
                            {formatSalaryCurrency(record.newSalary!)}
                          </span>
                        )}
                      </div>
                    )}
                    
                    {/* Allowance changes */}
                    {hasAllowanceChanges && (
                      <div className="space-y-1">
                        {allowanceChanges.added.map((a, i) => (
                          <div key={`added-${i}`} className="flex items-center gap-1.5 text-xs text-emerald-600">
                            <Plus className="h-3 w-3" />
                            <span>{a.name}</span>
                            <span className="font-medium">+{formatSalaryCurrency(a.amount)}</span>
                          </div>
                        ))}
                        {allowanceChanges.removed.map((a, i) => (
                          <div key={`removed-${i}`} className="flex items-center gap-1.5 text-xs text-destructive">
                            <Minus className="h-3 w-3" />
                            <span>{a.name}</span>
                            <span className="font-medium">-{formatSalaryCurrency(a.amount)}</span>
                          </div>
                        ))}
                        {allowanceChanges.changed.map((c, i) => (
                          <div key={`changed-${i}`} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <span>{c.name}:</span>
                            <span>{formatSalaryCurrency(c.from)} → {formatSalaryCurrency(c.to)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Deduction changes */}
                    {hasDeductionChanges && (
                      <div className="space-y-1">
                        {deductionChanges.added.map((d, i) => (
                          <div key={`added-${i}`} className="flex items-center gap-1.5 text-xs text-amber-600">
                            <Plus className="h-3 w-3" />
                            <span>{d.name} (deduction)</span>
                            <span className="font-medium">+{formatSalaryCurrency(d.amount)}</span>
                          </div>
                        ))}
                        {deductionChanges.removed.map((d, i) => (
                          <div key={`removed-${i}`} className="flex items-center gap-1.5 text-xs text-emerald-600">
                            <Minus className="h-3 w-3" />
                            <span>{d.name} (deduction)</span>
                            <span className="font-medium">-{formatSalaryCurrency(d.amount)}</span>
                          </div>
                        ))}
                        {deductionChanges.changed.map((c, i) => (
                          <div key={`changed-${i}`} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <span>{c.name} (deduction):</span>
                            <span>{formatSalaryCurrency(c.from)} → {formatSalaryCurrency(c.to)}</span>
                          </div>
                        ))}
                      </div>
                    )}

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
