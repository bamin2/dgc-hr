import { useState, useMemo } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useActiveAllowanceTemplatesByLocation } from "@/hooks/useAllowanceTemplates";
import { useActiveDeductionTemplatesByLocation } from "@/hooks/useDeductionTemplates";
import { useWorkLocations } from "@/hooks/useWorkLocations";
import { getCurrencyByCode } from "@/data/currencies";
import { Plus, X, Info } from "lucide-react";
import { AddAllowanceDialog, AllowanceEntry } from "./AddAllowanceDialog";
import { AddDeductionDialog, DeductionEntry } from "./AddDeductionDialog";

export interface TeamCompensationData {
  salary: string;
  currency: string;
  employmentStatus: "full_time" | "part_time";
  allowances: AllowanceEntry[];
  deductions: DeductionEntry[];
  isSubjectToGosi: boolean;
  gosiRegisteredSalary: string;
}

interface TeamCompensationStepProps {
  data: TeamCompensationData;
  onChange: (data: TeamCompensationData) => void;
  workLocationId: string;
  isBahraini: boolean;
}

export function TeamCompensationStep({
  data,
  onChange,
  workLocationId,
  isBahraini,
}: TeamCompensationStepProps) {
  const [showAllowanceDialog, setShowAllowanceDialog] = useState(false);
  const [showDeductionDialog, setShowDeductionDialog] = useState(false);

  const { data: allowanceTemplates } = useActiveAllowanceTemplatesByLocation(workLocationId || null);
  const { data: deductionTemplates } = useActiveDeductionTemplatesByLocation(workLocationId || null);
  const { data: workLocations } = useWorkLocations();

  const workLocation = workLocations?.find((w) => w.id === workLocationId);
  const currency = getCurrencyByCode(data.currency) || getCurrencyByCode("USD");

  const baseSalary = parseFloat(data.salary) || 0;

  // Calculate allowance amounts
  const { totalAllowances, allowanceBreakdown } = useMemo(() => {
    let total = 0;
    const breakdown = data.allowances.map((a) => {
      let amount = 0;
      let name = a.customName || "";
      let isVariable = false;

      if (a.isCustom) {
        amount = a.amount;
        name = a.customName || "Custom Allowance";
        isVariable = true; // Custom allowances are always editable
      } else {
        const template = allowanceTemplates?.find((t) => t.id === a.templateId);
        if (template) {
          name = template.name;
          isVariable = template.is_variable ?? false;
          
          // Use the stored amount from AllowanceEntry (which could be employee-specific)
          // For fixed templates, this equals template.default_amount
          // For variable templates, this is the employee-specific value
          if (template.amount_type === "fixed") {
            amount = a.amount || template.default_amount || template.amount;
          } else {
            // Percentage-based
            const percentValue = a.amount || template.default_amount || template.amount;
            const base =
              template.percentage_of === "base_salary" ? baseSalary : baseSalary;
            amount = (base * percentValue) / 100;
          }
        }
      }

      total += amount;
      return { ...a, calculatedAmount: amount, displayName: name, isVariable };
    });

    return { totalAllowances: total, allowanceBreakdown: breakdown };
  }, [data.allowances, allowanceTemplates, baseSalary]);

  const totalGrossPay = baseSalary + totalAllowances;

  // Calculate deduction amounts
  const { totalDeductions, deductionBreakdown } = useMemo(() => {
    let total = 0;
    const breakdown = data.deductions.map((d) => {
      let amount = 0;
      let name = d.customName || "";

      if (d.isCustom) {
        amount = d.amount;
        name = d.customName || "Custom Deduction";
      } else {
        const template = deductionTemplates?.find((t) => t.id === d.templateId);
        if (template) {
          name = template.name;
          if (template.amount_type === "fixed") {
            amount = template.amount;
          } else {
            // Percentage-based - calculate from gross
            const base =
              template.percentage_of === "base_salary"
                ? baseSalary
                : totalGrossPay;
            amount = (base * template.amount) / 100;
          }
        }
      }

      total += amount;
      return { ...d, calculatedAmount: amount, displayName: name };
    });

    return { totalDeductions: total, deductionBreakdown: breakdown };
  }, [data.deductions, deductionTemplates, baseSalary, totalGrossPay]);

  const totalNetPay = totalGrossPay - totalDeductions;

  const updateField = <K extends keyof TeamCompensationData>(
    field: K,
    value: TeamCompensationData[K]
  ) => {
    onChange({ ...data, [field]: value });
  };

  const handleAddAllowance = (allowance: AllowanceEntry) => {
    updateField("allowances", [...data.allowances, allowance]);
  };

  const handleRemoveAllowance = (id: string) => {
    updateField(
      "allowances",
      data.allowances.filter((a) => a.id !== id)
    );
  };

  const handleUpdateAllowanceAmount = (id: string, newAmount: number) => {
    updateField(
      "allowances",
      data.allowances.map((a) => (a.id === id ? { ...a, amount: newAmount } : a))
    );
  };

  const handleAddDeduction = (deduction: DeductionEntry) => {
    updateField("deductions", [...data.deductions, deduction]);
  };

  const handleRemoveDeduction = (id: string) => {
    updateField(
      "deductions",
      data.deductions.filter((d) => d.id !== id)
    );
  };

  const existingAllowanceTemplateIds = data.allowances
    .filter((a) => !a.isCustom && a.templateId)
    .map((a) => a.templateId!);

  const existingDeductionTemplateIds = data.deductions
    .filter((d) => !d.isCustom && d.templateId)
    .map((d) => d.templateId!);

  const formatCurrency = (amount: number) =>
    `${currency?.symbol || "$"}${amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">
          Compensation details
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Set up salary and payment information
        </p>
      </div>

      {/* Employment Status */}
      <div className="space-y-2">
        <Label>Employment status *</Label>
        <Select
          value={data.employmentStatus}
          onValueChange={(value) =>
            updateField("employmentStatus", value as "full_time" | "part_time")
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="full_time">Full-Time</SelectItem>
            <SelectItem value="part_time">Part-Time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Basic Salary */}
      <div className="space-y-2">
        <Label>Basic Salary *</Label>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
              {currency?.symbol || "$"}
            </span>
            <Input
              type="text"
              placeholder="0.00"
              value={data.salary}
              onChange={(e) => updateField("salary", e.target.value)}
              className="pl-10"
            />
          </div>
          <span className="text-muted-foreground whitespace-nowrap">
            / month
          </span>
        </div>
        {workLocation && (
          <p className="text-xs text-muted-foreground">
            Currency based on {workLocation.name} ({data.currency})
          </p>
        )}
      </div>

      {/* GOSI Section - shown for Bahraini employees or when manually enabled */}
      {(isBahraini || data.isSubjectToGosi) && (
        <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/20">
          <CardContent className="pt-4 space-y-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">GOSI (Social Insurance)</p>
                <p className="text-xs text-muted-foreground">
                  Bahraini employees are subject to GOSI. The registered salary may differ from the actual salary and typically updates annually.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="gosi-toggle" className="text-sm">Subject to GOSI</Label>
              <Switch
                id="gosi-toggle"
                checked={data.isSubjectToGosi}
                onCheckedChange={(checked) => updateField("isSubjectToGosi", checked)}
              />
            </div>

            {data.isSubjectToGosi && (
              <div className="space-y-2">
                <Label>GOSI Registered Salary *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                    {currency?.symbol || "$"}
                  </span>
                  <Input
                    type="text"
                    placeholder="0.00"
                    value={data.gosiRegisteredSalary}
                    onChange={(e) => updateField("gosiRegisteredSalary", e.target.value)}
                    className="pl-10"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  This is the salary registered with GOSI for social insurance calculations.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Allowances */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Allowances</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowAllowanceDialog(true)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Allowance
          </Button>
        </div>

        {data.allowances.length > 0 ? (
          <div className="border rounded-lg divide-y">
            {allowanceBreakdown.map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm">{a.displayName}</span>
                  {a.isCustom && (
                    <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                      custom
                    </span>
                  )}
                  {!a.isCustom && a.isVariable && (
                    <span className="text-xs text-teal-600 bg-teal-50 dark:text-teal-400 dark:bg-teal-950 px-1.5 py-0.5 rounded">
                      variable
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {a.isVariable || a.isCustom ? (
                    <div className="relative w-24">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                        {currency?.symbol || "$"}
                      </span>
                      <Input
                        type="number"
                        value={a.amount}
                        onChange={(e) => handleUpdateAllowanceAmount(a.id, parseFloat(e.target.value) || 0)}
                        className="h-7 text-sm pl-6 pr-2"
                      />
                    </div>
                  ) : (
                    <span className="text-sm font-medium">
                      {formatCurrency(a.calculatedAmount)}
                    </span>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => handleRemoveAllowance(a.id)}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
            <div className="flex items-center justify-between px-3 py-2 bg-muted/50">
              <span className="text-sm text-muted-foreground">Subtotal</span>
              <span className="text-sm font-medium">
                {formatCurrency(totalAllowances)}
              </span>
            </div>
          </div>
        ) : (
          <div className="border rounded-lg px-3 py-4 text-sm text-muted-foreground text-center">
            No allowances added
          </div>
        )}
      </div>

      {/* Total Gross Pay */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-foreground">Total Gross Pay</p>
              <p className="text-xs text-muted-foreground">
                Basic Salary + Allowances
              </p>
            </div>
            <p className="text-xl font-bold text-primary">
              {formatCurrency(totalGrossPay)}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Deductions */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Deductions</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowDeductionDialog(true)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Deduction
          </Button>
        </div>

        {data.deductions.length > 0 ? (
          <div className="border rounded-lg divide-y">
            {deductionBreakdown.map((d) => (
              <div
                key={d.id}
                className="flex items-center justify-between px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm">{d.displayName}</span>
                  {d.isCustom && (
                    <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                      custom
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-destructive">
                    -{formatCurrency(d.calculatedAmount)}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => handleRemoveDeduction(d.id)}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
            <div className="flex items-center justify-between px-3 py-2 bg-muted/50">
              <span className="text-sm text-muted-foreground">Subtotal</span>
              <span className="text-sm font-medium text-destructive">
                -{formatCurrency(totalDeductions)}
              </span>
            </div>
          </div>
        ) : (
          <div className="border rounded-lg px-3 py-4 text-sm text-muted-foreground text-center">
            No deductions added
          </div>
        )}
      </div>

      {/* Total Net Monthly Pay */}
      <Card className="bg-green-500/10 border-green-500/20">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-foreground">
                Total Net Monthly Pay
              </p>
              <p className="text-xs text-muted-foreground">
                Total Gross Pay - Deductions
              </p>
            </div>
            <p className="text-xl font-bold text-green-600 dark:text-green-400">
              {formatCurrency(totalNetPay)}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <AddAllowanceDialog
        open={showAllowanceDialog}
        onOpenChange={setShowAllowanceDialog}
        onAdd={handleAddAllowance}
        currency={data.currency}
        existingTemplateIds={existingAllowanceTemplateIds}
        workLocationId={workLocationId || null}
      />

      <AddDeductionDialog
        open={showDeductionDialog}
        onOpenChange={setShowDeductionDialog}
        onAdd={handleAddDeduction}
        currency={data.currency}
        existingTemplateIds={existingDeductionTemplateIds}
        workLocationId={workLocationId || null}
      />
    </div>
  );
}
