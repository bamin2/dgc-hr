import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
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
import { PayrollRunEmployee } from "@/hooks/usePayrollRunEmployees";
import { usePayrollRunAdjustments } from "@/hooks/usePayrollRunAdjustments";

interface AdjustmentsStepProps {
  runId: string | null;
  employees: PayrollRunEmployee[];
}

export function AdjustmentsStep({ runId, employees }: AdjustmentsStepProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
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

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Adjustments</h2>
          <p className="text-muted-foreground">
            Add one-off earnings or deductions for this pay period
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Adjustment
        </Button>
      </div>

      {adjustments.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-muted/30">
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
