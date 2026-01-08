import { ArrowLeft, Download, FileText } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { WorkLocation } from "@/hooks/useWorkLocations";
import { PayrollRunData } from "./PayrollRunCard";
import { PayrollRunStatusBadge } from "./PayrollRunStatusBadge";
import { usePayrollRunEmployees, PayrollRunEmployee } from "@/hooks/usePayrollRunEmployees";
import { usePayrollRunAdjustments, PayrollRunAdjustment } from "@/hooks/usePayrollRunAdjustments";

interface PayrollRegisterProps {
  run: PayrollRunData;
  location: WorkLocation;
  onBack: () => void;
  onIssuePayslips?: () => void;
}

export function PayrollRegister({
  run,
  location,
  onBack,
  onIssuePayslips,
}: PayrollRegisterProps) {
  const { data: employees = [], isLoading: employeesLoading } = usePayrollRunEmployees(run.id);
  const { data: adjustments = [] } = usePayrollRunAdjustments(run.id);

  const formatCurrency = (amount: number) =>
    `${location.currency} ${amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  // Calculate adjusted totals per employee
  const getAdjustedTotals = (emp: PayrollRunEmployee) => {
    const empAdjustments = adjustments.filter((a) => a.employeeId === emp.employeeId);
    const earningsAdj = empAdjustments
      .filter((a) => a.type === "earning")
      .reduce((sum, a) => sum + a.amount, 0);
    const deductionsAdj = empAdjustments
      .filter((a) => a.type === "deduction")
      .reduce((sum, a) => sum + a.amount, 0);

    return {
      grossPay: emp.grossPay + earningsAdj,
      totalDeductions: emp.totalDeductions + deductionsAdj,
      netPay: emp.netPay + earningsAdj - deductionsAdj,
    };
  };

  // Calculate overall totals
  const totals = employees.reduce(
    (acc, emp) => {
      const adjusted = getAdjustedTotals(emp);
      return {
        baseSalary: acc.baseSalary + emp.baseSalary,
        allowances:
          acc.allowances +
          emp.housingAllowance +
          emp.transportationAllowance +
          emp.otherAllowances.reduce((s, a) => s + a.amount, 0),
        grossPay: acc.grossPay + adjusted.grossPay,
        gosiDeduction: acc.gosiDeduction + emp.gosiDeduction,
        otherDeductions:
          acc.otherDeductions + emp.otherDeductions.reduce((s, d) => s + d.amount, 0),
        totalDeductions: acc.totalDeductions + adjusted.totalDeductions,
        netPay: acc.netPay + adjusted.netPay,
      };
    },
    {
      baseSalary: 0,
      allowances: 0,
      grossPay: 0,
      gosiDeduction: 0,
      otherDeductions: 0,
      totalDeductions: 0,
      netPay: 0,
    }
  );

  const periodLabel = format(new Date(run.payPeriodStart), "MMMM yyyy");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-foreground">
                Payroll Register - {periodLabel}
              </h2>
              <PayrollRunStatusBadge status={run.status} />
            </div>
            <p className="text-sm text-muted-foreground">
              {location.name} • {employees.length} employees
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {run.status === "finalized" && onIssuePayslips && (
            <Button onClick={onIssuePayslips} className="gap-2">
              <FileText className="h-4 w-4" />
              Issue Payslips
            </Button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Gross Pay
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">
              {formatCurrency(totals.grossPay)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Deductions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-destructive">
              {formatCurrency(totals.totalDeductions)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Net Pay
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary">
              {formatCurrency(totals.netPay)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Employee Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Employee Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          {employeesLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead className="text-right">Base Salary</TableHead>
                    <TableHead className="text-right">Allowances</TableHead>
                    <TableHead className="text-right">Gross Pay</TableHead>
                    <TableHead className="text-right">GOSI</TableHead>
                    <TableHead className="text-right">Other Ded.</TableHead>
                    <TableHead className="text-right">Net Pay</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.map((emp) => {
                    const adjusted = getAdjustedTotals(emp);
                    const totalAllowances =
                      emp.housingAllowance +
                      emp.transportationAllowance +
                      emp.otherAllowances.reduce((s, a) => s + a.amount, 0);
                    const otherDed = emp.otherDeductions.reduce((s, d) => s + d.amount, 0);

                    return (
                      <TableRow key={emp.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{emp.employeeName}</p>
                            <p className="text-xs text-muted-foreground">
                              {emp.department || "No department"}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(emp.baseSalary)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(totalAllowances)}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(adjusted.grossPay)}
                        </TableCell>
                        <TableCell className="text-right text-destructive">
                          {emp.gosiDeduction > 0 ? `-${formatCurrency(emp.gosiDeduction)}` : "-"}
                        </TableCell>
                        <TableCell className="text-right text-destructive">
                          {otherDed > 0 ? `-${formatCurrency(otherDed)}` : "-"}
                        </TableCell>
                        <TableCell className="text-right font-bold text-primary">
                          {formatCurrency(adjusted.netPay)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {/* Totals Row */}
                  <TableRow className="bg-muted/50 font-medium">
                    <TableCell>Total ({employees.length} employees)</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(totals.baseSalary)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(totals.allowances)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(totals.grossPay)}
                    </TableCell>
                    <TableCell className="text-right text-destructive">
                      -{formatCurrency(totals.gosiDeduction)}
                    </TableCell>
                    <TableCell className="text-right text-destructive">
                      -{formatCurrency(totals.otherDeductions)}
                    </TableCell>
                    <TableCell className="text-right font-bold text-primary">
                      {formatCurrency(totals.netPay)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Adjustments Section */}
      {adjustments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              One-Time Adjustments ({adjustments.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {adjustments.map((adj) => {
                  const emp = employees.find((e) => e.employeeId === adj.employeeId);
                  return (
                    <TableRow key={adj.id}>
                      <TableCell>{emp?.employeeName || "Unknown"}</TableCell>
                      <TableCell>
                        <span
                          className={`text-xs font-medium px-2 py-1 rounded-full ${
                            adj.type === "earning"
                              ? "bg-success/10 text-success"
                              : "bg-destructive/10 text-destructive"
                          }`}
                        >
                          {adj.type === "earning" ? "Earning" : "Deduction"}
                        </span>
                      </TableCell>
                      <TableCell>
                        {adj.name}
                        {adj.notes && (
                          <p className="text-xs text-muted-foreground">{adj.notes}</p>
                        )}
                      </TableCell>
                      <TableCell
                        className={`text-right font-medium ${
                          adj.type === "earning" ? "text-success" : "text-destructive"
                        }`}
                      >
                        {adj.type === "earning" ? "+" : "-"}
                        {formatCurrency(adj.amount)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
