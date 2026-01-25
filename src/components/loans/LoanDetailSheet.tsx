import { useState } from "react";
import { formatDisplayDate } from "@/lib/dateUtils";
import { CheckCircle, XCircle, Banknote, User, FileText, Trash2, CreditCard, RefreshCw, History } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoanStatusBadge } from "./LoanStatusBadge";
import { LoanInstallmentsTable } from "./LoanInstallmentsTable";
import { DeleteLoanDialog } from "./DeleteLoanDialog";
import { AdHocPaymentDialog } from "./AdHocPaymentDialog";
import { RestructureLoanDialog } from "./RestructureLoanDialog";
import { SkipInstallmentDialog } from "./SkipInstallmentDialog";
import { LoanEventsTimeline } from "./LoanEventsTimeline";
import { LoanApprovalDialog } from "./LoanApprovalDialog";
import { useLoan, useDisburseLoan, useMarkInstallmentPaid, Loan, LoanInstallment } from "@/hooks/useLoans";
import { toast } from "sonner";
import { useCompanySettings } from "@/contexts/CompanySettingsContext";

interface LoanDetailSheetProps {
  loanId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LoanDetailSheet({ loanId, open, onOpenChange }: LoanDetailSheetProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [restructureDialogOpen, setRestructureDialogOpen] = useState(false);
  const [skipDialogOpen, setSkipDialogOpen] = useState(false);
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [selectedInstallment, setSelectedInstallment] = useState<LoanInstallment | null>(null);
  
  const { data: loan, isLoading } = useLoan(loanId);
  const disburseLoan = useDisburseLoan();
  const markPaid = useMarkInstallmentPaid();
  const { formatCurrency } = useCompanySettings();

  const handleDisburse = async () => {
    if (!loanId) return;
    try {
      await disburseLoan.mutateAsync(loanId);
      toast.success("Loan disbursed and installments generated");
    } catch (error) {
      toast.error("Failed to disburse loan");
    }
  };

  const handleMarkPaid = async (installmentId: string) => {
    try {
      await markPaid.mutateAsync({ installmentId, method: "manual", loanId: loanId! });
      toast.success("Installment marked as paid");
    } catch (error) {
      toast.error("Failed to mark installment as paid");
    }
  };

  const handleSkipInstallment = (installment: LoanInstallment) => {
    setSelectedInstallment(installment);
    setSkipDialogOpen(true);
  };

  if (!loan && !isLoading) {
    return null;
  }

  const paidInstallments = loan?.installments?.filter(i => i.status === "paid").length || 0;
  const totalInstallments = loan?.installments?.length || 0;
  const paidAmount = loan?.installments
    ?.filter(i => i.status === "paid")
    .reduce((sum, i) => sum + i.amount, 0) || 0;
  const outstandingBalance = (loan?.principal_amount || 0) - paidAmount;
  const progressPercent = totalInstallments > 0 ? (paidInstallments / totalInstallments) * 100 : 0;

  const employeeName = loan?.employee?.full_name || 
    `${loan?.employee?.first_name || ""} ${loan?.employee?.last_name || ""}`.trim();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Banknote className="h-5 w-5" />
            Loan Details
          </SheetTitle>
          <SheetDescription>
            View and manage loan information
          </SheetDescription>
        </SheetHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : loan ? (
          <div className="mt-6 space-y-6">
            {/* Status and Actions */}
            <div className="flex items-center justify-between">
              <LoanStatusBadge status={loan.status} />
              <div className="flex gap-2">
                {loan.status === "requested" && (
                  <Button 
                    size="sm" 
                    onClick={() => setApprovalDialogOpen(true)}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Review
                  </Button>
                )}
                {loan.status === "active" && (
                  <>
                    <Button 
                      size="sm"
                      variant="outline"
                      onClick={() => setRestructureDialogOpen(true)}
                    >
                      <RefreshCw className="h-4 w-4 mr-1" />
                      Restructure
                    </Button>
                    <Button 
                      size="sm"
                      variant="outline"
                      onClick={() => setPaymentDialogOpen(true)}
                    >
                      <CreditCard className="h-4 w-4 mr-1" />
                      Payment
                    </Button>
                  </>
                )}
                {loan.status === "approved" && (
                  <Button 
                    size="sm"
                    onClick={handleDisburse}
                    disabled={disburseLoan.isPending}
                  >
                    <Banknote className="h-4 w-4 mr-1" />
                    Disburse
                  </Button>
                )}
              </div>
            </div>

            {/* Employee Info */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <User className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">{employeeName}</p>
                <p className="text-sm text-muted-foreground">Borrower</p>
              </div>
            </div>

            {/* Loan Summary */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Loan Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Principal Amount</p>
                    <p className="text-lg font-semibold">{formatCurrency(loan.principal_amount)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Installment</p>
                    <p className="text-lg font-semibold">
                      {loan.installment_amount ? formatCurrency(loan.installment_amount) : "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Duration</p>
                    <p className="font-medium">{loan.duration_months} months</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Start Date</p>
                    <p className="font-medium">{formatDisplayDate(loan.start_date)}</p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Payroll Deduction</span>
                    <Badge variant={loan.deduct_from_payroll ? "default" : "outline"}>
                      {loan.deduct_from_payroll ? "Yes" : "No"}
                    </Badge>
                  </div>
                  {loan.disbursed_at && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Disbursed</span>
                      <span>{formatDisplayDate(loan.disbursed_at)}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Progress (only for active/closed loans) */}
            {(loan.status === "active" || loan.status === "closed") && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Repayment Progress</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Progress value={progressPercent} className="h-2" />
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Paid</p>
                      <p className="font-medium">{formatCurrency(paidAmount)}</p>
                      <p className="text-xs text-muted-foreground">
                        {paidInstallments} of {totalInstallments} installments
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Outstanding</p>
                      <p className="font-medium">{formatCurrency(outstandingBalance)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Notes */}
            {loan.notes && (
              <div className="p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm font-medium">Notes</p>
                </div>
                <p className="text-sm text-muted-foreground">{loan.notes}</p>
              </div>
            )}

            {/* Installments & History Tabs */}
            {loan.installments && loan.installments.length > 0 && (
              <Tabs defaultValue="schedule" className="w-full">
                <TabsList>
                  <TabsTrigger value="schedule">Installment Schedule</TabsTrigger>
                  <TabsTrigger value="history">
                    <History className="h-4 w-4" />
                    History
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="schedule" className="mt-4">
                  <LoanInstallmentsTable 
                    installments={loan.installments}
                    canMarkPaid={loan.status === "active"}
                    canSkip={loan.status === "active"}
                    onMarkPaid={handleMarkPaid}
                    onSkip={handleSkipInstallment}
                  />
                </TabsContent>
                <TabsContent value="history" className="mt-4">
                  <LoanEventsTimeline loanId={loan.id} />
                </TabsContent>
              </Tabs>
            )}

            {/* Danger Zone - Delete Loan */}
            {loan && !["closed"].includes(loan.status) && (
              <div className="mt-6 pt-6 border-t border-destructive/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-destructive">Delete Loan</p>
                    <p className="text-sm text-muted-foreground">
                      Permanently remove this loan record
                    </p>
                  </div>
                  <Button 
                    variant="destructive"
                    size="sm"
                    onClick={() => setDeleteDialogOpen(true)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </SheetContent>

      {/* Delete Dialog */}
      <DeleteLoanDialog
        loan={loan ? { ...loan, employee: loan.employee } as Loan : null}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onDeleted={() => onOpenChange(false)}
      />

      {/* Ad Hoc Payment Dialog */}
      <AdHocPaymentDialog
        loan={loan || null}
        open={paymentDialogOpen}
        onOpenChange={setPaymentDialogOpen}
      />

      {/* Restructure Dialog */}
      <RestructureLoanDialog
        loan={loan || null}
        open={restructureDialogOpen}
        onOpenChange={setRestructureDialogOpen}
      />

      {/* Skip Installment Dialog */}
      {loan && (
        <SkipInstallmentDialog
          installment={selectedInstallment}
          loanId={loan.id}
          open={skipDialogOpen}
          onOpenChange={setSkipDialogOpen}
        />
      )}

      {/* Approval Dialog */}
      <LoanApprovalDialog
        loan={loan ? { ...loan, employee: loan.employee } as Loan : null}
        open={approvalDialogOpen}
        onOpenChange={setApprovalDialogOpen}
      />
    </Sheet>
  );
}
