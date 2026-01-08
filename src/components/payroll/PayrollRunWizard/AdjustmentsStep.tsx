import { useState } from "react";
import { Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { PayrollRunEmployee } from "@/hooks/usePayrollRunEmployees";
import { usePayrollRunAdjustments } from "@/hooks/usePayrollRunAdjustments";
import { PayrollLoanInstallments } from "@/components/loans/PayrollLoanInstallments";

interface AdjustmentsStepProps {
  runId: string | null;
  employees: PayrollRunEmployee[];
  payPeriodStart?: string;
  payPeriodEnd?: string;
}

export function AdjustmentsStep({ runId, employees, payPeriodStart, payPeriodEnd }: AdjustmentsStepProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [expandedEmployee, setExpandedEmployee] = useState<string | null>(null);
  const [newAdjustment, setNewAdjustment] = useState({
    employeeId: "",
    type: "earning" as "earning" | "deduction",
    name: "",
    amount: "",
    notes: "",
  });

  const {
    data: adjustments = [],
    addAdjustment,
    removeAdjustment,
  } = usePayrollRunAdjustments(runId);

  const handleAddAdjustment = async () => {
    if (!runId || !newAdjustment.employeeId || !newAdjustment.name || !newAdjustment.amount) {
      return;
    }

    await addAdjustment({
      employeeId: newAdjustment.employeeId,
      type: newAdjustment.type,
      name: newAdjustment.name,
      amount: parseFloat(newAdjustment.amount),
      notes: newAdjustment.notes || undefined,
    });

    setNewAdjustment({
      employeeId: "",
      type: "earning",
      name: "",
      amount: "",
      notes: "",
    });
    setDialogOpen(false);
  };

  const getEmployeeName = (employeeId: string) => {
    const emp = employees.find((e) => e.employeeId === employeeId);
    return emp?.employeeName || "Unknown Employee";
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className="space-y-6">
      {/* Employee Breakdown Section */}
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-2">Employee Salary Breakdown</h2>
        <p className="text-muted-foreground mb-4">
          Review each employee's salary components before adding adjustments
        </p>

        <div className="border rounded-lg divide-y max-h-[300px] overflow-y-auto">
          {employees.map((emp) => {
            const isExpanded = expandedEmployee === emp.employeeId;
            const totalAllowances = (emp.housingAllowance || 0) + 
              (emp.transportationAllowance || 0) + 
              (emp.otherAllowances?.reduce((sum, a) => sum + a.amount, 0) || 0);
            const totalDeductions = (emp.gosiDeduction || 0) + 
              (emp.otherDeductions?.reduce((sum, d) => sum + d.amount, 0) || 0);

            return (
              <Collapsible
                key={emp.employeeId}
                open={isExpanded}
                onOpenChange={(open) => setExpandedEmployee(open ? emp.employeeId : null)}
              >
                <CollapsibleTrigger asChild>
                  <div className="flex items-center justify-between p-4 hover:bg-muted/50 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="font-medium text-foreground">{emp.employeeName}</p>
                        <p className="text-sm text-muted-foreground">
                          {emp.employeeCode || 'No code'} • {emp.department || 'No department'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-semibold text-foreground">{formatCurrency(emp.netPay || 0)}</p>
                        <p className="text-xs text-muted-foreground">Net Salary</p>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="px-4 pb-4 pt-0 bg-muted/20">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {/* Earnings Column */}
                      <div className="space-y-2">
                        <p className="font-medium text-foreground border-b pb-1">Earnings</p>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Base Salary</span>
                          <span className="text-foreground">{formatCurrency(emp.baseSalary || 0)}</span>
                        </div>
                        {(emp.housingAllowance || 0) > 0 && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Housing Allowance</span>
                            <span className="text-foreground">{formatCurrency(emp.housingAllowance || 0)}</span>
                          </div>
                        )}
                        {(emp.transportationAllowance || 0) > 0 && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Transportation</span>
                            <span className="text-foreground">{formatCurrency(emp.transportationAllowance || 0)}</span>
                          </div>
                        )}
                        {emp.otherAllowances?.map((a, i) => (
                          <div key={i} className="flex justify-between">
                            <span className="text-muted-foreground">{a.name}</span>
                            <span className="text-foreground">{formatCurrency(a.amount)}</span>
                          </div>
                        ))}
                        <div className="flex justify-between font-medium border-t pt-1">
                          <span className="text-foreground">Gross Pay</span>
                          <span className="text-foreground">{formatCurrency(emp.grossPay || 0)}</span>
                        </div>
                      </div>

                      {/* Deductions Column */}
                      <div className="space-y-2">
                        <p className="font-medium text-foreground border-b pb-1">Deductions</p>
                        {(emp.gosiDeduction || 0) > 0 && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">GOSI</span>
                            <span className="text-destructive">-{formatCurrency(emp.gosiDeduction || 0)}</span>
                          </div>
                        )}
                        {emp.otherDeductions?.map((d, i) => (
                          <div key={i} className="flex justify-between">
                            <span className="text-muted-foreground">{d.name}</span>
                            <span className="text-destructive">-{formatCurrency(d.amount)}</span>
                          </div>
                        ))}
                        {totalDeductions === 0 && (
                          <p className="text-muted-foreground italic">No deductions</p>
                        )}
                        <div className="flex justify-between font-medium border-t pt-1">
                          <span className="text-foreground">Total Deductions</span>
                          <span className="text-destructive">-{formatCurrency(totalDeductions)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </div>
      </div>

      {/* One-time Adjustments Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-foreground">One-time Adjustments</h2>
            <p className="text-muted-foreground">
              Add bonuses, overtime, or deductions for this pay period only
            </p>
          </div>
          <Button onClick={() => setDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Adjustment
          </Button>
        </div>

        {adjustments.length === 0 ? (
          <div className="text-center py-8 border rounded-lg bg-muted/30">
            <p className="text-muted-foreground">
              No adjustments added yet. Click "Add Adjustment" to add bonuses, overtime, or deductions.
            </p>
          </div>
        ) : (
          <div className="border rounded-lg divide-y">
            {adjustments.map((adj) => (
              <div key={adj.id} className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium text-foreground">{adj.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {getEmployeeName(adj.employeeId)}
                    {adj.notes && ` • ${adj.notes}`}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span
                    className={`font-semibold ${
                      adj.type === "earning" ? "text-success" : "text-destructive"
                    }`}
                  >
                    {adj.type === "earning" ? "+" : "-"}
                    {adj.amount.toLocaleString()}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeAdjustment(adj.id)}
                  >
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Loan Installments Section */}
      {payPeriodStart && payPeriodEnd && (
        <PayrollLoanInstallments
          payPeriodStart={payPeriodStart}
          payPeriodEnd={payPeriodEnd}
          employeeIds={employees.map((e) => e.employeeId)}
        />
      )}

      {/* Add Adjustment Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Adjustment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Employee</Label>
              <Select
                value={newAdjustment.employeeId}
                onValueChange={(v) => setNewAdjustment({ ...newAdjustment, employeeId: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((emp) => (
                    <SelectItem key={emp.employeeId} value={emp.employeeId}>
                      {emp.employeeName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={newAdjustment.type}
                onValueChange={(v: "earning" | "deduction") =>
                  setNewAdjustment({ ...newAdjustment, type: v })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="earning">Earning (Bonus, Overtime, etc.)</SelectItem>
                  <SelectItem value="deduction">Deduction (Advance, Penalty, etc.)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                placeholder="e.g., Performance Bonus"
                value={newAdjustment.name}
                onChange={(e) => setNewAdjustment({ ...newAdjustment, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Amount</Label>
              <Input
                type="number"
                placeholder="0"
                value={newAdjustment.amount}
                onChange={(e) => setNewAdjustment({ ...newAdjustment, amount: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Notes (optional)</Label>
              <Input
                placeholder="Additional notes..."
                value={newAdjustment.notes}
                onChange={(e) => setNewAdjustment({ ...newAdjustment, notes: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddAdjustment}>Add Adjustment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
