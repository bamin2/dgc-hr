import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { usePendingTripApprovals, useApproveBusinessTrip, useRejectBusinessTrip } from '@/hooks/useBusinessTrips';
import { useRole } from '@/contexts/RoleContext';
import { TripCard } from './TripCard';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { TripCardSkeleton } from './TripCardSkeleton';

export function TripApprovalsTab() {
  const navigate = useNavigate();
  const { currentUser } = useRole();
  const isHROrAdmin = currentUser.role === 'hr' || currentUser.role === 'admin';
  
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  
  const approveTrip = useApproveBusinessTrip();
  const rejectTrip = useRejectBusinessTrip();

  // Single consolidated query for pending approvals
  const { data: pendingTrips = [], isLoading } = usePendingTripApprovals(isHROrAdmin);

  const handleApprove = async (tripId: string) => {
    await approveTrip.mutateAsync({ tripId, asHR: isHROrAdmin });
  };

  const handleRejectClick = (tripId: string) => {
    setSelectedTripId(tripId);
    setRejectReason('');
    setRejectDialogOpen(true);
  };

  const handleRejectConfirm = async () => {
    if (!selectedTripId || !rejectReason.trim()) return;
    await rejectTrip.mutateAsync({ tripId: selectedTripId, reason: rejectReason });
    setRejectDialogOpen(false);
    setSelectedTripId(null);
    setRejectReason('');
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-6 w-48 bg-muted rounded animate-pulse" />
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <TripCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (pendingTrips.length === 0) {
    return (
      <Card className="p-12 text-center">
        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
        <p className="text-lg font-medium">All caught up!</p>
        <p className="text-muted-foreground">No pending trip approvals at this time.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          Pending Approvals ({pendingTrips.length})
        </h2>
      </div>

      <div className="grid gap-4">
        {pendingTrips.map(trip => (
          <Card key={trip.id} className="p-4">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex-1">
                <TripCard trip={trip} showEmployee onClick={() => navigate(`/business-trips/${trip.id}`)} />
              </div>
              <div className="flex gap-2 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRejectClick(trip.id)}
                  disabled={approveTrip.isPending || rejectTrip.isPending}
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Reject
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleApprove(trip.id)}
                  disabled={approveTrip.isPending || rejectTrip.isPending}
                >
                  {approveTrip.isPending ? (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-1" />
                  )}
                  Approve
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Trip Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reject-reason">Reason for Rejection *</Label>
              <Textarea
                id="reject-reason"
                placeholder="Please provide a reason for rejecting this trip request..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="mt-2"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectConfirm}
              disabled={!rejectReason.trim() || rejectTrip.isPending}
            >
              {rejectTrip.isPending && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}