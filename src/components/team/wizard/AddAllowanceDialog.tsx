import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useActiveAllowanceTemplatesByLocation } from "@/hooks/useAllowanceTemplates";
import { getCurrencyByCode } from "@/data/currencies";

export interface AllowanceEntry {
  id: string;
  templateId?: string;
  customName?: string;
  amount: number;
  isCustom: boolean;
  isPercentage?: boolean;
  percentageOf?: string;
}

interface AddAllowanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (allowance: AllowanceEntry) => void;
  currency: string;
  existingTemplateIds: string[];
  workLocationId: string | null;
}

export function AddAllowanceDialog({
  open,
  onOpenChange,
  onAdd,
  currency,
  existingTemplateIds,
  workLocationId,
}: AddAllowanceDialogProps) {
  const [mode, setMode] = useState<"template" | "custom">("template");
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [customName, setCustomName] = useState("");
  const [customAmount, setCustomAmount] = useState("");
  const [variableAmount, setVariableAmount] = useState("");

  const { data: templates } = useActiveAllowanceTemplatesByLocation(workLocationId);
  const currencyInfo = getCurrencyByCode(currency);

  const availableTemplates = (templates || []).filter(
    (t) => !existingTemplateIds.includes(t.id)
  );

  const selectedTemplate = templates?.find((t) => t.id === selectedTemplateId);
  const isVariableTemplate = selectedTemplate?.is_variable ?? false;

  const handleAdd = () => {
    if (mode === "template" && selectedTemplate) {
      // For variable templates, use the entered amount or fallback to default_amount
      const amount = isVariableTemplate
        ? (parseFloat(variableAmount) || selectedTemplate.default_amount || 0)
        : (selectedTemplate.default_amount || selectedTemplate.amount);
      
      onAdd({
        id: crypto.randomUUID(),
        templateId: selectedTemplate.id,
        amount,
        isCustom: false,
        isPercentage: selectedTemplate.amount_type === "percentage",
        percentageOf: selectedTemplate.percentage_of || undefined,
      });
    } else if (mode === "custom" && customName && customAmount) {
      onAdd({
        id: crypto.randomUUID(),
        customName,
        amount: parseFloat(customAmount) || 0,
        isCustom: true,
        isPercentage: false,
      });
    }

    // Reset and close
    setMode("template");
    setSelectedTemplateId("");
    setCustomName("");
    setCustomAmount("");
    setVariableAmount("");
    onOpenChange(false);
  };

  const canAdd =
    (mode === "template" && selectedTemplateId && (!isVariableTemplate || variableAmount)) ||
    (mode === "custom" && customName && customAmount);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle>Add Allowance</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <RadioGroup
            value={mode}
            onValueChange={(v) => setMode(v as "template" | "custom")}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="template" id="template" />
              <Label htmlFor="template">Select from templates</Label>
            </div>

            {mode === "template" && (
              <div className="ml-6 mt-2 space-y-3">
                {availableTemplates.length === 0 ? (
                  <div className="px-2 py-4 text-sm text-muted-foreground text-center border rounded-lg">
                    No templates available for this work location
                  </div>
                ) : (
                  <Select
                    value={selectedTemplateId}
                    onValueChange={(id) => {
                      setSelectedTemplateId(id);
                      setVariableAmount("");
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose an allowance template..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTemplates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          <div className="flex items-center justify-between gap-4">
                            <span>{template.name}</span>
                            <span className="text-muted-foreground">
                              {template.is_variable 
                                ? "Variable"
                                : template.amount_type === "fixed"
                                  ? `${currencyInfo?.symbol || "$"}${(template.default_amount || template.amount).toLocaleString()}`
                                  : `${template.default_amount || template.amount}%`}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {/* Show amount input for variable templates */}
                {selectedTemplate && isVariableTemplate && (
                  <div className="space-y-1.5">
                    <Label htmlFor="variable-amount">
                      Amount {selectedTemplate.amount_type === "percentage" ? "(%)" : ""} *
                    </Label>
                    <div className="relative">
                      {selectedTemplate.amount_type === "fixed" && (
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          {currencyInfo?.symbol || "$"}
                        </span>
                      )}
                      <Input
                        id="variable-amount"
                        type="number"
                        placeholder={selectedTemplate.default_amount 
                          ? `Default: ${selectedTemplate.default_amount}` 
                          : "0.00"}
                        value={variableAmount}
                        onChange={(e) => setVariableAmount(e.target.value)}
                        className={selectedTemplate.amount_type === "fixed" ? "pl-8" : ""}
                      />
                    </div>
                    {selectedTemplate.default_amount > 0 && (
                      <p className="text-xs text-muted-foreground">
                        Default: {selectedTemplate.amount_type === "fixed" 
                          ? `${currencyInfo?.symbol || "$"}${selectedTemplate.default_amount.toLocaleString()}`
                          : `${selectedTemplate.default_amount}%`}
                      </p>
                    )}
                  </div>
                )}

                {/* Show fixed amount for non-variable templates */}
                {selectedTemplate && !isVariableTemplate && (
                  <div className="p-2 bg-muted rounded text-sm">
                    Amount: {selectedTemplate.amount_type === "fixed"
                      ? `${currencyInfo?.symbol || "$"}${(selectedTemplate.default_amount || selectedTemplate.amount).toLocaleString()}`
                      : `${selectedTemplate.default_amount || selectedTemplate.amount}%`}
                    <span className="text-muted-foreground ml-1">(fixed)</span>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center space-x-2 pt-2">
              <RadioGroupItem value="custom" id="custom" />
              <Label htmlFor="custom">Create custom allowance</Label>
            </div>

            {mode === "custom" && (
              <div className="ml-6 mt-2 space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="custom-name">Name</Label>
                  <Input
                    id="custom-name"
                    placeholder="e.g., Meal Allowance"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="custom-amount">Amount</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      {currencyInfo?.symbol || "$"}
                    </span>
                    <Input
                      id="custom-amount"
                      type="number"
                      placeholder="0.00"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
              </div>
            )}
          </RadioGroup>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleAdd} disabled={!canAdd}>
            Add Allowance
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
