import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Banknote, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface LoanData {
  id: string;
  principalAmount: number;
  outstandingBalance: number;
  nextInstallmentDate: string | null;
  nextInstallmentAmount: number | null;
}

interface MyLoansCardProps {
  loans: LoanData[];
  isLoading?: boolean;
  currency?: string;
}

export function MyLoansCard({ loans, isLoading, currency = 'SAR' }: MyLoansCardProps) {
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

  // Don't render if no loans
  if (loans.length === 0) {
    return null;
  }

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-SA', { 
      style: 'currency', 
      currency,
      maximumFractionDigits: 0 
    }).format(amount);

  const totalOutstanding = loans.reduce((sum, loan) => sum + loan.outstandingBalance, 0);
  
  // Find next installment across all loans
  const nextInstallment = loans
    .filter(l => l.nextInstallmentDate)
    .sort((a, b) => (a.nextInstallmentDate || '').localeCompare(b.nextInstallmentDate || ''))[0];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <Banknote className="h-4 w-4 text-primary" />
          My Loans
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Outstanding Balance</span>
          <span className="text-lg font-semibold">{formatCurrency(totalOutstanding)}</span>
        </div>
        
        {nextInstallment?.nextInstallmentDate && (
          <div className="rounded-lg bg-muted p-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <Calendar className="h-4 w-4" />
              Next Payment
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium">
                {format(new Date(nextInstallment.nextInstallmentDate), 'MMM d, yyyy')}
              </span>
              <span className="font-semibold text-primary">
                {formatCurrency(nextInstallment.nextInstallmentAmount || 0)}
              </span>
            </div>
          </div>
        )}

        {loans.length > 1 && (
          <p className="text-xs text-muted-foreground text-center">
            {loans.length} active loans
          </p>
        )}
      </CardContent>
    </Card>
  );
}
