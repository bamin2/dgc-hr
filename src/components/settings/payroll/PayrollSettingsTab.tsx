import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AllowanceTemplatesSection } from "./AllowanceTemplatesSection";
import { DeductionTemplatesSection } from "./DeductionTemplatesSection";
import { useWorkLocations } from "@/hooks/useWorkLocations";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Building2 } from "lucide-react";

export function PayrollSettingsTab() {
  const { data: workLocations, isLoading } = useWorkLocations();
  const [selectedLocationId, setSelectedLocationId] = useState<string>("");

  // Set default location when data loads
  if (workLocations && workLocations.length > 0 && !selectedLocationId) {
    setSelectedLocationId(workLocations[0].id);
  }

  const selectedLocation = workLocations?.find((l) => l.id === selectedLocationId);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-96 mt-2" />
        </div>
        <Skeleton className="h-10 w-full" />
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (!workLocations || workLocations.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium">Payroll Templates</h3>
          <p className="text-sm text-muted-foreground">
            Manage allowance and deduction templates per work location.
          </p>
        </div>
        <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg bg-muted/20">
          <Building2 className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h4 className="font-medium text-foreground">No Work Locations</h4>
          <p className="text-sm text-muted-foreground mt-1 max-w-md">
            Create work locations first in the Organization tab to set up payroll templates with location-specific currencies.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Payroll Templates</h3>
        <p className="text-sm text-muted-foreground">
          Manage allowance and deduction templates per work location. Each location has its own templates with matching currency.
        </p>
      </div>

      <Tabs value={selectedLocationId} onValueChange={setSelectedLocationId}>
        <TabsList className="w-full justify-start h-auto flex-wrap gap-1 bg-muted/50 p-1">
          {workLocations.map((location) => (
            <TabsTrigger
              key={location.id}
              value={location.id}
              className="flex items-center gap-2 data-[state=active]:bg-background"
            >
              <MapPin className="h-3.5 w-3.5" />
              <span>{location.name}</span>
              <span className="text-xs text-muted-foreground">({location.currency})</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {workLocations.map((location) => (
          <TabsContent key={location.id} value={location.id} className="mt-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <AllowanceTemplatesSection
                workLocationId={location.id}
                currency={location.currency}
              />
              <DeductionTemplatesSection
                workLocationId={location.id}
                currency={location.currency}
              />
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
