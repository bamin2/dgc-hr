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
import { Employee, useUpdateEmployee } from "@/hooks/useEmployees";
import { toast } from "@/hooks/use-toast";

interface BankDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: Employee;
}

export function BankDetailsDialog({ open, onOpenChange, employee }: BankDetailsDialogProps) {
  const [bankName, setBankName] = useState(employee.bankName || "");
  const [accountNumber, setAccountNumber] = useState(employee.bankAccountNumber || "");
  const [iban, setIban] = useState(employee.iban || "");
  const updateEmployee = useUpdateEmployee();

  useEffect(() => {
    if (open) {
      setBankName(employee.bankName || "");
      setAccountNumber(employee.bankAccountNumber || "");
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
        bank_name: bankName || null,
        bank_account_number: accountNumber || null,
        iban: iban || null,
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
            <Input
              id="bankName"
              placeholder="e.g., National Bank of Bahrain"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
            />
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
