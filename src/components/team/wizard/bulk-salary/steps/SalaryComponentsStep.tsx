import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, X, Info } from "lucide-react";
import { AddAllowanceDialog, AllowanceEntry } from "../../AddAllowanceDialog";
import { AddDeductionDialog, DeductionEntry } from "../../AddDeductionDialog";
import { BulkSalaryWizardData } from "../types";

interface SalaryComponentsStepProps {
  data: BulkSalaryWizardData;
  onUpdateData: <K extends keyof BulkSalaryWizardData>(field: K, value: BulkSalaryWizardData[K]) => void;
  allowanceTemplates: { id: string; name: string; amount: number; amount_type: string }[];
  deductionTemplates: { id: string; name: string; amount: number; amount_type: string }[];
  currency?: string;
}

export function SalaryComponentsStep({
  data,
  onUpdateData,
  allowanceTemplates,
  deductionTemplates,
  currency = 'USD',
}: SalaryComponentsStepProps) {
  const [showAllowanceDialog, setShowAllowanceDialog] = useState(false);
  const [showDeductionDialog, setShowDeductionDialog] = useState(false);

  const handleAddAllowance = (allowance: AllowanceEntry) => {
    onUpdateData('allowances', [...data.allowances, allowance]);
  };

  const handleRemoveAllowance = (id: string) => {
    onUpdateData('allowances', data.allowances.filter(a => a.id !== id));
  };

  const handleAddDeduction = (deduction: DeductionEntry) => {
    onUpdateData('deductions', [...data.deductions, deduction]);
  };

  const handleRemoveDeduction = (id: string) => {
    onUpdateData('deductions', data.deductions.filter(d => d.id !== id));
  };

  const existingAllowanceTemplateIds = data.allowances
    .filter(a => !a.isCustom && a.templateId)
    .map(a => a.templateId!);

  // Filter out GOSI template from deductions
  const existingDeductionTemplateIds = data.deductions
    .filter(d => !d.isCustom && d.templateId)
    .map(d => d.templateId!);

  const formatAmount = (amount: number, amountType: string) => {
    if (amountType === 'percentage') {
      return `${amount}%`;
    }
    return `$${amount.toLocaleString()}`;
  };

  const getDisplayName = (
    item: AllowanceEntry | DeductionEntry,
    templates: { id: string; name: string }[]
  ) => {
    if (item.isCustom) return item.customName || 'Custom';
    const template = templates.find(t => t.id === item.templateId);
    return template?.name || 'Unknown';
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Salary Components</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Add allowances and deductions to apply to selected employees
        </p>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          The GOSI - Bahraini deduction is managed separately in Settings and cannot be modified here.
          It will be automatically applied based on GOSI registered salary.
        </AlertDescription>
      </Alert>

      {/* Allowances Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-base font-medium">Allowances</Label>
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
          <Card>
            <CardContent className="p-0 divide-y">
              {data.allowances.map((allowance) => {
                const template = allowanceTemplates.find(t => t.id === allowance.templateId);
                return (
                  <div
                    key={allowance.id}
                    className="flex items-center justify-between px-4 py-3"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {getDisplayName(allowance, allowanceTemplates)}
                      </span>
                      {allowance.isCustom && (
                        <Badge variant="secondary" className="text-xs">
                          Custom
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-primary font-medium">
                        +{formatAmount(
                          allowance.isCustom ? allowance.amount : (template?.amount || 0),
                          allowance.isPercentage ? 'percentage' : 'fixed'
                        )}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleRemoveAllowance(allowance.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        ) : (
          <Card className="border-dashed">
            <CardContent className="py-8 text-center text-muted-foreground text-sm">
              No allowances added. Click "Add Allowance" to include allowances.
            </CardContent>
          </Card>
        )}
      </div>

      {/* Deductions Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-base font-medium">Deductions</Label>
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
          <Card>
            <CardContent className="p-0 divide-y">
              {data.deductions.map((deduction) => {
                const template = deductionTemplates.find(t => t.id === deduction.templateId);
                return (
                  <div
                    key={deduction.id}
                    className="flex items-center justify-between px-4 py-3"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {getDisplayName(deduction, deductionTemplates)}
                      </span>
                      {deduction.isCustom && (
                        <Badge variant="secondary" className="text-xs">
                          Custom
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-destructive font-medium">
                        -{formatAmount(
                          deduction.isCustom ? deduction.amount : (template?.amount || 0),
                          deduction.isPercentage ? 'percentage' : 'fixed'
                        )}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleRemoveDeduction(deduction.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        ) : (
          <Card className="border-dashed">
            <CardContent className="py-8 text-center text-muted-foreground text-sm">
              No deductions added. Click "Add Deduction" to include deductions.
            </CardContent>
          </Card>
        )}
      </div>

      {/* Dialogs */}
      <AddAllowanceDialog
        open={showAllowanceDialog}
        onOpenChange={setShowAllowanceDialog}
        onAdd={handleAddAllowance}
        currency={currency}
        existingTemplateIds={existingAllowanceTemplateIds}
      />

      <AddDeductionDialog
        open={showDeductionDialog}
        onOpenChange={setShowDeductionDialog}
        onAdd={handleAddDeduction}
        currency={currency}
        existingTemplateIds={existingDeductionTemplateIds}
      />
    </div>
  );
}
