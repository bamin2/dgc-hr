import { useState, useEffect } from "react";
import { useLoanInstallmentsDueForPayroll } from "@/hooks/useLoanInstallmentsDueForPayroll";
import { LoanInstallmentsSection, LoanInstallmentSelection } from "./LoanInstallmentsSection";

interface PayrollLoanInstallmentsProps {
  payPeriodStart: string;
  payPeriodEnd: string;
  employeeIds: string[];
}

export function PayrollLoanInstallments({
  payPeriodStart,
  payPeriodEnd,
  employeeIds,
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
      
      // Default payroll deductions to included
      data.payrollDeductions.forEach((inst) => {
        initial[inst.id] = {
          id: inst.id,
          includeInPayroll: true,
          markAsManualPaid: false,
        };
      });
      
      // Default non-payroll to not marked paid
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
