import { useState } from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  MapPin, Calendar, Plane, Car, CreditCard, FileText,
  Edit, Send, XCircle, CheckCircle, AlertTriangle, Receipt, Loader2
} from 'lucide-react';
import { BusinessTrip, TRIP_STATUS_LABELS, TRIP_STATUS_COLORS, TRAVEL_MODE_LABELS } from '@/types/businessTrips';
import { useRole } from '@/contexts/RoleContext';
import { useAuth } from '@/contexts/AuthContext';
import { useSubmitBusinessTrip, useCancelBusinessTrip, useCloseBusinessTrip } from '@/hooks/useBusinessTrips';
import { TripExpensesSection } from './TripExpensesSection';
import { TripAmendmentDialog } from './TripAmendmentDialog';
import { cn } from '@/lib/utils';

interface TripDetailViewProps {
  trip: BusinessTrip;
}

export function TripDetailView({ trip }: TripDetailViewProps) {
  const { currentUser } = useRole();
  const { profile } = useAuth();
  const isHROrAdmin = currentUser.role === 'hr' || currentUser.role === 'admin';
  const isOwner = trip.employee_id === profile?.employee_id;
  
  const [amendmentDialogOpen, setAmendmentDialogOpen] = useState(false);
  
  const submitTrip = useSubmitBusinessTrip();
  const cancelTrip = useCancelBusinessTrip();
  const closeTrip = useCloseBusinessTrip();

  const canEdit = isOwner && (trip.status === 'draft' || trip.status === 'submitted');
  const canSubmit = isOwner && trip.status === 'draft';
  const canCancel = isOwner && ['draft', 'submitted', 'manager_approved'].includes(trip.status);
  const canRequestAmendment = isOwner && trip.status === 'hr_approved';
  const canAddExpenses = isOwner && ['hr_approved', 'completed'].includes(trip.status);
  const canClose = isHROrAdmin && ['hr_approved', 'completed'].includes(trip.status);

  const handleSubmit = async () => {
    await submitTrip.mutateAsync(trip.id);
  };

  const handleCancel = async () => {
    if (confirm('Are you sure you want to cancel this trip request?')) {
      await cancelTrip.mutateAsync(trip.id);
    }
  };

  const handleClose = async () => {
    if (confirm('Are you sure you want to reconcile and close this trip?')) {
      await closeTrip.mutateAsync(trip.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Status & Actions Bar */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Badge className={cn("text-sm", TRIP_STATUS_COLORS[trip.status])}>
                {TRIP_STATUS_LABELS[trip.status]}
              </Badge>
              {trip.rejection_reason && (
                <div className="flex items-center gap-1 text-destructive text-sm">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Rejected: {trip.rejection_reason}</span>
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {canSubmit && (
                <Button onClick={handleSubmit} disabled={submitTrip.isPending}>
                  {submitTrip.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  Submit for Approval
                </Button>
              )}
              {canCancel && (
                <Button variant="outline" onClick={handleCancel} disabled={cancelTrip.isPending}>
                  <XCircle className="h-4 w-4 mr-2" />
                  Cancel Trip
                </Button>
              )}
              {canRequestAmendment && (
                <Button variant="outline" onClick={() => setAmendmentDialogOpen(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Request Amendment
                </Button>
              )}
              {canClose && (
                <Button onClick={handleClose} disabled={closeTrip.isPending}>
                  {closeTrip.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  )}
                  Reconcile & Close
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Trip Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Trip Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Destination</p>
                <p className="font-medium">{trip.destination?.name || 'Unknown'}</p>
                {trip.destination?.country && (
                  <p className="text-sm text-muted-foreground">{trip.destination.country}</p>
                )}
              </div>
            </div>

            {trip.origin_location && (
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Origin</p>
                  <p className="font-medium">{trip.origin_location.name}</p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Dates</p>
                <p className="font-medium">
                  {format(new Date(trip.start_date), 'MMMM d, yyyy')} -{' '}
                  {format(new Date(trip.end_date), 'MMMM d, yyyy')}
                </p>
                <p className="text-sm text-muted-foreground">{trip.nights_count} nights</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              {trip.travel_mode === 'car' ? (
                <Car className="h-5 w-5 text-muted-foreground mt-0.5" />
              ) : (
                <Plane className="h-5 w-5 text-muted-foreground mt-0.5" />
              )}
              <div>
                <p className="text-sm text-muted-foreground">Travel Mode</p>
                <p className="font-medium">{TRAVEL_MODE_LABELS[trip.travel_mode]}</p>
              </div>
            </div>

            {trip.corporate_card_used && (
              <div className="flex items-start gap-3">
                <CreditCard className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Payment Method</p>
                  <p className="font-medium">Corporate Credit Card</p>
                </div>
              </div>
            )}

            {trip.flight_details && (
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Flight Details</p>
                  <p className="font-medium whitespace-pre-wrap">{trip.flight_details}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Financial Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Financial Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Per Diem Rate</span>
                <span className="font-medium">BHD {trip.per_diem_rate_bhd.toFixed(3)}/night</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Nights</span>
                <span className="font-medium">{trip.nights_count}</span>
              </div>
              {trip.travel_mode === 'car' && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Car Uplift</span>
                  <span className="font-medium">BHD {trip.car_uplift_total_bhd.toFixed(3)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Per Diem Budget</span>
                <span className="font-semibold">BHD {trip.per_diem_budget_bhd.toFixed(3)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Per Diem Payable</span>
                <span className="font-semibold text-primary">
                  BHD {trip.per_diem_payable_bhd.toFixed(3)}
                </span>
              </div>
              {trip.corporate_card_used && (
                <p className="text-xs text-muted-foreground">
                  * No cash payout - using corporate card
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Expenses Section */}
      <TripExpensesSection tripId={trip.id} canAddExpenses={canAddExpenses} isHROrAdmin={isHROrAdmin} />

      {/* Amendment Dialog */}
      <TripAmendmentDialog
        trip={trip}
        open={amendmentDialogOpen}
        onOpenChange={setAmendmentDialogOpen}
      />
    </div>
  );
}
