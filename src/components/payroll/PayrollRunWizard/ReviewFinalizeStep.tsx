import { format } from "date-fns";
import { Building2, Calendar, Users, AlertCircle, CheckCircle, Plus, Minus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { WorkLocation } from "@/hooks/useWorkLocations";
import { PayrollRunEmployee } from "@/hooks/usePayrollRunEmployees";
import { PayrollRunAdjustment } from "@/hooks/usePayrollRunAdjustments";

interface ReviewFinalizeStepProps {
  location: WorkLocation;
  payPeriodStart: string;
  payPeriodEnd: string;
  employees: PayrollRunEmployee[];
  adjustments: PayrollRunAdjustment[];
}

export function ReviewFinalizeStep({
  location,
  payPeriodStart,
  payPeriodEnd,
  employees,
  adjustments,
}: ReviewFinalizeStepProps) {
  // Get adjustments per employee
  const getEmployeeAdjustments = (employeeId: string) => {
    return adjustments.filter(a => a.employeeId === employeeId);
  };

  // Calculate adjusted totals per employee
  const getAdjustedTotals = (emp: PayrollRunEmployee) => {
    const empAdjustments = getEmployeeAdjustments(emp.employeeId);
    const earningsAdj = empAdjustments
      .filter(a => a.type === "earning")
      .reduce((sum, a) => sum + a.amount, 0);
    const deductionsAdj = empAdjustments
      .filter(a => a.type === "deduction")
      .reduce((sum, a) => sum + a.amount, 0);

    return {
      grossPay: emp.grossPay + earningsAdj,
      totalDeductions: emp.totalDeductions + deductionsAdj,
      netPay: emp.netPay + earningsAdj - deductionsAdj,
      earningsAdjustment: earningsAdj,
      deductionsAdjustment: deductionsAdj,
    };
  };

  // Calculate overall totals with adjustments
  const totals = employees.reduce(
    (acc, emp) => {
      const adjusted = getAdjustedTotals(emp);
      return {
        grossPay: acc.grossPay + adjusted.grossPay,
        totalDeductions: acc.totalDeductions + adjusted.totalDeductions,
        netPay: acc.netPay + adjusted.netPay,
      };
    },
    { grossPay: 0, totalDeductions: 0, netPay: 0 }
  );

  // Validation checks
  const warnings: string[] = [];
  const errors: string[] = [];

  employees.forEach((emp) => {
    const adjusted = getAdjustedTotals(emp);
    if (adjusted.netPay < 0) {
      errors.push(`${emp.employeeName} has negative net pay`);
    }
    if ((emp.baseSalary || 0) === 0) {
      warnings.push(`${emp.employeeName} has no base salary configured`);
    }
  });

  if (employees.length === 0) {
    errors.push("No employees selected for this payroll run");
  }

  const hasErrors = errors.length > 0;
  const hasAdjustments = adjustments.length > 0;

  return (
    <div>
      <h2 className="text-xl font-semibold text-foreground mb-2">Review & Finalize</h2>
      <p className="text-muted-foreground mb-6">
        Review the payroll summary before finalizing.
      </p>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Gross Pay</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">
              {location.currency} {totals.grossPay.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Deductions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-destructive">
              {location.currency} {totals.totalDeductions.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Net Pay</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary">
              {location.currency} {totals.netPay.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Details */}
      <div className="bg-muted/30 rounded-lg p-4 border mb-6">
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Location:</span>
            <span className="font-medium text-foreground">{location.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Period:</span>
            <span className="font-medium text-foreground">
              {format(new Date(payPeriodStart), "MMM d")} - {format(new Date(payPeriodEnd), "MMM d, yyyy")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Employees:</span>
            <span className="font-medium text-foreground">{employees.length}</span>
          </div>
        </div>
      </div>

      {/* Adjustments Summary */}
      {hasAdjustments && (
        <div className="bg-accent/30 rounded-lg p-4 border mb-6">
          <h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
            <Plus className="h-4 w-4" />
            One-Time Adjustments Applied ({adjustments.length})
          </h4>
          <div className="space-y-1 text-sm">
            {adjustments.map((adj) => {
              const empName = employees.find(e => e.employeeId === adj.employeeId)?.employeeName || "Unknown";
              return (
                <div key={adj.id} className="flex items-center justify-between">
                  <span className="text-muted-foreground">
                    {empName}: {adj.name}
                  </span>
                  <span className={adj.type === "earning" ? "text-success" : "text-destructive"}>
                    {adj.type === "earning" ? "+" : "-"}{location.currency} {adj.amount.toLocaleString()}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Validation Messages */}
      {errors.length > 0 && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <p className="font-medium mb-1">Cannot finalize due to errors:</p>
            <ul className="list-disc list-inside text-sm">
              {errors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {warnings.length > 0 && (
        <Alert className="mb-4 border-warning bg-warning/10">
          <AlertCircle className="h-4 w-4 text-warning" />
          <AlertDescription>
            <p className="font-medium mb-1">Warnings:</p>
            <ul className="list-disc list-inside text-sm">
              {warnings.map((warn, i) => (
                <li key={i}>{warn}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {!hasErrors && warnings.length === 0 && (
        <Alert className="border-success bg-success/10">
          <CheckCircle className="h-4 w-4 text-success" />
          <AlertDescription>
            All validations passed. Ready to finalize payroll.
          </AlertDescription>
        </Alert>
      )}

      {/* Employee Breakdown */}
      <div className="mt-6">
        <h3 className="font-medium text-foreground mb-3">Employee Breakdown</h3>
        <div className="border rounded-lg divide-y max-h-[300px] overflow-y-auto">
          {employees.map((emp) => {
            const adjusted = getAdjustedTotals(emp);
            const empAdjustments = getEmployeeAdjustments(emp.employeeId);
            
            return (
              <div key={emp.id} className="p-3 text-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">{emp.employeeName}</p>
                    <p className="text-muted-foreground">{emp.department || "No department"}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-foreground">
                      {location.currency} {adjusted.netPay.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-muted-foreground">Net Pay</p>
                  </div>
                </div>
                
                {/* Show adjustments if any */}
                {empAdjustments.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-dashed space-y-1">
                    {empAdjustments.map((adj) => (
                      <div key={adj.id} className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground flex items-center gap-1">
                          {adj.type === "earning" ? (
                            <Plus className="h-3 w-3 text-success" />
                          ) : (
                            <Minus className="h-3 w-3 text-destructive" />
                          )}
                          {adj.name}
                        </span>
                        <span className={adj.type === "earning" ? "text-success" : "text-destructive"}>
                          {adj.type === "earning" ? "+" : "-"}{location.currency} {adj.amount.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
