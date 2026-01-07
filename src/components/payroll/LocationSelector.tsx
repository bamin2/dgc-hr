import { Building2, Users, FileText, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useWorkLocations, WorkLocation } from "@/hooks/useWorkLocations";
import { Skeleton } from "@/components/ui/skeleton";

interface LocationSelectorProps {
  onSelectLocation: (location: WorkLocation) => void;
  draftCounts?: Record<string, number>;
}

export function LocationSelector({ onSelectLocation, draftCounts = {} }: LocationSelectorProps) {
  const { data: locations = [], isLoading } = useWorkLocations();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Select Work Location</h2>
          <p className="text-sm text-muted-foreground">Choose a location to view or create payroll runs</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  if (locations.length === 0) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">No Work Locations</h3>
        <p className="text-sm text-muted-foreground">
          Please create work locations in Settings before running payroll.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Select Work Location</h2>
        <p className="text-sm text-muted-foreground">Choose a location to view or create payroll runs</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {locations.map((location) => {
          const hasDraft = (draftCounts[location.id] || 0) > 0;
          
          return (
            <Card
              key={location.id}
              className="cursor-pointer hover:border-primary transition-colors"
              onClick={() => onSelectLocation(location)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">{location.name}</h3>
                      <p className="text-xs text-muted-foreground">{location.currency}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{location.employeeCount || 0} employees</span>
                  </div>
                  
                  {hasDraft ? (
                    <div className="flex items-center gap-2 text-sm text-warning">
                      <FileText className="h-4 w-4" />
                      <span>{draftCounts[location.id]} draft pending</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-success">
                      <FileText className="h-4 w-4" />
                      <span>No pending runs</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
