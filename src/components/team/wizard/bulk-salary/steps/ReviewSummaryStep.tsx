import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, TrendingUp, TrendingDown, AlertTriangle, Minus } from "lucide-react";
import { format } from "date-fns";
import { EmployeeImpact, BulkSalaryWizardData } from "../types";

interface ReviewSummaryStepProps {
  data: BulkSalaryWizardData;
  impacts: EmployeeImpact[];
  totals: { beforeTotal: number; afterTotal: number; change: number };
  currency: string;
}

export function ReviewSummaryStep({ data, impacts, totals, currency }: ReviewSummaryStepProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase();
  };

  const getUpdateTypeLabel = () => {
    switch (data.updateType) {
      case 'percentage_increase': return `+${data.updateValue}% increase`;
      case 'percentage_decrease': return `-${data.updateValue}% decrease`;
      case 'fixed_increase': return `+${formatCurrency(parseFloat(data.updateValue))} increase`;
      case 'fixed_decrease': return `-${formatCurrency(parseFloat(data.updateValue))} decrease`;
      case 'set_new': return 'Custom per-employee salaries';
      default: return 'Unknown';
    }
  };

  const warnings = useMemo(() => {
    const result: string[] = [];
    
    // Check for probation employees
    const probationEmployees = impacts.filter(i => (i.employee as any).status === 'probation');
    if (probationEmployees.length > 0) {
      result.push(`${probationEmployees.length} employee(s) are on probation`);
    }
    
    // Check for large salary decreases
    const largeDecreases = impacts.filter(i => {
      const change = i.afterBasicSalary - i.beforeBasicSalary;
      return change < 0 && Math.abs(change) > i.beforeBasicSalary * 0.2;
    });
    if (largeDecreases.length > 0) {
      result.push(`${largeDecreases.length} employee(s) have >20% salary decrease`);
    }
    
    return result;
  }, [impacts]);

  const gosiImpacts = impacts.filter(i => i.employee.isSubjectToGosi);
  const isPositiveChange = totals.change >= 0;

  // Calculate GOSI totals
  const gosiTotals = useMemo(() => {
    return {
      beforeDeductions: gosiImpacts.reduce((sum, i) => sum + i.beforeGosiDeduction, 0),
      afterDeductions: gosiImpacts.reduce((sum, i) => sum + i.afterGosiDeduction, 0),
      change: gosiImpacts.reduce((sum, i) => sum + (i.afterGosiDeduction - i.beforeGosiDeduction), 0),
    };
  }, [gosiImpacts]);

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-4 w-4" />;
    if (change < 0) return <TrendingDown className="h-4 w-4" />;
    return <Minus className="h-4 w-4" />;
  };

  const getChangeColor = (change: number, inverse: boolean = false) => {
    // For deductions, increase is bad (inverse)
    if (inverse) {
      if (change > 0) return 'text-destructive';
      if (change < 0) return 'text-green-600 dark:text-green-400';
    } else {
      if (change > 0) return 'text-green-600 dark:text-green-400';
      if (change < 0) return 'text-destructive';
    }
    return 'text-muted-foreground';
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Review & Impact Summary</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Review the changes before applying them
        </p>
      </div>

      {/* Warnings */}
      {warnings.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-disc list-inside">
              {warnings.map((warning, i) => (
                <li key={i}>{warning}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Employees</p>
                <p className="text-xl font-bold">{impacts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div>
              <p className="text-sm text-muted-foreground">Update Type</p>
              <p className="text-lg font-semibold mt-1">{getUpdateTypeLabel()}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div>
              <p className="text-sm text-muted-foreground">Effective Date</p>
              <p className="text-lg font-semibold mt-1">
                {data.effectiveDate ? format(data.effectiveDate, 'MMM d, yyyy') : '-'}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className={isPositiveChange ? 'bg-green-500/10 border-green-500/20' : 'bg-destructive/10 border-destructive/20'}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${isPositiveChange ? 'bg-green-500/20' : 'bg-destructive/20'}`}>
                {isPositiveChange ? (
                  <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-destructive" />
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Change</p>
                <p className={`text-xl font-bold ${isPositiveChange ? 'text-green-600 dark:text-green-400' : 'text-destructive'}`}>
                  {isPositiveChange ? '+' : ''}{formatCurrency(totals.change)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Totals Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Salary Totals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Header Row */}
            <div className="grid grid-cols-4 gap-4 text-sm font-medium text-muted-foreground border-b pb-2">
              <div></div>
              <div className="text-right">Before</div>
              <div className="text-right">After</div>
              <div className="text-right">Difference</div>
            </div>

            {/* Basic Salary Row */}
            <div className="grid grid-cols-4 gap-4 items-center">
              <div className="text-sm font-medium">Basic Salary</div>
              <div className="text-right text-sm">{formatCurrency(totals.beforeTotal)}</div>
              <div className="text-right text-sm font-medium">{formatCurrency(totals.afterTotal)}</div>
              <div className={`text-right text-sm font-medium flex items-center justify-end gap-1 ${getChangeColor(totals.change)}`}>
                {getChangeIcon(totals.change)}
                {totals.change >= 0 ? '+' : ''}{formatCurrency(totals.change)}
              </div>
            </div>

            {/* GOSI Deductions Row (if applicable) */}
            {gosiImpacts.length > 0 && (
              <div className="grid grid-cols-4 gap-4 items-center">
                <div className="text-sm font-medium">GOSI Deductions (8%)</div>
                <div className="text-right text-sm">{formatCurrency(gosiTotals.beforeDeductions)}</div>
                <div className="text-right text-sm font-medium">{formatCurrency(gosiTotals.afterDeductions)}</div>
                <div className={`text-right text-sm font-medium flex items-center justify-end gap-1 ${getChangeColor(gosiTotals.change, true)}`}>
                  {getChangeIcon(gosiTotals.change)}
                  {gosiTotals.change >= 0 ? '+' : ''}{formatCurrency(gosiTotals.change)}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Per-employee breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Per-Employee Impact</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[300px]">
            <div className="divide-y">
              {impacts.map((impact) => {
                const netChange = impact.afterNetSalary - impact.beforeNetSalary;
                const isIncrease = netChange >= 0;
                
                return (
                  <div key={impact.employee.id} className="flex items-center gap-4 px-4 py-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={impact.employee.avatar} />
                      <AvatarFallback>
                        {getInitials(impact.employee.firstName, impact.employee.lastName)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {impact.employee.firstName} {impact.employee.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {impact.employee.jobTitle} · Basic: {formatCurrency(impact.beforeBasicSalary)}
                      </p>
                    </div>

                    <div className="text-right text-sm">
                      <p className="text-muted-foreground">{formatCurrency(impact.beforeNetSalary)}</p>
                    </div>

                    <div className="text-center px-2">
                      <span className="text-muted-foreground">→</span>
                    </div>

                    <div className="text-right text-sm">
                      <p className="font-medium">{formatCurrency(impact.afterNetSalary)}</p>
                    </div>

                    <Badge
                      variant={isIncrease ? 'default' : 'destructive'}
                      className="min-w-[80px] justify-center"
                    >
                      {isIncrease ? '+' : ''}{formatCurrency(netChange)}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* GOSI Impact */}
      {gosiImpacts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">GOSI Impact</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[200px]">
              <div className="divide-y">
                {gosiImpacts.map((impact) => (
                  <div key={impact.employee.id} className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium">
                        {impact.employee.firstName} {impact.employee.lastName}
                      </span>
                      <Badge variant="outline">GOSI</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="text-right">
                        <p className="text-muted-foreground">Registered Salary</p>
                        <p>
                          {formatCurrency(impact.beforeGosiSalary || 0)} → {formatCurrency(impact.afterGosiSalary || 0)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-muted-foreground">Deduction (8%)</p>
                        <p className="text-destructive">
                          {formatCurrency(impact.beforeGosiDeduction)} → {formatCurrency(impact.afterGosiDeduction)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
