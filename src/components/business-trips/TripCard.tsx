import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, CreditCard, Car, Plane } from 'lucide-react';
import { BusinessTrip, TRIP_STATUS_LABELS, TRIP_STATUS_COLORS, TRAVEL_MODE_LABELS } from '@/types/businessTrips';
import { cn } from '@/lib/utils';
import { getCountryByName } from '@/data/countries';

interface TripCardProps {
  trip: BusinessTrip;
  onClick?: () => void;
  showEmployee?: boolean;
}

export function TripCard({ trip, onClick, showEmployee = false }: TripCardProps) {
  const statusColor = TRIP_STATUS_COLORS[trip.status];
  
  return (
    <Card 
      className={cn(
        "cursor-pointer transition-all duration-200 hover:bg-white/60 dark:hover:bg-white/10 hover:shadow-sm",
        onClick && "hover:scale-[1.01]"
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base font-semibold line-clamp-1">
            {trip.destination?.name || 'Unknown Destination'}
          </CardTitle>
          <Badge className={cn("shrink-0", statusColor)}>
            {TRIP_STATUS_LABELS[trip.status]}
          </Badge>
        </div>
        {showEmployee && trip.employee && (
          <p className="text-sm text-muted-foreground">
            {trip.employee.first_name} {trip.employee.last_name}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Dates */}
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>
            {format(new Date(trip.start_date), 'MMM d')} - {format(new Date(trip.end_date), 'MMM d, yyyy')}
          </span>
          <span className="text-muted-foreground">({trip.nights_count} nights)</span>
        </div>

        {/* Origin */}
        {trip.origin_country && (
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">From:</span>
            <span className="flex items-center gap-1">
              {getCountryByName(trip.origin_country)?.flag}
              <span>{trip.origin_country}{trip.origin_city && `, ${trip.origin_city}`}</span>
            </span>
          </div>
        )}

        {/* Travel Mode */}
        <div className="flex items-center gap-2 text-sm">
          {trip.travel_mode === 'car' ? (
            <Car className="h-4 w-4 text-muted-foreground" />
          ) : (
            <Plane className="h-4 w-4 text-muted-foreground" />
          )}
          <span>{TRAVEL_MODE_LABELS[trip.travel_mode]}</span>
        </div>

        {/* Financial Summary */}
        <div className="pt-2 border-t space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Per Diem Budget:</span>
            <span className="font-medium">BHD {trip.per_diem_budget_bhd.toFixed(3)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Per Diem Payable:</span>
            <span className="font-medium text-primary">
              BHD {trip.per_diem_payable_bhd.toFixed(3)}
            </span>
          </div>
          {trip.corporate_card_used && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <CreditCard className="h-3 w-3" />
              <span>Corporate Card</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
