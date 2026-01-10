import { TrendingUp, Building2, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { InsightsData } from '@/hooks/useReportsOverview';
import { formatCurrencyWithCode } from '@/lib/salaryUtils';

interface InsightsSectionProps {
  data: InsightsData;
  isLoading: boolean;
  onNavigate: (reportId: string) => void;
}

export function InsightsSection({ data, isLoading, onNavigate }: InsightsSectionProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="h-20 bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="h-20 bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const hasInsights = data.highestPayrollDept || data.mostLoansDept;

  if (!hasInsights) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Insights</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.highestPayrollDept && (
          <Card className="hover:border-primary/50 transition-colors">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                  <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Highest Payroll Cost
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-semibold">{data.highestPayrollDept.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatCurrencyWithCode(data.highestPayrollDept.amount, data.highestPayrollDept.currencyCode)} gross pay
                  </p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => onNavigate('salary-distribution')}
                  className="gap-1"
                >
                  View Report
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {data.mostLoansDept && (
          <Card className="hover:border-primary/50 transition-colors">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-full bg-rose-100 dark:bg-rose-900/30">
                  <Building2 className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                </div>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Most Active Loans
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-semibold">{data.mostLoansDept.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {data.mostLoansDept.count} active loan{data.mostLoansDept.count !== 1 ? 's' : ''}
                  </p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => onNavigate('loan-summary')}
                  className="gap-1"
                >
                  View Report
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
