import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Filter, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useMyBusinessTrips } from '@/hooks/useBusinessTrips';
import { useRole } from '@/contexts/RoleContext';
import { TripCard } from './TripCard';
import { CreateTripDialog } from './CreateTripDialog';
import { TripCardSkeleton } from './TripCardSkeleton';
import { TRIP_STATUS_LABELS, TripStatus } from '@/types/businessTrips';

export function MyTripsTab() {
  const navigate = useNavigate();
  const { effectiveEmployeeId } = useRole();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  const { data: trips, isLoading, isError, error, refetch } = useMyBusinessTrips(effectiveEmployeeId);

  const filteredTrips = trips?.filter(trip => {
    if (statusFilter === 'all') return true;
    return trip.status === statusFilter;
  }) || [];

  return (
    <div className="space-y-6">
      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex gap-2 items-center">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {Object.entries(TRIP_STATUS_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Trip Request
        </Button>
      </div>

      {/* Error State */}
      {isError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>Failed to load trips: {error?.message || 'Unknown error'}</span>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Trips List */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <TripCardSkeleton key={i} />
          ))}
        </div>
      ) : filteredTrips.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground mb-4">
            {statusFilter === 'all' 
              ? "You don't have any business trip requests yet."
              : `No trips with status "${TRIP_STATUS_LABELS[statusFilter as TripStatus]}".`
            }
          </p>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Trip
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTrips.map(trip => (
            <TripCard 
              key={trip.id} 
              trip={trip} 
              onClick={() => navigate(`/business-trips/${trip.id}`)}
            />
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <CreateTripDialog 
        open={createDialogOpen} 
        onOpenChange={setCreateDialogOpen} 
      />
    </div>
  );
}
