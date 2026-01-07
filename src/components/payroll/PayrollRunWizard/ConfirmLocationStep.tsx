import { Building2, Users, Banknote } from "lucide-react";
import { WorkLocation } from "@/hooks/useWorkLocations";

interface ConfirmLocationStepProps {
  location: WorkLocation;
}

export function ConfirmLocationStep({ location }: ConfirmLocationStepProps) {
  return (
    <div>
      <h2 className="text-xl font-semibold text-foreground mb-2">Confirm Location</h2>
      <p className="text-muted-foreground mb-6">
        You are about to run payroll for the following location. This cannot be changed during the payroll run.
      </p>

      <div className="bg-muted/30 rounded-lg p-6 border">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 rounded-lg bg-primary/10">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-foreground">{location.name}</h3>
            <p className="text-sm text-muted-foreground">{location.country}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2 text-sm">
            <Banknote className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Currency:</span>
            <span className="font-medium text-foreground">{location.currency}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Employees:</span>
            <span className="font-medium text-foreground">{location.employeeCount || 0}</span>
          </div>
        </div>
      </div>

      <p className="text-sm text-muted-foreground mt-4">
        Click Continue to proceed to pay period selection.
      </p>
    </div>
  );
}
