import { useState } from "react";
import { format } from "date-fns";
import { Banknote, Calendar, CreditCard, TrendingDown, ChevronDown, ChevronRight, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Skeleton } from "@/components/ui/skeleton";
import { useEmployeeLoansWithInstallments } from "@/hooks/useEmployeeLoansWithInstallments";
import { useCompanySettings } from "@/contexts/CompanySettingsContext";
import { LoanStatusBadge } from "@/components/loans/LoanStatusBadge";
import { LoanInstallmentsTable } from "@/components/loans/LoanInstallmentsTable";
import { cn } from "@/lib/utils";

interface EmployeeLoansTabProps {
  employeeId: string;
}

export function EmployeeLoansTab({ employeeId }: EmployeeLoansTabProps) {
  const { formatCurrency } = useCompanySettings();
  const { data: loans, isLoading } = useEmployeeLoansWithInstallments(employeeId);
  const [expandedLoans, setExpandedLoans] = useState<Set<string>>(new Set());

  const toggleLoan = (loanId: string) => {
    setExpandedLoans((prev) => {
      const next = new Set(prev);
      if (next.has(loanId)) {
        next.delete(loanId);
      } else {
        next.add(loanId);
      }
      return next;
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-48" />
      </div>
    );
  }

  const activeLoans = loans?.filter((l) => l.status === 'active') || [];
  const closedLoans = loans?.filter((l) => l.status === 'closed') || [];

  // Calculate summary stats
  const totalBorrowed = loans?.reduce((sum, l) => sum + l.principal_amount, 0) || 0;
  const outstandingBalance = activeLoans.reduce((sum, loan) => {
    const unpaid = (loan.loan_installments || [])
      .filter((i) => i.status === 'due')
      .reduce((s, i) => s + i.amount, 0);
    return sum + unpaid;
  }, 0);

  // Find next payment
  const today = new Date().toISOString().split('T')[0];
  let nextPayment: { date: string; amount: number } | null = null;
  for (const loan of activeLoans) {
    const pending = (loan.loan_installments || [])
      .filter((i) => i.status === 'due' && i.due_date >= today)
      .sort((a, b) => a.due_date.localeCompare(b.due_date));
    if (pending.length > 0) {
      if (!nextPayment || pending[0].due_date < nextPayment.date) {
        nextPayment = { date: pending[0].due_date, amount: pending[0].amount };
      }
    }
  }

  // Collect all paid installments for payment history
  const allPaidInstallments = loans?.flatMap((loan) =>
    (loan.loan_installments || [])
      .filter((i) => i.status === 'paid')
      .map((i) => ({ ...i, loanPrincipal: loan.principal_amount }))
  ).sort((a, b) => (b.paid_at || b.due_date).localeCompare(a.paid_at || a.due_date)) || [];

  if (!loans || loans.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Banknote className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No Loans Found</h3>
          <p className="text-sm text-muted-foreground mt-1">
            This employee has no loan records.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Borrowed</CardTitle>
            <Banknote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalBorrowed)}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding Balance</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(outstandingBalance)}</div>
            <p className="text-xs text-muted-foreground">Remaining to pay</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Loans</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeLoans.length}</div>
            <p className="text-xs text-muted-foreground">
              {closedLoans.length} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Payment</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {nextPayment ? (
              <>
                <div className="text-2xl font-bold">{formatCurrency(nextPayment.amount)}</div>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(nextPayment.date), 'MMM d, yyyy')}
                </p>
              </>
            ) : (
              <>
                <div className="text-2xl font-bold">—</div>
                <p className="text-xs text-muted-foreground">No upcoming payments</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Active Loans */}
      {activeLoans.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Active Loans</h3>
          {activeLoans.map((loan) => {
            const installments = loan.loan_installments || [];
            const paidCount = installments.filter((i) => i.status === 'paid').length;
            const totalCount = installments.length;
            const progress = totalCount > 0 ? (paidCount / totalCount) * 100 : 0;
            const isExpanded = expandedLoans.has(loan.id);

            return (
              <Collapsible key={loan.id} open={isExpanded} onOpenChange={() => toggleLoan(loan.id)}>
                <Card>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          )}
                          <div>
                            <CardTitle className="text-base">
                              Loan - {formatCurrency(loan.principal_amount)}
                            </CardTitle>
                            <p className="text-sm text-muted-foreground mt-1">
                              Started {format(new Date(loan.start_date), 'MMM d, yyyy')} • {formatCurrency(loan.installment_amount || 0)}/mo
                            </p>
                          </div>
                        </div>
                        <LoanStatusBadge status={loan.status} />
                      </div>
                      <div className="mt-4 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Repayment Progress</span>
                          <span>{paidCount}/{totalCount} installments ({Math.round(progress)}%)</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="pt-0">
                      <LoanInstallmentsTable
                        installments={installments}
                        canMarkPaid={false}
                        canSkip={false}
                      />
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            );
          })}
        </div>
      )}

      {/* Closed Loans */}
      {closedLoans.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Loan History</h3>
          {closedLoans.map((loan) => (
            <Card key={loan.id} className="bg-muted/30">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">
                      Loan - {formatCurrency(loan.principal_amount)}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Started {format(new Date(loan.start_date), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <LoanStatusBadge status={loan.status} />
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      {/* Payment History */}
      {allPaidInstallments.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Payment History</h3>
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {allPaidInstallments.slice(0, 10).map((installment, index) => (
                  <div
                    key={installment.id}
                    className={cn(
                      "flex items-start gap-4 pb-4",
                      index < allPaidInstallments.slice(0, 10).length - 1 && "border-b"
                    )}
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                      <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">
                          Paid {formatCurrency(installment.amount)}
                        </p>
                        <span className="text-sm text-muted-foreground">
                          {installment.paid_at
                            ? format(new Date(installment.paid_at), 'MMM d, yyyy')
                            : format(new Date(installment.due_date), 'MMM d, yyyy')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-muted-foreground">
                          {installment.paid_method === 'payroll' ? 'Via Payroll' : 'Manual Payment'}
                        </span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-sm text-muted-foreground">
                          Loan: {formatCurrency(installment.loanPrincipal)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                {allPaidInstallments.length > 10 && (
                  <p className="text-sm text-muted-foreground text-center pt-2">
                    And {allPaidInstallments.length - 10} more payments...
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
