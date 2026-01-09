import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Banknote, TrendingUp } from 'lucide-react';

interface LoanExposureData {
  totalOutstanding: number;
  activeLoansCount: number;
}

interface LoanExposureCardProps {
  loanExposure: LoanExposureData;
  isLoading?: boolean;
  currency?: string;
}

export function LoanExposureCard({ loanExposure, isLoading, currency = 'SAR' }: LoanExposureCardProps) {
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
          <Banknote className="h-4 w-4 text-primary" />
          Loan Exposure
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <div className="rounded-lg bg-primary/10 p-3">
            <TrendingUp className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold">
              {formatCurrency(loanExposure.totalOutstanding)}
            </p>
            <p className="text-sm text-muted-foreground">
              {loanExposure.activeLoansCount} active loan{loanExposure.activeLoansCount !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
