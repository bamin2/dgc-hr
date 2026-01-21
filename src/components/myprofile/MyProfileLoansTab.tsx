import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { 
  Wallet, 
  Plus,
  Calendar,
  TrendingDown,
  Clock,
  Inbox,
  CheckCircle
} from 'lucide-react';
import { useEmployeeLoansWithInstallments, LoanWithInstallmentsData } from '@/hooks/useEmployeeLoansWithInstallments';
import { format } from 'date-fns';
import { EmployeeRequestLoanDialog } from '@/components/loans/EmployeeRequestLoanDialog';
import { useCompanySettings } from '@/contexts/CompanySettingsContext';

interface MyProfileLoansTabProps {
  employeeId: string;
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  requested: { label: 'Pending Approval', variant: 'secondary' },
  approved: { label: 'Approved', variant: 'default' },
  active: { label: 'Active', variant: 'default' },
  rejected: { label: 'Rejected', variant: 'destructive' },
  closed: { label: 'Closed', variant: 'outline' },
  cancelled: { label: 'Cancelled', variant: 'outline' },
};

// Calculate outstanding balance from installments
function calculateOutstandingBalance(loan: LoanWithInstallmentsData): number {
  const paidAmount = loan.loan_installments
    ?.filter(i => i.status === 'paid')
    .reduce((sum, i) => sum + i.amount, 0) || 0;
  return loan.principal_amount - paidAmount;
}

function LoanCard({ loan, formatCurrency }: { loan: LoanWithInstallmentsData; formatCurrency: (amount: number) => string }) {
  const installments = loan.loan_installments || [];
  
  const paidInstallments = installments.filter(i => i.status === 'paid');
  const totalInstallments = installments.length;
  const paidAmount = paidInstallments.reduce((sum, i) => sum + i.amount, 0);
  const remainingAmount = loan.principal_amount - paidAmount;
  const progressPercent = (paidAmount / loan.principal_amount) * 100;

  const nextDueInstallment = installments.find(i => i.status === 'due');
  const config = statusConfig[loan.status] || statusConfig.requested;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <p className="font-medium">
                Loan #{loan.id.slice(0, 8).toUpperCase()}
              </p>
              <p className="text-xs text-muted-foreground">
                Started {format(new Date(loan.start_date), 'MMM d, yyyy')}
              </p>
            </div>
            <Badge variant={config.variant}>
              {config.label}
            </Badge>
          </div>

          {/* Amount */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Principal Amount</p>
              <p className="text-lg font-semibold">
                {formatCurrency(loan.principal_amount)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Outstanding Balance</p>
              <p className="text-lg font-semibold text-primary">
                {formatCurrency(remainingAmount)}
              </p>
            </div>
          </div>

          {/* Progress */}
          {loan.status === 'active' && (
            <>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Repayment Progress</span>
                  <span className="font-medium">{progressPercent.toFixed(0)}%</span>
                </div>
                <Progress value={progressPercent} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{paidInstallments.length} of {totalInstallments} payments</span>
                  <span>{formatCurrency(paidAmount)} paid</span>
                </div>
              </div>

              {/* Next Payment */}
              {nextDueInstallment && (
                <div className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-amber-600" />
                    <div>
                      <p className="text-xs text-muted-foreground">Next Payment</p>
                      <p className="text-sm font-medium">
                        {format(new Date(nextDueInstallment.due_date), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                  <p className="font-semibold text-amber-700 dark:text-amber-400">
                    {formatCurrency(nextDueInstallment.amount)}
                  </p>
                </div>
              )}
            </>
          )}

          {/* Payment History Summary */}
          {paidInstallments.length > 0 && (
            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground mb-2">Recent Payments</p>
              <div className="space-y-1">
                {paidInstallments.slice(-3).reverse().map((inst) => (
                  <div key={inst.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-3.5 w-3.5 text-green-600" />
                      <span className="text-muted-foreground">
                        {format(new Date(inst.paid_at!), 'MMM d, yyyy')}
                      </span>
                    </div>
                    <span className="font-medium">{formatCurrency(inst.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function MyProfileLoansTab({ employeeId }: MyProfileLoansTabProps) {
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const { data: loans, isLoading } = useEmployeeLoansWithInstallments(employeeId);
  const { formatCurrency } = useCompanySettings();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  const activeLoans = loans?.filter(l => ['active', 'approved'].includes(l.status)) || [];
  const pendingLoans = loans?.filter(l => l.status === 'requested') || [];
  const closedLoans = loans?.filter(l => ['closed', 'rejected', 'cancelled'].includes(l.status)) || [];

  const totalOutstanding = activeLoans.reduce((sum, loan) => sum + calculateOutstandingBalance(loan), 0);

  return (
    <div className="space-y-6">
      {/* Action Button */}
      <div className="flex justify-end">
        <Button onClick={() => setShowRequestDialog(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Request Loan
        </Button>
      </div>

      {/* Summary */}
      {(activeLoans.length > 0 || pendingLoans.length > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Wallet className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Active Loans</p>
                <p className="text-xl font-semibold">{activeLoans.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-amber-100 dark:bg-amber-950/30 rounded-lg">
                <TrendingDown className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Outstanding</p>
                <p className="text-xl font-semibold">{formatCurrency(totalOutstanding)}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-950/30 rounded-lg">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Pending Requests</p>
                <p className="text-xl font-semibold">{pendingLoans.length}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Active Loans */}
      {activeLoans.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground">Active Loans</h3>
          {activeLoans.map((loan) => (
            <LoanCard key={loan.id} loan={loan} formatCurrency={formatCurrency} />
          ))}
        </div>
      )}

      {/* Pending Loans */}
      {pendingLoans.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground">Pending Requests</h3>
          {pendingLoans.map((loan) => (
            <LoanCard key={loan.id} loan={loan} formatCurrency={formatCurrency} />
          ))}
        </div>
      )}

      {/* Closed Loans */}
      {closedLoans.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground">Loan History</h3>
          {closedLoans.slice(0, 5).map((loan) => (
            <LoanCard key={loan.id} loan={loan} formatCurrency={formatCurrency} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loans || loans.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Inbox className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground">
              No Loans
            </h3>
            <p className="text-sm text-muted-foreground/70 mt-1">
              You don't have any active or past loans.
            </p>
          </CardContent>
        </Card>
      ) : null}

      {/* Request Dialog */}
      <EmployeeRequestLoanDialog
        open={showRequestDialog}
        onOpenChange={setShowRequestDialog}
      />
    </div>
  );
}