import { useEffect, useState } from "react";
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
import { Switch } from "@/components/ui/switch";
import { useCreateBank, useUpdateBank, Bank } from "@/hooks/useBanks";

interface BankFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bank: Bank | null;
}

export const BankFormDialog = ({ open, onOpenChange, bank }: BankFormDialogProps) => {
  const [name, setName] = useState("");
  const [swiftCode, setSwiftCode] = useState("");
  const [country, setCountry] = useState("");
  const [isActive, setIsActive] = useState(true);

  const createBank = useCreateBank();
  const updateBank = useUpdateBank();

  const isEditing = !!bank;
  const isPending = createBank.isPending || updateBank.isPending;

  useEffect(() => {
    if (open) {
      if (bank) {
        setName(bank.name);
        setSwiftCode(bank.swift_code || "");
        setCountry(bank.country || "");
        setIsActive(bank.is_active);
      } else {
        setName("");
        setSwiftCode("");
        setCountry("");
        setIsActive(true);
      }
    }
  }, [open, bank]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const bankData = {
      name: name.trim(),
      swift_code: swiftCode.trim() || null,
      country: country.trim() || null,
      is_active: isActive,
    };

    if (isEditing) {
      await updateBank.mutateAsync({ id: bank.id, ...bankData });
    } else {
      await createBank.mutateAsync(bankData);
    }

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Bank" : "Add Bank"}</DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Update the bank details below"
                : "Enter the details for the new bank"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Bank Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter bank name"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="swiftCode">SWIFT/BIC Code</Label>
              <Input
                id="swiftCode"
                value={swiftCode}
                onChange={(e) => setSwiftCode(e.target.value.toUpperCase())}
                placeholder="e.g., NBOBBHBM"
                maxLength={11}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="e.g., Bahrain"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="isActive">Active</Label>
                <p className="text-sm text-muted-foreground">
                  Inactive banks won't appear in dropdowns
                </p>
              </div>
              <Switch
                id="isActive"
                checked={isActive}
                onCheckedChange={setIsActive}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim() || isPending}>
              {isPending ? "Saving..." : isEditing ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
