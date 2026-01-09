import { format } from "date-fns";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Download, Printer, Building2 } from "lucide-react";
import { PayslipData } from "@/types/payslip";

interface PayslipCardProps {
  payslip: PayslipData;
}

export function PayslipCard({ payslip }: PayslipCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "decimal",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return format(new Date(dateString), "d MMM yyyy");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // TODO: Implement PDF download
    console.log("Download payslip");
  };

  return (
    <Card className="max-w-2xl mx-auto border shadow-sm print:shadow-none print:border-0">
      {/* Company Header */}
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {payslip.company.logo ? (
              <img
                src={payslip.company.logo}
                alt={payslip.company.name}
                className="h-12 w-12 object-contain"
              />
            ) : (
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
            )}
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                {payslip.company.name}
              </h2>
              <p className="text-sm text-muted-foreground">
                {payslip.company.address}
              </p>
            </div>
          </div>
          <div className="flex gap-2 print:hidden">
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-1" />
              Download
            </Button>
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-1" />
              Print
            </Button>
          </div>
        </div>
      </CardHeader>

      <Separator />

      <CardContent className="pt-6 space-y-6">
        {/* Employee Info & Pay Period */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={payslip.employee.avatar} />
              <AvatarFallback className="bg-primary/10 text-primary font-medium">
                {getInitials(payslip.employee.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-foreground">
                {payslip.employee.name}
              </h3>
              <p className="text-sm text-muted-foreground">
                {payslip.employee.department}
              </p>
              <p className="text-sm text-muted-foreground">
                {payslip.employee.position}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-foreground">Pay Period</p>
            <p className="text-sm text-muted-foreground">
              {formatDate(payslip.payPeriod.startDate)} -{" "}
              {formatDate(payslip.payPeriod.endDate)}
            </p>
            {payslip.employee.code && (
              <p className="text-sm text-muted-foreground mt-1">
                Employee ID: {payslip.employee.code}
              </p>
            )}
          </div>
        </div>

        <Separator />

        {/* Earnings Section */}
        <div>
          <h4 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-3">
            Earnings
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Base Salary</span>
              <span className="text-foreground font-medium">
                {payslip.currency} {formatCurrency(payslip.earnings.baseSalary)}
              </span>
            </div>

            {payslip.earnings.housingAllowance > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Housing Allowance</span>
                <span className="text-foreground">
                  {payslip.currency} {formatCurrency(payslip.earnings.housingAllowance)}
                </span>
              </div>
            )}

            {payslip.earnings.transportationAllowance > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Transportation Allowance</span>
                <span className="text-foreground">
                  {payslip.currency} {formatCurrency(payslip.earnings.transportationAllowance)}
                </span>
              </div>
            )}

            {payslip.earnings.otherAllowances.map((allowance, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{allowance.name}</span>
                <span className="text-foreground">
                  {payslip.currency} {formatCurrency(allowance.amount)}
                </span>
              </div>
            ))}

            <Separator className="my-2" />

            <div className="flex justify-between text-sm font-semibold">
              <span className="text-foreground">Gross Pay</span>
              <span className="text-foreground">
                {payslip.currency} {formatCurrency(payslip.earnings.grossPay)}
              </span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Deductions Section */}
        <div>
          <h4 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-3">
            Deductions
          </h4>
          <div className="space-y-2">
            {payslip.deductions.gosiContribution > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">GOSI Contribution</span>
                <span className="text-destructive">
                  - {payslip.currency} {formatCurrency(payslip.deductions.gosiContribution)}
                </span>
              </div>
            )}

            {payslip.deductions.otherDeductions.map((deduction, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{deduction.name}</span>
                <span className="text-destructive">
                  - {payslip.currency} {formatCurrency(deduction.amount)}
                </span>
              </div>
            ))}

            {payslip.deductions.totalDeductions > 0 && (
              <>
                <Separator className="my-2" />
                <div className="flex justify-between text-sm font-semibold">
                  <span className="text-foreground">Total Deductions</span>
                  <span className="text-destructive">
                    - {payslip.currency} {formatCurrency(payslip.deductions.totalDeductions)}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        <Separator />

        {/* Net Pay */}
        <div className="bg-primary/5 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-foreground">Net Pay</span>
            <span className="text-2xl font-bold text-primary">
              {payslip.currency} {formatCurrency(payslip.netPay)}
            </span>
          </div>
        </div>

        {/* Footer */}
        <p className="text-xs text-center text-muted-foreground pt-4">
          This is a computer-generated payslip and does not require a signature.
        </p>
      </CardContent>
    </Card>
  );
}
