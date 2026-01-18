import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AllowanceTemplate, DeductionTemplate, amountTypes, percentageOfOptions } from "@/data/payrollTemplates";
import { Loader2 } from "lucide-react";
import { getCurrencyByCode } from "@/data/currencies";

type TemplateType = 'allowance' | 'deduction';

interface TemplateFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: TemplateType;
  template?: AllowanceTemplate | DeductionTemplate | null;
  onSave: (data: any) => void;
  isSaving?: boolean;
  currency: string;
}

export function TemplateFormDialog({
  open,
  onOpenChange,
  type,
  template,
  onSave,
  isSaving,
  currency,
}: TemplateFormDialogProps) {
  const isEditing = !!template;
  const isAllowance = type === 'allowance';
  
  const currencyInfo = getCurrencyByCode(currency);
  const currencySymbol = currencyInfo?.symbol || "$";

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    amount: "",
    amount_type: "fixed" as "fixed" | "percentage",
    percentage_of: "base_salary",
    is_taxable: true,
    is_mandatory: false,
    is_active: true,
    is_variable: false,
  });

  useEffect(() => {
    if (template) {
      const allowanceTemplate = template as AllowanceTemplate;
      setFormData({
        name: template.name,
        description: template.description || "",
        amount: (isAllowance && allowanceTemplate.is_variable 
          ? (allowanceTemplate.default_amount || "").toString() 
          : template.amount.toString()),
        amount_type: template.amount_type as "fixed" | "percentage",
        percentage_of: template.percentage_of || "base_salary",
        is_taxable: isAllowance ? allowanceTemplate.is_taxable : true,
        is_mandatory: !isAllowance ? (template as DeductionTemplate).is_mandatory : false,
        is_active: template.is_active,
        is_variable: isAllowance ? (allowanceTemplate.is_variable || false) : false,
      });
    } else {
      setFormData({
        name: "",
        description: "",
        amount: "",
        amount_type: "fixed",
        percentage_of: "base_salary",
        is_taxable: true,
        is_mandatory: false,
        is_active: true,
        is_variable: false,
      });
    }
  }, [template, isAllowance, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const amountValue = parseFloat(formData.amount) || 0;
    
    const data = {
      name: formData.name,
      description: formData.description || null,
      amount: isAllowance && formData.is_variable ? 0 : amountValue,
      amount_type: formData.amount_type,
      percentage_of: formData.amount_type === 'percentage' ? formData.percentage_of : null,
      is_active: formData.is_active,
      ...(isAllowance 
        ? { 
            is_taxable: formData.is_taxable,
            is_variable: formData.is_variable,
            default_amount: formData.is_variable ? amountValue : amountValue,
          }
        : { is_mandatory: formData.is_mandatory }
      ),
    };

    onSave(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit" : "Create"} {isAllowance ? "Allowance" : "Deduction"} Template
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder={isAllowance ? "e.g., Housing Allowance" : "e.g., Health Insurance"}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Optional description..."
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Amount Type</Label>
              <Select
                value={formData.amount_type}
                onValueChange={(value: "fixed" | "percentage") => 
                  setFormData({ ...formData, amount_type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {amountTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">
                {formData.amount_type === "fixed" 
                  ? (isAllowance && formData.is_variable ? `Default Amount (${currencySymbol})` : `Amount (${currencySymbol})`)
                  : (isAllowance && formData.is_variable ? "Default Percentage (%)" : "Percentage (%)")}
                {!(isAllowance && formData.is_variable) && " *"}
              </Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder={formData.amount_type === "fixed" ? "0.00" : "0"}
                required={!(isAllowance && formData.is_variable)}
              />
              {isAllowance && formData.is_variable && (
                <p className="text-xs text-muted-foreground">
                  Optional default. Amount will be set when assigning to employees.
                </p>
              )}
            </div>
          </div>

          {formData.amount_type === "percentage" && (
            <div className="space-y-2">
              <Label>Percentage Of</Label>
              <Select
                value={formData.percentage_of}
                onValueChange={(value) => setFormData({ ...formData, percentage_of: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {percentageOfOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-4 pt-2">
            {isAllowance && (
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="is_variable">Amount varies per employee</Label>
                  <p className="text-xs text-muted-foreground">
                    Amount will be entered when assigning to employees
                  </p>
                </div>
                <Switch
                  id="is_variable"
                  checked={formData.is_variable}
                  onCheckedChange={(checked) => 
                    setFormData({ ...formData, is_variable: checked })
                  }
                />
              </div>
            )}

            {isAllowance ? (
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="is_taxable">Taxable</Label>
                  <p className="text-xs text-muted-foreground">
                    This allowance is subject to tax
                  </p>
                </div>
                <Switch
                  id="is_taxable"
                  checked={formData.is_taxable}
                  onCheckedChange={(checked) => 
                    setFormData({ ...formData, is_taxable: checked })
                  }
                />
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="is_mandatory">Mandatory</Label>
                  <p className="text-xs text-muted-foreground">
                    This deduction is required
                  </p>
                </div>
                <Switch
                  id="is_mandatory"
                  checked={formData.is_mandatory}
                  onCheckedChange={(checked) => 
                    setFormData({ ...formData, is_mandatory: checked })
                  }
                />
              </div>
            )}

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="is_active">Active</Label>
                <p className="text-xs text-muted-foreground">
                  Template is available for use
                </p>
              </div>
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => 
                  setFormData({ ...formData, is_active: checked })
                }
              />
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Save Changes" : "Create Template"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
