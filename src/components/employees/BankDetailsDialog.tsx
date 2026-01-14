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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Employee, useUpdateEmployee } from "@/hooks/useEmployees";
import { useBanks } from "@/hooks/useBanks";
import { toast } from "@/hooks/use-toast";

interface BankDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: Employee;
}

export function BankDetailsDialog({ open, onOpenChange, employee }: BankDetailsDialogProps) {
  const [bankName, setBankName] = useState(employee.bank_name || "");
  const [accountNumber, setAccountNumber] = useState(employee.bank_account_number || "");
  const [iban, setIban] = useState(employee.iban || "");
  const updateEmployee = useUpdateEmployee();
  const { data: banks } = useBanks();

  const activeBanks = banks?.filter((b) => b.is_active) || [];

  useEffect(() => {
    if (open) {
      setBankName(employee.bank_name || "");
      setAccountNumber(employee.bank_account_number || "");
      setIban(employee.iban || "");
    }
  }, [open, employee]);

  const handleSave = () => {
    if (!iban.trim()) {
      toast({
        title: "IBAN Required",
        description: "Please enter the IBAN to save bank details.",
        variant: "destructive",
      });
      return;
    }

    updateEmployee.mutate(
      {
        id: employee.id,
        updates: {
          bank_name: bankName || null,
          bank_account_number: accountNumber || null,
          iban: iban || null,
        },
      },
      {
        onSuccess: () => {
          toast({
            title: "Bank details updated",
            description: "Employee bank information has been saved.",
          });
          onOpenChange(false);
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Failed to update bank details.",
            variant: "destructive",
          });
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Bank Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="bankName">Bank Name</Label>
            <Select value={bankName} onValueChange={setBankName}>
              <SelectTrigger id="bankName">
                <SelectValue placeholder="Select a bank" />
              </SelectTrigger>
              <SelectContent>
                {activeBanks.map((bank) => (
                  <SelectItem key={bank.id} value={bank.name}>
                    {bank.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="accountNumber">Account Number (Optional)</Label>
            <Input
              id="accountNumber"
              placeholder="Enter account number"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="iban">IBAN</Label>
            <Input
              id="iban"
              placeholder="e.g., BH67NBOB00001234567890"
              value={iban}
              onChange={(e) => setIban(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={updateEmployee.isPending || !iban.trim()}>
            {updateEmployee.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
