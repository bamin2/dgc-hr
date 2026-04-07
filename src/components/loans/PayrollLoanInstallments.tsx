import { useState, useEffect } from "react";
import { useLoanInstallmentsDueForPayroll } from "@/hooks/useLoanInstallmentsDueForPayroll";
import { LoanInstallmentsSection, LoanInstallmentSelection } from "./LoanInstallmentsSection";

export interface LoanDeductionForReview {
  installmentId: string;
  employeeId: string;
  employeeName: string;
  amount: number;
  description: string;
}

interface PayrollLoanInstallmentsProps {
  payPeriodStart: string;
  payPeriodEnd: string;
  employeeIds: string[];
  onLoanDeductionsChange?: (deductions: LoanDeductionForReview[]) => void;
}

export function PayrollLoanInstallments({
  payPeriodStart,
  payPeriodEnd,
  employeeIds,
  onLoanDeductionsChange,
}: PayrollLoanInstallmentsProps) {
  const { data, isLoading } = useLoanInstallmentsDueForPayroll({
    payPeriodStart,
    payPeriodEnd,
    employeeIds,
  });

  const [selections, setSelections] = useState<Record<string, LoanInstallmentSelection>>({});

  // Initialize selections when data loads
  useEffect(() => {
    if (data) {
      const initial: Record<string, LoanInstallmentSelection> = {};
      
      data.payrollDeductions.forEach((inst) => {
        initial[inst.id] = {
          id: inst.id,
          includeInPayroll: true,
          markAsManualPaid: false,
        };
      });
      
      data.nonPayrollInstallments.forEach((inst) => {
        initial[inst.id] = {
          id: inst.id,
          includeInPayroll: false,
          markAsManualPaid: false,
        };
      });
      
      setSelections(initial);
    }
  }, [data]);

  // Emit loan deductions whenever selections or data change
  useEffect(() => {
    if (!data || !onLoanDeductionsChange) return;

    const allInstallments = [...data.payrollDeductions, ...data.nonPayrollInstallments];
    const included = allInstallments.filter(
      (inst) => selections[inst.id]?.includeInPayroll
    );

    const deductions: LoanDeductionForReview[] = included.map((inst) => ({
      installmentId: inst.id,
      employeeId: inst.employeeId,
      employeeName: inst.employeeName,
      amount: inst.amount,
      description: `Loan #${inst.installmentNumber}/${inst.totalInstallments}`,
    }));

    onLoanDeductionsChange(deductions);
  }, [selections, data, onLoanDeductionsChange]);

  return (
    <LoanInstallmentsSection
      payrollDeductions={data?.payrollDeductions || []}
      nonPayrollInstallments={data?.nonPayrollInstallments || []}
      selections={selections}
      onSelectionChange={setSelections}
      isLoading={isLoading}
    />
  );
}