import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plane, MapPin, Calendar, Clock, Plus, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { BentoCard } from "./BentoCard";
import { useMyBusinessTrips } from "@/hooks/useBusinessTrips";
import { useRole } from "@/contexts/RoleContext";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { CreateTripDialog } from "@/components/business-trips/CreateTripDialog";

interface BusinessTripsCardProps {
  /** Compact variant for mobile - shows next trip or quick action */
  variant?: "default" | "compact";
}

export function BusinessTripsCard({ variant = "default" }: BusinessTripsCardProps) {
  const navigate = useNavigate();
  const { canEditEmployees, isManager } = useRole();
  const { data: trips, isLoading } = useMyBusinessTrips();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const isCompact = variant === "compact";

  // Find next upcoming trip (approved or submitted)
  const upcomingTrip = trips?.find(
    (trip) => 
      (trip.status === "hr_approved" || trip.status === "manager_approved" || trip.status === "submitted") &&
      new Date(trip.start_date) >= new Date()
  );

  // Count pending trips (for managers/HR)
  const pendingTrips = trips?.filter((trip) => trip.status === "submitted").length || 0;

  // Determine if trip is approved (any approval status)
  const isApproved = upcomingTrip?.status === "hr_approved" || upcomingTrip?.status === "manager_approved";

  if (isLoading) {
    return (
      <BentoCard colSpan={isCompact ? 12 : 4}>
        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="w-5 h-5 rounded" />
          <Skeleton className="h-5 w-28" />
        </div>
        <div className="space-y-3">
          <Skeleton className={cn("w-full rounded-xl", isCompact ? "h-14" : "h-20")} />
        </div>
      </BentoCard>
    );
  }

  // Compact mobile variant
  if (isCompact) {
    return (
      <>
        <BentoCard 
          colSpan={12} 
          onClick={() => upcomingTrip ? navigate("/business-trips") : setCreateDialogOpen(true)}
          className="cursor-pointer p-4"
        >
          {upcomingTrip ? (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                <Plane className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground truncate">
                    {upcomingTrip.destination?.name || "Business Trip"}
                  </span>
                  <span className={cn(
                    "text-xs px-2 py-0.5 rounded-full shrink-0",
                    isApproved 
                      ? "bg-green-500/10 text-green-600" 
                      : "bg-amber-500/10 text-amber-600"
                  )}>
                    {isApproved ? "Approved" : "Pending"}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {format(new Date(upcomingTrip.start_date), "MMM d")} - {format(new Date(upcomingTrip.end_date), "MMM d")}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground/50 shrink-0" />
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
                <Plus className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">Plan a Business Trip</p>
                <p className="text-xs text-muted-foreground">Request travel for work</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground/50 shrink-0" />
            </div>
          )}
        </BentoCard>
        <CreateTripDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
      </>
    );
  }

  return (
    <BentoCard 
      colSpan={2} 
      onClick={() => navigate("/business-trips")}
      className="cursor-pointer"
    >
      <div className="flex items-center gap-2 mb-4">
        <Plane className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-foreground">Business Trips</h3>
      </div>

      {upcomingTrip ? (
        <div className="bg-secondary/30 rounded-xl p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              <span className="font-medium text-foreground">
                {upcomingTrip.destination?.name || "Trip"}
              </span>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              isApproved 
                ? "bg-green-500/10 text-green-600" 
                : "bg-amber-500/10 text-amber-600"
            }`}>
              {upcomingTrip.status.replace("_", " ")}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-3.5 h-3.5" />
            <span>
              {format(new Date(upcomingTrip.start_date), "MMM d")} - {format(new Date(upcomingTrip.end_date), "MMM d")}
            </span>
          </div>
          {upcomingTrip.per_diem_budget_bhd > 0 && (
            <div className="mt-2 pt-2 border-t border-border/50">
              <p className="text-xs text-muted-foreground">
                Per diem budget: <span className="font-medium text-foreground">{upcomingTrip.per_diem_budget_bhd} BHD</span>
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-secondary/30 rounded-xl p-4 text-center">
          <Plane className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No upcoming trips</p>
        </div>
      )}

      {/* Show pending count for managers/HR */}
      {(isManager || canEditEmployees) && pendingTrips > 0 && (
        <div className="mt-3 flex items-center gap-2 text-sm">
          <Clock className="w-4 h-4 text-amber-500" />
          <span className="text-muted-foreground">
            <span className="font-medium text-foreground">{pendingTrips}</span> pending approval
          </span>
        </div>
      )}
    </BentoCard>
  );
}
