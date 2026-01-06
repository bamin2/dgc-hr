import { useState, useEffect, useMemo } from "react";
import { DollarSign } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { type TeamMember } from "@/hooks/useTeamMembers";
import { toast } from "@/hooks/use-toast";
import { SalaryChangeType } from "@/hooks/useSalaryHistory";

type UpdateType = 'fixed' | 'percentage' | 'custom';

const changeTypeOptions: { value: SalaryChangeType; label: string }[] = [
  { value: 'adjustment', label: 'Adjustment' },
  { value: 'promotion', label: 'Promotion' },
  { value: 'annual_review', label: 'Annual Review' },
  { value: 'correction', label: 'Correction' },
  { value: 'bulk_update', label: 'Bulk Update' },
];

interface BulkUpdateSalariesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedMembers: TeamMember[];
  onUpdate: (updates: { id: string; previousSalary: number | null; newSalary: number; changeType: SalaryChangeType; reason?: string }[]) => void;
}

export function BulkUpdateSalariesDialog({
  open,
  onOpenChange,
  selectedMembers,
  onUpdate,
}: BulkUpdateSalariesDialogProps) {
  const [updateType, setUpdateType] = useState<UpdateType>('fixed');
  const [fixedAmount, setFixedAmount] = useState('');
  const [percentage, setPercentage] = useState('');
  const [customSalaries, setCustomSalaries] = useState<Record<string, string>>({});
  const [changeType, setChangeType] = useState<SalaryChangeType>('bulk_update');
  const [reason, setReason] = useState('');

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setUpdateType('fixed');
      setFixedAmount('');
      setPercentage('');
      setChangeType('bulk_update');
      setReason('');
      // Initialize custom salaries with current values
      const initial: Record<string, string> = {};
      selectedMembers.forEach(member => {
        initial[member.id] = member.salary?.toString() || '';
      });
      setCustomSalaries(initial);
    }
  }, [open, selectedMembers]);

  // Calculate new salary based on update type
  const getNewSalary = (member: TeamMember): number => {
    const currentSalary = member.salary || 0;
    
    switch (updateType) {
      case 'fixed':
        return parseFloat(fixedAmount) || 0;
      case 'percentage':
        const pct = parseFloat(percentage) || 0;
        return Math.round(currentSalary * (1 + pct / 100));
      case 'custom':
        return parseFloat(customSalaries[member.id]) || currentSalary;
    }
  };

  // Calculate summary
  const summary = useMemo(() => {
    let totalCurrent = 0;
    let totalNew = 0;
    
    selectedMembers.forEach(member => {
      totalCurrent += member.salary || 0;
      totalNew += getNewSalary(member);
    });
    
    return {
      totalCurrent,
      totalNew,
      difference: totalNew - totalCurrent,
    };
  }, [selectedMembers, updateType, fixedAmount, percentage, customSalaries]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleSubmit = () => {
    const updates = selectedMembers.map(member => ({
      id: member.id,
      previousSalary: member.salary || null,
      newSalary: getNewSalary(member),
      changeType,
      reason: reason.trim() || undefined,
    }));
    
    onUpdate(updates);
    onOpenChange(false);
    
    toast({
      title: "Salaries updated",
      description: `Updated salaries for ${selectedMembers.length} team member(s).`,
    });
  };

  const isValid = useMemo(() => {
    switch (updateType) {
      case 'fixed':
        return parseFloat(fixedAmount) > 0;
      case 'percentage':
        return parseFloat(percentage) !== 0 && !isNaN(parseFloat(percentage));
      case 'custom':
        return Object.values(customSalaries).every(val => parseFloat(val) >= 0 && !isNaN(parseFloat(val)));
    }
  }, [updateType, fixedAmount, percentage, customSalaries]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Bulk Update Salaries
          </DialogTitle>
          <DialogDescription>
            Update salaries for {selectedMembers.length} selected team member(s).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Update Type Selection */}
          <div className="space-y-3">
            <Label>Update Type</Label>
            <RadioGroup
              value={updateType}
              onValueChange={(value) => setUpdateType(value as UpdateType)}
              className="flex flex-wrap gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="fixed" id="fixed" />
                <Label htmlFor="fixed" className="font-normal cursor-pointer">
                  Fixed Amount
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="percentage" id="percentage" />
                <Label htmlFor="percentage" className="font-normal cursor-pointer">
                  Percentage Increase
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="custom" id="custom" />
                <Label htmlFor="custom" className="font-normal cursor-pointer">
                  Custom Amounts
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Change Type and Reason */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Change Type</Label>
              <Select value={changeType} onValueChange={(v) => setChangeType(v as SalaryChangeType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {changeTypeOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reason">Reason (optional)</Label>
              <Textarea
                id="reason"
                placeholder="e.g., Annual salary review 2026"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="h-[38px] min-h-[38px] resize-none"
              />
            </div>
          </div>

          {/* Fixed Amount Input */}
          {updateType === 'fixed' && (
            <div className="space-y-2">
              <Label htmlFor="fixedAmount">New Salary Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="fixedAmount"
                  type="number"
                  placeholder="e.g., 75000"
                  value={fixedAmount}
                  onChange={(e) => setFixedAmount(e.target.value)}
                  className="pl-7"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                All selected employees will have their salary set to this amount.
              </p>
            </div>
          )}

          {/* Percentage Input */}
          {updateType === 'percentage' && (
            <div className="space-y-2">
              <Label htmlFor="percentage">Percentage Change</Label>
              <div className="relative">
                <Input
                  id="percentage"
                  type="number"
                  placeholder="e.g., 5"
                  value={percentage}
                  onChange={(e) => setPercentage(e.target.value)}
                  className="pr-7"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Enter a positive value for increase or negative for decrease.
              </p>
            </div>
          )}

          {/* Employee Salaries Table */}
          <div className="space-y-2">
            <Label>Employee Salaries</Label>
            <ScrollArea className="h-[200px] rounded-md border">
              <div className="p-4 space-y-3">
                {selectedMembers.map((member) => {
                  const currentSalary = member.salary || 0;
                  const newSalary = getNewSalary(member);
                  const diff = newSalary - currentSalary;
                  
                  return (
                    <div
                      key={member.id}
                      className="flex items-center justify-between gap-4 py-2 border-b last:border-0"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {member.firstName} {member.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Current: {formatCurrency(currentSalary)}
                        </p>
                      </div>
                      
                      {updateType === 'custom' ? (
                        <div className="relative w-32">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                          <Input
                            type="number"
                            value={customSalaries[member.id] || ''}
                            onChange={(e) => setCustomSalaries(prev => ({
                              ...prev,
                              [member.id]: e.target.value
                            }))}
                            className="pl-7 h-8 text-sm"
                          />
                        </div>
                      ) : (
                        <div className="text-right">
                          <p className="text-sm font-medium">{formatCurrency(newSalary)}</p>
                          {diff !== 0 && (
                            <p className={`text-xs ${diff > 0 ? 'text-emerald-600' : 'text-destructive'}`}>
                              {diff > 0 ? '+' : ''}{formatCurrency(diff)}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </div>

          {/* Summary */}
          <div className="rounded-lg bg-muted/50 p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Current Salaries:</span>
              <span>{formatCurrency(summary.totalCurrent)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total New Salaries:</span>
              <span>{formatCurrency(summary.totalNew)}</span>
            </div>
            <div className="flex justify-between text-sm font-medium pt-2 border-t">
              <span>Total Change:</span>
              <span className={summary.difference >= 0 ? 'text-emerald-600' : 'text-destructive'}>
                {summary.difference >= 0 ? '+' : ''}{formatCurrency(summary.difference)}
              </span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!isValid}>
            Update Salaries
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
