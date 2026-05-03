import { Plane } from "lucide-react";
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { TripDetailView } from "@/components/business-trips/TripDetailView";
import { useBusinessTrip } from "@/hooks/useBusinessTrips";

interface BusinessTripDetailSheetProps {
  tripId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BusinessTripDetailSheet({
  tripId,
  open,
  onOpenChange,
}: BusinessTripDetailSheetProps) {
  const { data: trip, isLoading } = useBusinessTrip(tripId ?? undefined);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[92vh] rounded-t-xl p-0">
        <SheetHeader className="border-b">
          <SheetTitle className="flex items-center gap-2">
            <Plane className="h-5 w-5" />
            Business Trip
          </SheetTitle>
        </SheetHeader>

        <SheetBody className="py-5">
          {isLoading || !trip ? (
            <div className="space-y-4">
              <Skeleton className="h-20 w-full rounded-xl" />
              <Skeleton className="h-48 w-full rounded-xl" />
              <Skeleton className="h-48 w-full rounded-xl" />
            </div>
          ) : (
            <TripDetailView trip={trip} />
          )}
        </SheetBody>
      </SheetContent>
    </Sheet>
  );
}
