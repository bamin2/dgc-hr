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
import { WorkLocation, WorkLocationInput } from "@/hooks/useWorkLocations";

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
  const [isRemote, setIsRemote] = useState(false);

  useEffect(() => {
    if (workLocation) {
      setName(workLocation.name);
      setAddress(workLocation.address || "");
      setCity(workLocation.city || "");
      setCountry(workLocation.country || "");
      setIsRemote(workLocation.is_remote);
    } else {
      setName("");
      setAddress("");
      setCity("");
      setCountry("");
      setIsRemote(false);
    }
  }, [workLocation, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      address: address || null,
      city: city || null,
      country: country || null,
      is_remote: isRemote,
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
