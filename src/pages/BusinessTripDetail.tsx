import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/page-header';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useBusinessTrip } from '@/hooks/useBusinessTrips';
import { TripDetailView } from '@/components/business-trips/TripDetailView';

export default function BusinessTripDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: trip, isLoading, error } = useBusinessTrip(id);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !trip) {
    return (
      <DashboardLayout>
        <div className="space-y-4">
          <Button variant="ghost" onClick={() => navigate('/business-trips')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Business Trips
          </Button>
          <div className="text-center py-12">
            <p className="text-muted-foreground">Trip not found or access denied.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Trip Details"
          subtitle={trip.destination?.name || 'Unknown Destination'}
          breadcrumbs={[
            { label: 'Business Trips', href: '/business-trips' },
            { label: 'Trip Details' }
          ]}
        />

        <TripDetailView trip={trip} />
      </div>
    </DashboardLayout>
  );
}
