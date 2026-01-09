import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { CountrySelect } from "@/components/ui/country-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WorkLocation, WorkLocationInput } from "@/hooks/useWorkLocations";
import { currencies, getCurrencyForCountry } from "@/data/currencies";

interface WorkLocationFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workLocation?: WorkLocation | null;
  onSubmit: (data: WorkLocationInput) => void;
  isLoading?: boolean;
}

export function WorkLocationFormDialog({
  open,
  onOpenChange,
  workLocation,
  onSubmit,
  isLoading,
}: WorkLocationFormDialogProps) {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [isRemote, setIsRemote] = useState(false);
  const [isHQ, setIsHQ] = useState(false);

  useEffect(() => {
    if (workLocation) {
      setName(workLocation.name);
      setAddress(workLocation.address || "");
      setCity(workLocation.city || "");
      setCountry(workLocation.country || "");
      setCurrency(workLocation.currency || "USD");
      setIsRemote(workLocation.is_remote);
      setIsHQ(workLocation.is_hq);
    } else {
      setName("");
      setAddress("");
      setCity("");
      setCountry("");
      setCurrency("USD");
      setIsRemote(false);
      setIsHQ(false);
    }
  }, [workLocation, open]);

  // Auto-update currency when country changes
  useEffect(() => {
    if (country && !workLocation) {
      const defaultCurrency = getCurrencyForCountry(country);
      setCurrency(defaultCurrency);
    }
  }, [country, workLocation]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      address: address || null,
      city: city || null,
      country: country || null,
      currency,
      is_remote: isRemote,
      is_hq: isHQ,
    });
  };

  const isEdit = !!workLocation;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {isEdit ? "Edit Work Location" : "Add Work Location"}
            </DialogTitle>
            <DialogDescription>
              {isEdit
                ? "Update the work location details."
                : "Add a new work location to your organization."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Headquarters"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Street address"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="City"
                />
              </div>

              <div className="space-y-2">
                <Label>Country</Label>
                <CountrySelect
                  value={country}
                  onValueChange={setCountry}
                  placeholder="Select country"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Currency</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((cur) => (
                    <SelectItem key={cur.code} value={cur.code}>
                      {cur.code} - {cur.name} ({cur.symbol})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Used for salary display in this location
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_remote"
                checked={isRemote}
                onCheckedChange={(checked) => setIsRemote(checked === true)}
              />
              <Label htmlFor="is_remote" className="font-normal">
                This is a remote/virtual location
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_hq"
                checked={isHQ}
                onCheckedChange={(checked) => setIsHQ(checked === true)}
              />
              <Label htmlFor="is_hq" className="font-normal">
                Mark as Headquarters (HQ)
              </Label>
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
            <Button type="submit" disabled={!name || isLoading}>
              {isLoading ? "Saving..." : isEdit ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
