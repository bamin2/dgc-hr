import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Users } from 'lucide-react';

export interface Dependent {
  name: string;
  relationship: string;
  nationalId?: string;
}

interface DependentsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (dependents: Dependent[]) => void;
  employeeName: string;
  initialDependents?: Dependent[];
}

const RELATIONSHIP_OPTIONS = [
  'Spouse',
  'Child',
  'Parent',
  'Sibling',
  'Domestic Partner',
  'Other',
];

export const DependentsDialog = ({
  open,
  onOpenChange,
  onConfirm,
  employeeName,
  initialDependents = [],
}: DependentsDialogProps) => {
  const [showForm, setShowForm] = useState(initialDependents.length > 0);
  const [dependents, setDependents] = useState<Dependent[]>(
    initialDependents.length > 0 ? initialDependents : [{ name: '', relationship: '', nationalId: '' }]
  );

  const handleAddDependent = () => {
    setDependents([...dependents, { name: '', relationship: '', nationalId: '' }]);
  };

  const handleRemoveDependent = (index: number) => {
    setDependents(dependents.filter((_, i) => i !== index));
  };

  const handleDependentChange = (index: number, field: keyof Dependent, value: string) => {
    const updated = [...dependents];
    updated[index] = { ...updated[index], [field]: value };
    setDependents(updated);
  };

  const handleNoDependents = () => {
    onConfirm([]);
    onOpenChange(false);
    resetState();
  };

  const handleConfirm = () => {
    const validDependents = dependents.filter(d => d.name.trim() && d.relationship);
    onConfirm(validDependents);
    onOpenChange(false);
    resetState();
  };

  const resetState = () => {
    setShowForm(false);
    setDependents([{ name: '', relationship: '', nationalId: '' }]);
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      resetState();
    }
    onOpenChange(isOpen);
  };

  const isFormValid = showForm ? dependents.some(d => d.name.trim() && d.relationship) : true;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Dependents Information
          </DialogTitle>
          <DialogDescription>
            Does <span className="font-medium text-foreground">{employeeName}</span> have any dependents to add to this enrollment?
          </DialogDescription>
        </DialogHeader>

        {!showForm ? (
          <div className="flex flex-col gap-3 py-4">
            <Button
              variant="outline"
              className="w-full justify-start h-auto py-4"
              onClick={handleNoDependents}
            >
              <div className="text-left">
                <div className="font-medium">No Dependents</div>
                <div className="text-sm text-muted-foreground">Employee only enrollment</div>
              </div>
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start h-auto py-4"
              onClick={() => setShowForm(true)}
            >
              <div className="text-left">
                <div className="font-medium">Add Dependents</div>
                <div className="text-sm text-muted-foreground">Spouse, children, or other family members</div>
              </div>
            </Button>
          </div>
        ) : (
          <div className="space-y-4 py-4 max-h-[400px] overflow-y-auto">
            {dependents.map((dependent, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-3 bg-muted/30">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Dependent {index + 1}</span>
                  {dependents.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveDependent(index)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`name-${index}`}>Full Name *</Label>
                  <Input
                    id={`name-${index}`}
                    placeholder="Enter dependent's full name"
                    value={dependent.name}
                    onChange={(e) => handleDependentChange(index, 'name', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`relationship-${index}`}>Relationship *</Label>
                  <Select
                    value={dependent.relationship}
                    onValueChange={(value) => handleDependentChange(index, 'relationship', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select relationship" />
                    </SelectTrigger>
                    <SelectContent>
                      {RELATIONSHIP_OPTIONS.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`nationalId-${index}`}>National ID / Passport (Optional)</Label>
                  <Input
                    id={`nationalId-${index}`}
                    placeholder="Enter ID or passport number"
                    value={dependent.nationalId || ''}
                    onChange={(e) => handleDependentChange(index, 'nationalId', e.target.value)}
                  />
                </div>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleAddDependent}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Another Dependent
            </Button>
          </div>
        )}

        {showForm && (
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>
              Back
            </Button>
            <Button onClick={handleConfirm} disabled={!isFormValid}>
              Confirm Dependents
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};
