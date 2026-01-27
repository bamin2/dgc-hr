import { useState, useEffect, useMemo } from "react";
import { Plus, X, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { formatAmount } from "@/lib/currencyUtils";
import { Employee } from "@/hooks/useEmployees";
import { EmployeeAllowance, EmployeeDeduction } from "@/data/payrollTemplates";
import { useUpdateCompensation } from "@/hooks/useUpdateCompensation";
import { createAllowanceSnapshot, createDeductionSnapshot } from "@/hooks/useSalaryHistory";
import { AddAllowanceDialog, AllowanceEntry } from "@/components/team/wizard/AddAllowanceDialog";
import { AddDeductionDialog, DeductionEntry } from "@/components/team/wizard/AddDeductionDialog";
import { useWorkLocations } from "@/hooks/useWorkLocations";
import { getCountryCodeByName } from "@/data/countries";

interface LocalAllowance {
  id: string;
  templateId: string | null;
  name: string;
  amount: number;
  customName: string | null;
  isEditable: boolean;
}

interface LocalDeduction {
  id: string;
  templateId: string | null;
  name: string;
  amount: number;
  customName: string | null;
  isEditable: boolean;
}

interface EditSalaryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: Employee;
  currentAllowances: EmployeeAllowance[];
  currentDeductions: EmployeeDeduction[];
  workLocationId: string | null;
  currency: string;
}

function mapToLocalAllowances(allowances: EmployeeAllowance[]): LocalAllowance[] {
  return allowances.map((a) => {
    const template = a.allowance_template;
    const isVariable = template?.is_variable ?? true;
    return {
      id: a.id,
      templateId: a.allowance_template_id || null,
      name: a.custom_name || template?.name || 'Allowance',
      amount: a.custom_amount ?? template?.amount ?? 0,
      customName: a.custom_name,
      isEditable: isVariable || !!a.custom_name,
    };
  });
}

function mapToLocalDeductions(deductions: EmployeeDeduction[]): LocalDeduction[] {
  return deductions.map((d) => {
    const template = d.deduction_template;
    return {
      id: d.id,
      templateId: d.deduction_template_id || null,
      name: d.custom_name || template?.name || 'Deduction',
      amount: d.custom_amount ?? template?.amount ?? 0,
      customName: d.custom_name,
      isEditable: true,
    };
  });
}

export function EditSalaryDialog({
  open,
  onOpenChange,
  employee,
  currentAllowances,
  currentDeductions,
  workLocationId,
  currency,
}: EditSalaryDialogProps) {
  const updateCompensation = useUpdateCompensation();
  
  // Local state
  const [basicSalary, setBasicSalary] = useState<number>(0);
  const [gosiSalary, setGosiSalary] = useState<number | null>(null);
  const [allowances, setAllowances] = useState<LocalAllowance[]>([]);
  const [deductions, setDeductions] = useState<LocalDeduction[]>([]);
  const [reason, setReason] = useState('');
  const [showAllowanceDialog, setShowAllowanceDialog] = useState(false);
  const [showDeductionDialog, setShowDeductionDialog] = useState(false);
  
  // Initialize form when dialog opens
  useEffect(() => {
    if (open) {
      setBasicSalary(employee.salary || 0);
      setGosiSalary(employee.gosiRegisteredSalary || null);
      setAllowances(mapToLocalAllowances(currentAllowances));
      setDeductions(mapToLocalDeductions(currentDeductions));
      setReason('');
    }
  }, [open, employee, currentAllowances, currentDeductions]);
  
  // Fetch work locations for GOSI rates
  const { data: workLocations } = useWorkLocations();
  
  // Calculate GOSI deduction based on nationality rates
  const gosiCalculation = useMemo(() => {
    if (!employee.isSubjectToGosi || !gosiSalary) {
      return { gosiDeduction: 0, employeeRate: 0 };
    }
    
    const employeeWorkLocation = workLocations?.find(loc => loc.id === workLocationId);
    if (!employeeWorkLocation?.gosi_enabled) {
      return { gosiDeduction: 0, employeeRate: 0 };
    }
    
    const rates = employeeWorkLocation.gosi_nationality_rates || [];
    const nationalityCode = getCountryCodeByName(employee.nationality || '');
    const matchingRate = rates.find(r => r.nationality === nationalityCode);
    
    if (!matchingRate) {
      return { gosiDeduction: 0, employeeRate: 0 };
    }
    
    const employeeRate = matchingRate.employeeRate ?? 0;
    const gosiDeduction = (gosiSalary * employeeRate) / 100;
    
    return { gosiDeduction, employeeRate };
  }, [employee.isSubjectToGosi, employee.nationality, gosiSalary, workLocationId, workLocations]);
  
  // Calculated totals
  const totals = useMemo(() => {
    const totalAllowances = allowances.reduce((sum, a) => sum + a.amount, 0);
    const otherDeductions = deductions.reduce((sum, d) => sum + d.amount, 0);
    const grossPay = basicSalary + totalAllowances;
    const totalDeductions = otherDeductions + gosiCalculation.gosiDeduction;
    const netPay = grossPay - totalDeductions;
    return { totalAllowances, otherDeductions, totalDeductions, grossPay, netPay };
  }, [basicSalary, allowances, deductions, gosiCalculation.gosiDeduction]);
  
  const handleAllowanceAmountChange = (id: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    setAllowances(prev => 
      prev.map(a => a.id === id ? { ...a, amount: numValue } : a)
    );
  };
  
  const handleDeductionAmountChange = (id: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    setDeductions(prev => 
      prev.map(d => d.id === id ? { ...d, amount: numValue } : d)
    );
  };
  
  const handleRemoveAllowance = (id: string) => {
    setAllowances(prev => prev.filter(a => a.id !== id));
  };
  
  const handleRemoveDeduction = (id: string) => {
    setDeductions(prev => prev.filter(d => d.id !== id));
  };
  
  const handleAddAllowance = (entry: AllowanceEntry) => {
    const newAllowance: LocalAllowance = {
      id: entry.id,
      templateId: entry.templateId || null,
      name: entry.customName || 'Allowance',
      amount: entry.amount,
      customName: entry.isCustom ? entry.customName || null : null,
      isEditable: true,
    };
    setAllowances(prev => [...prev, newAllowance]);
    setShowAllowanceDialog(false);
  };
  
  const handleAddDeduction = (entry: DeductionEntry) => {
    const newDeduction: LocalDeduction = {
      id: entry.id,
      templateId: entry.templateId || null,
      name: entry.customName || 'Deduction',
      amount: entry.amount,
      customName: entry.isCustom ? entry.customName || null : null,
      isEditable: true,
    };
    setDeductions(prev => [...prev, newDeduction]);
    setShowDeductionDialog(false);
  };
  
  const handleSave = () => {
    // Create snapshots of previous state
    const previousAllowances = createAllowanceSnapshot(currentAllowances);
    const previousDeductions = createDeductionSnapshot(currentDeductions);
    
    updateCompensation.mutate({
      employeeId: employee.id,
      previousSalary: employee.salary || 0,
      newSalary: basicSalary,
      previousGosiSalary: employee.gosiRegisteredSalary || null,
      newGosiSalary: employee.isSubjectToGosi ? gosiSalary : null,
      previousAllowances,
      newAllowances: allowances.map(a => ({
        templateId: a.templateId,
        customName: a.templateId ? null : a.name,
        customAmount: a.amount,
      })),
      previousDeductions,
      newDeductions: deductions.map(d => ({
        templateId: d.templateId,
        customName: d.templateId ? null : d.name,
        customAmount: d.amount,
      })),
      reason: reason || 'Compensation updated',
    }, {
      onSuccess: () => {
        toast({
          title: "Compensation updated",
          description: "The employee's salary has been updated and recorded in history.",
        });
        onOpenChange(false);
      },
      onError: (error) => {
        toast({
          title: "Error updating compensation",
          description: error instanceof Error ? error.message : "An error occurred",
          variant: "destructive",
        });
      },
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent size="xl">
          <DialogHeader>
            <DialogTitle>Edit Salary</DialogTitle>
            <DialogDescription>
              Update compensation for {employee.firstName} {employee.lastName}
            </DialogDescription>
          </DialogHeader>
          
          <DialogBody className="space-y-6">
            {/* Basic Salary */}
            <div className="space-y-2">
              <Label htmlFor="basicSalary">Basic Salary</Label>
              <Input
                id="basicSalary"
                type="number"
                min="0"
                step="0.01"
                value={basicSalary}
                onChange={(e) => setBasicSalary(parseFloat(e.target.value) || 0)}
              />
            </div>
            
            <Separator />
            
            {/* Allowances Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Allowances</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAllowanceDialog(true)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
              
              {allowances.length === 0 ? (
                <p className="text-sm text-muted-foreground py-2">No allowances</p>
              ) : (
                <div className="space-y-2">
                  {allowances.map((allowance) => (
                    <div key={allowance.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                      <span className="flex-1 text-sm">{allowance.name}</span>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={allowance.amount}
                        onChange={(e) => handleAllowanceAmountChange(allowance.id, e.target.value)}
                        className="w-32"
                        disabled={!allowance.isEditable}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => handleRemoveAllowance(allowance.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <Separator />
            
            {/* Deductions Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Deductions</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDeductionDialog(true)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
              
              {deductions.length === 0 ? (
                <p className="text-sm text-muted-foreground py-2">No deductions</p>
              ) : (
                <div className="space-y-2">
                  {deductions.map((deduction) => (
                    <div key={deduction.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                      <span className="flex-1 text-sm">{deduction.name}</span>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={deduction.amount}
                        onChange={(e) => handleDeductionAmountChange(deduction.id, e.target.value)}
                        className="w-32"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => handleRemoveDeduction(deduction.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* GOSI Section - Above Summary */}
            {employee.isSubjectToGosi && (
              <>
                <Separator />
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="gosiSalary">GOSI Registered Salary</Label>
                    <Input
                      id="gosiSalary"
                      type="number"
                      min="0"
                      step="0.01"
                      value={gosiSalary ?? ''}
                      onChange={(e) => setGosiSalary(e.target.value ? parseFloat(e.target.value) : null)}
                    />
                    <p className="text-xs text-muted-foreground">
                      The salary registered with GOSI for social insurance calculations
                    </p>
                  </div>
                  {gosiCalculation.gosiDeduction > 0 && (
                    <div className="flex justify-between items-center text-sm bg-amber-50/50 dark:bg-amber-950/20 p-3 rounded-lg">
                      <span className="text-muted-foreground">
                        GOSI Employee Contribution ({gosiCalculation.employeeRate}%)
                      </span>
                      <span className="text-amber-700 dark:text-amber-400 font-medium">
                        {formatAmount(gosiCalculation.gosiDeduction, currency)}
                      </span>
                    </div>
                  )}
                </div>
              </>
            )}
            
            <Separator />
            
            {/* Summary Section */}
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Basic Salary</span>
                <span>{formatAmount(basicSalary, currency)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Allowances</span>
                <span className="text-green-600">+{formatAmount(totals.totalAllowances, currency)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Gross Pay</span>
                <span className="font-medium">{formatAmount(totals.grossPay, currency)}</span>
              </div>
              <Separator />
              {gosiCalculation.gosiDeduction > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">GOSI Deduction ({gosiCalculation.employeeRate}%)</span>
                  <span className="text-red-600">-{formatAmount(gosiCalculation.gosiDeduction, currency)}</span>
                </div>
              )}
              {totals.otherDeductions > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Other Deductions</span>
                  <span className="text-red-600">-{formatAmount(totals.otherDeductions, currency)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Deductions</span>
                <span className="text-red-600">-{formatAmount(totals.totalDeductions, currency)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Net Pay</span>
                <span className="text-primary">{formatAmount(totals.netPay, currency)}</span>
              </div>
            </div>
            
            {/* Reason for Change */}
            <div className="space-y-2">
              <Label htmlFor="reason">Reason for Change (Optional)</Label>
              <Textarea
                id="reason"
                placeholder="e.g., Annual salary review, Promotion, etc."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={2}
              />
            </div>
          </DialogBody>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={updateCompensation.isPending}
            >
              {updateCompensation.isPending && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Add Allowance Dialog */}
      <AddAllowanceDialog
        open={showAllowanceDialog}
        onOpenChange={setShowAllowanceDialog}
        onAdd={handleAddAllowance}
        currency={currency}
        workLocationId={workLocationId}
        existingTemplateIds={allowances.filter(a => a.templateId).map(a => a.templateId!)}
      />
      
      {/* Add Deduction Dialog */}
      <AddDeductionDialog
        open={showDeductionDialog}
        onOpenChange={setShowDeductionDialog}
        onAdd={handleAddDeduction}
        currency={currency}
        workLocationId={workLocationId}
        existingTemplateIds={deductions.filter(d => d.templateId).map(d => d.templateId!)}
      />
    </>
  );
}
