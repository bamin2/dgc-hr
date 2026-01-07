import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings } from "lucide-react";
import { WorkLocation, useUpdateWorkLocation } from "@/hooks/useWorkLocations";
import { toast } from "sonner";

interface LocationGeneralSettingsProps {
  workLocation: WorkLocation;
}

export function LocationGeneralSettings({ workLocation }: LocationGeneralSettingsProps) {
  const [gosiEnabled, setGosiEnabled] = useState(workLocation.gosi_enabled);
  const [gosiPercentage, setGosiPercentage] = useState(
    workLocation.gosi_percentage?.toString() || "8"
  );
  
  const updateLocation = useUpdateWorkLocation();

  const handleGosiToggle = async (enabled: boolean) => {
    setGosiEnabled(enabled);
    try {
      await updateLocation.mutateAsync({
        id: workLocation.id,
        name: workLocation.name,
        gosi_enabled: enabled,
        gosi_percentage: parseFloat(gosiPercentage) || 8,
      });
      toast.success(`GOSI deduction ${enabled ? "enabled" : "disabled"}`);
    } catch (error) {
      setGosiEnabled(!enabled);
      toast.error("Failed to update GOSI settings");
    }
  };

  const handlePercentageBlur = async () => {
    const percentage = parseFloat(gosiPercentage);
    if (isNaN(percentage) || percentage < 0 || percentage > 100) {
      setGosiPercentage(workLocation.gosi_percentage?.toString() || "8");
      toast.error("Please enter a valid percentage between 0 and 100");
      return;
    }

    if (percentage === workLocation.gosi_percentage) return;

    try {
      await updateLocation.mutateAsync({
        id: workLocation.id,
        name: workLocation.name,
        gosi_enabled: gosiEnabled,
        gosi_percentage: percentage,
      });
      toast.success("GOSI percentage updated");
    } catch (error) {
      setGosiPercentage(workLocation.gosi_percentage?.toString() || "8");
      toast.error("Failed to update GOSI percentage");
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Settings className="h-4 w-4" />
          General Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor={`gosi-toggle-${workLocation.id}`}>GOSI Deduction</Label>
            <p className="text-sm text-muted-foreground">
              Enable social insurance deductions for employees in this location.
            </p>
          </div>
          <Switch
            id={`gosi-toggle-${workLocation.id}`}
            checked={gosiEnabled}
            onCheckedChange={handleGosiToggle}
            disabled={updateLocation.isPending}
          />
        </div>

        {gosiEnabled && (
          <div className="space-y-2 pt-2 border-t">
            <Label htmlFor={`gosi-percentage-${workLocation.id}`}>GOSI Rate (%)</Label>
            <p className="text-sm text-muted-foreground">
              Employee contribution percentage of registered salary.
            </p>
            <div className="flex items-center gap-2 max-w-[200px]">
              <Input
                id={`gosi-percentage-${workLocation.id}`}
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={gosiPercentage}
                onChange={(e) => setGosiPercentage(e.target.value)}
                onBlur={handlePercentageBlur}
                disabled={updateLocation.isPending}
                className="text-right"
              />
              <span className="text-muted-foreground">%</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
