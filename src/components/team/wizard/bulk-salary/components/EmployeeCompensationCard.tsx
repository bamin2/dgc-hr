import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight, Plus, X } from "lucide-react";
import { AllowanceEntryExtended, DeductionEntryExtended } from "../types";
import { TeamMemberWithGosi } from "@/hooks/useBulkSalaryWizard";
import { getCurrencyByCode } from "@/data/currencies";
import { AddAllowanceDialog, AllowanceEntry } from "../../AddAllowanceDialog";
import { AddDeductionDialog, DeductionEntry } from "../../AddDeductionDialog";

interface EmployeeCompensationCardProps {
  employee: TeamMemberWithGosi;
  allowances: AllowanceEntryExtended[];
  deductions: DeductionEntryExtended[];
  onUpdateAllowances: (allowances: AllowanceEntryExtended[]) => void;
  onUpdateDeductions: (deductions: DeductionEntryExtended[]) => void;
  allowanceTemplates: { id: string; name: string; amount: number; amount_type: string; is_variable?: boolean; default_amount?: number }[];
  deductionTemplates: { id: string; name: string; amount: number; amount_type: string }[];
}

export function EmployeeCompensationCard({
  employee,
  allowances,
  deductions,
  onUpdateAllowances,
  onUpdateDeductions,
  allowanceTemplates,
  deductionTemplates,
}: EmployeeCompensationCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showAllowanceDialog, setShowAllowanceDialog] = useState(false);
  const [showDeductionDialog, setShowDeductionDialog] = useState(false);

  const currency = employee.currency || 'USD';
  const currencyInfo = getCurrencyByCode(currency);
  const currencySymbol = currencyInfo?.symbol || '$';

  const getDisplayName = (
    item: AllowanceEntryExtended | DeductionEntryExtended,
    templates: { id: string; name: string }[]
  ) => {
    if (item.isCustom) return item.customName || 'Custom';
    const template = templates.find(t => t.id === item.templateId);
    return template?.name || 'Unknown';
  };

  const isAllowanceEditable = (allowance: AllowanceEntryExtended) => {
    if (allowance.isCustom) return true;
    const template = allowanceTemplates.find(t => t.id === allowance.templateId);
    return template?.is_variable ?? false;
  };

  const handleAllowanceAmountChange = (id: string, newAmount: string) => {
    onUpdateAllowances(
      allowances.map(a => a.id === id ? { ...a, amount: parseFloat(newAmount) || 0 } : a)
    );
  };

  const handleDeductionAmountChange = (id: string, newAmount: string) => {
    onUpdateDeductions(
      deductions.map(d => d.id === id ? { ...d, amount: parseFloat(newAmount) || 0 } : d)
    );
  };

  const handleAddAllowance = (entry: AllowanceEntry) => {
    const extended: AllowanceEntryExtended = {
      ...entry,
      isExisting: false,
    };
    onUpdateAllowances([...allowances, extended]);
  };

  const handleAddDeduction = (entry: DeductionEntry) => {
    const extended: DeductionEntryExtended = {
      ...entry,
      isExisting: false,
    };
    onUpdateDeductions([...deductions, extended]);
  };

  const handleRemoveAllowance = (id: string) => {
    onUpdateAllowances(allowances.filter(a => a.id !== id));
  };

  const handleRemoveDeduction = (id: string) => {
    onUpdateDeductions(deductions.filter(d => d.id !== id));
  };

  const existingAllowanceTemplateIds = allowances
    .filter(a => !a.isCustom && a.templateId)
    .map(a => a.templateId!);

  const existingDeductionTemplateIds = deductions
    .filter(d => !d.isCustom && d.templateId)
    .map(d => d.templateId!);

  const totalAllowances = allowances.reduce((sum, a) => sum + a.amount, 0);
  const totalDeductions = deductions.reduce((sum, d) => sum + d.amount, 0);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="border rounded-lg">
      <CollapsibleTrigger asChild>
        <button className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
          <div className="flex items-center gap-3">
            {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            <Avatar className="h-8 w-8">
              <AvatarImage src={employee.avatar} />
              <AvatarFallback className="text-xs">
                {employee.firstName[0]}{employee.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <div className="text-left">
              <p className="text-sm font-medium">
                {employee.firstName} {employee.lastName}
              </p>
              <p className="text-xs text-muted-foreground">
                {employee.department} • {employee.jobTitle}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-muted-foreground">
              {allowances.length} allowance{allowances.length !== 1 ? 's' : ''}, {deductions.length} deduction{deductions.length !== 1 ? 's' : ''}
            </span>
            <span className="font-medium text-primary">
              +{currencySymbol}{totalAllowances.toLocaleString()}
            </span>
            <span className="font-medium text-destructive">
              -{currencySymbol}{totalDeductions.toLocaleString()}
            </span>
          </div>
        </button>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="px-4 pb-4 pt-2 border-t space-y-4">
          {/* Allowances */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Allowances</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => setShowAllowanceDialog(true)}
              >
                <Plus className="h-3 w-3 mr-1" />
                Add
              </Button>
            </div>
            {allowances.length > 0 ? (
              <div className="space-y-2">
                {allowances.map(allowance => {
                  const editable = isAllowanceEditable(allowance);
                  const template = allowanceTemplates.find(t => t.id === allowance.templateId);
                  
                  return (
                    <div key={allowance.id} className="flex items-center gap-2 bg-muted/30 rounded px-3 py-2">
                      <div className="flex-1 flex items-center gap-2">
                        <span className="text-sm">{getDisplayName(allowance, allowanceTemplates)}</span>
                        {allowance.isExisting && (
                          <Badge variant="outline" className="text-[10px] px-1.5">Existing</Badge>
                        )}
                        {allowance.isCustom && (
                          <Badge variant="secondary" className="text-[10px] px-1.5">Custom</Badge>
                        )}
                        {!allowance.isCustom && template?.is_variable && (
                          <Badge className="text-[10px] px-1.5 bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300">Variable</Badge>
                        )}
                      </div>
                      {editable ? (
                        <div className="relative w-28">
                          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                            {currencySymbol}
                          </span>
                          <Input
                            type="number"
                            value={allowance.amount}
                            onChange={(e) => handleAllowanceAmountChange(allowance.id, e.target.value)}
                            className="h-7 text-sm pl-6 pr-2"
                          />
                        </div>
                      ) : (
                        <span className="text-sm font-medium w-28 text-right">
                          {currencySymbol}{allowance.amount.toLocaleString()}
                        </span>
                      )}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleRemoveAllowance(allowance.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground py-2">No allowances</p>
            )}
          </div>

          {/* Deductions */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Deductions</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => setShowDeductionDialog(true)}
              >
                <Plus className="h-3 w-3 mr-1" />
                Add
              </Button>
            </div>
            {deductions.length > 0 ? (
              <div className="space-y-2">
                {deductions.map(deduction => (
                  <div key={deduction.id} className="flex items-center gap-2 bg-muted/30 rounded px-3 py-2">
                    <div className="flex-1 flex items-center gap-2">
                      <span className="text-sm">{getDisplayName(deduction, deductionTemplates)}</span>
                      {deduction.isExisting && (
                        <Badge variant="outline" className="text-[10px] px-1.5">Existing</Badge>
                      )}
                      {deduction.isCustom && (
                        <Badge variant="secondary" className="text-[10px] px-1.5">Custom</Badge>
                      )}
                    </div>
                    <div className="relative w-28">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                        {currencySymbol}
                      </span>
                      <Input
                        type="number"
                        value={deduction.amount}
                        onChange={(e) => handleDeductionAmountChange(deduction.id, e.target.value)}
                        className="h-7 text-sm pl-6 pr-2"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => handleRemoveDeduction(deduction.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground py-2">No deductions</p>
            )}
          </div>
        </div>
      </CollapsibleContent>

      <AddAllowanceDialog
        open={showAllowanceDialog}
        onOpenChange={setShowAllowanceDialog}
        onAdd={handleAddAllowance}
        currency={currency}
        existingTemplateIds={existingAllowanceTemplateIds}
        workLocationId={employee.workLocationId || null}
      />

      <AddDeductionDialog
        open={showDeductionDialog}
        onOpenChange={setShowDeductionDialog}
        onAdd={handleAddDeduction}
        currency={currency}
        existingTemplateIds={existingDeductionTemplateIds}
        workLocationId={employee.workLocationId || null}
      />
    </Collapsible>
  );
}