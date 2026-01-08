import { useState } from "react";
import { format } from "date-fns";
import { Banknote, AlertCircle, CheckCircle, SkipForward } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { InstallmentDueForPayroll } from "@/hooks/useLoanInstallmentsDueForPayroll";
import { useSkipInstallment } from "@/hooks/useLoanEvents";
import { toast } from "sonner";

export interface LoanInstallmentSelection {
  id: string;
  includeInPayroll: boolean;
  markAsManualPaid: boolean;
}

interface LoanInstallmentsSectionProps {
  payrollDeductions: InstallmentDueForPayroll[];
  nonPayrollInstallments: InstallmentDueForPayroll[];
  selections: Record<string, LoanInstallmentSelection>;
  onSelectionChange: (selections: Record<string, LoanInstallmentSelection>) => void;
  isLoading?: boolean;
}

export function LoanInstallmentsSection({
  payrollDeductions,
  nonPayrollInstallments,
  selections,
  onSelectionChange,
  isLoading,
}: LoanInstallmentsSectionProps) {
  const [isPayrollExpanded, setIsPayrollExpanded] = useState(true);
  const [isNonPayrollExpanded, setIsNonPayrollExpanded] = useState(true);
  const skipInstallment = useSkipInstallment();

  const formatCurrency = (amount: number, currency: string = "SAR") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const handleSkipInstallment = async (inst: InstallmentDueForPayroll) => {
    try {
      await skipInstallment.mutateAsync({
        installmentId: inst.id,
        loanId: inst.loanId,
        reason: "Skipped during payroll",
      });
      toast.success("Installment skipped and rescheduled to end of loan");
    } catch (error) {
      toast.error("Failed to skip installment");
    }
  };

  const handleTogglePayrollInclusion = (id: string, checked: boolean) => {
    onSelectionChange({
      ...selections,
      [id]: {
        ...selections[id],
        id,
        includeInPayroll: checked,
        markAsManualPaid: false,
      },
    });
  };

  const handleToggleManualPaid = (id: string, checked: boolean) => {
    onSelectionChange({
      ...selections,
      [id]: {
        ...selections[id],
        id,
        includeInPayroll: false,
        markAsManualPaid: checked,
      },
    });
  };

  const includedDeductions = payrollDeductions.filter(
    (inst) => selections[inst.id]?.includeInPayroll !== false
  );
  const totalPayrollDeductions = includedDeductions.reduce((sum, inst) => sum + inst.amount, 0);
  const primaryCurrency = includedDeductions[0]?.currency || payrollDeductions[0]?.currency || "SAR";

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Banknote className="h-5 w-5" />
            Loan Installments Due This Period
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (payrollDeductions.length === 0 && nonPayrollInstallments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Banknote className="h-5 w-5" />
            Loan Installments Due This Period
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            No loan installments due for this payroll period.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Banknote className="h-5 w-5" />
          Loan Installments Due This Period
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Group A: Payroll Deductions */}
        {payrollDeductions.length > 0 && (
          <Collapsible open={isPayrollExpanded} onOpenChange={setIsPayrollExpanded}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="default" className="bg-emerald-500">
                  Payroll Deductions
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {payrollDeductions.length} installment(s) • Total: {formatCurrency(totalPayrollDeductions, primaryCurrency)}
                </span>
              </div>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm">
                  {isPayrollExpanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
            </div>

            <CollapsibleContent className="mt-3 space-y-2">
              <p className="text-sm text-muted-foreground mb-3">
                These installments will be deducted from payroll and appear on payslips.
              </p>
              {payrollDeductions.map((inst) => {
                const isIncluded = selections[inst.id]?.includeInPayroll !== false;
                return (
                  <div
                    key={inst.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card"
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox
                        id={`payroll-${inst.id}`}
                        checked={isIncluded}
                        onCheckedChange={(checked) =>
                          handleTogglePayrollInclusion(inst.id, checked as boolean)
                        }
                      />
                      <Label htmlFor={`payroll-${inst.id}`} className="cursor-pointer">
                        <div>
                          <p className="font-medium">{inst.employeeName}</p>
                          <p className="text-sm text-muted-foreground">
                            Installment #{inst.installmentNumber} of {inst.totalInstallments} •
                            Due: {format(new Date(inst.dueDate), "MMM d, yyyy")}
                          </p>
                        </div>
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(inst.amount, inst.currency)}</p>
                        <p className="text-xs text-muted-foreground">
                          Loan: {formatCurrency(inst.principalAmount, inst.currency)}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-xs"
                        onClick={() => handleSkipInstallment(inst)}
                        disabled={skipInstallment.isPending}
                      >
                        <SkipForward className="h-3 w-3 mr-1" />
                        Skip
                      </Button>
                    </div>
                  </div>
                );
              })}
            </CollapsibleContent>
          </Collapsible>
        )}

        {payrollDeductions.length > 0 && nonPayrollInstallments.length > 0 && (
          <Separator />
        )}

        {/* Group B: Non-Payroll Installments */}
        {nonPayrollInstallments.length > 0 && (
          <Collapsible open={isNonPayrollExpanded} onOpenChange={setIsNonPayrollExpanded}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline">Not Deducted from Payroll</Badge>
                <span className="text-sm text-muted-foreground">
                  {nonPayrollInstallments.length} installment(s)
                </span>
              </div>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm">
                  {isNonPayrollExpanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
            </div>

            <CollapsibleContent className="mt-3 space-y-2">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  These installments are due but will NOT be deducted from payroll. 
                  You can optionally mark them as manually paid.
                </AlertDescription>
              </Alert>
              {nonPayrollInstallments.map((inst) => {
                const isMarkedPaid = selections[inst.id]?.markAsManualPaid === true;
                return (
                  <div
                    key={inst.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-muted/30"
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox
                        id={`manual-${inst.id}`}
                        checked={isMarkedPaid}
                        onCheckedChange={(checked) =>
                          handleToggleManualPaid(inst.id, checked as boolean)
                        }
                      />
                      <Label htmlFor={`manual-${inst.id}`} className="cursor-pointer">
                        <div>
                          <p className="font-medium">{inst.employeeName}</p>
                          <p className="text-sm text-muted-foreground">
                            Installment #{inst.installmentNumber} of {inst.totalInstallments} •
                            Due: {format(new Date(inst.dueDate), "MMM d, yyyy")}
                          </p>
                        </div>
                      </Label>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(inst.amount, inst.currency)}</p>
                      {isMarkedPaid && (
                        <div className="flex items-center gap-1 text-xs text-emerald-600">
                          <CheckCircle className="h-3 w-3" />
                          Will mark paid
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </CollapsibleContent>
          </Collapsible>
        )}
      </CardContent>
    </Card>
  );
}
