import { useState } from 'react';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2 } from 'lucide-react';
import { BusinessTrip, AmendmentChangeType } from '@/types/businessTrips';
import { useRequestAmendment } from '@/hooks/useBusinessTripAmendments';

interface TripAmendmentDialogProps {
  trip: BusinessTrip;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TripAmendmentDialog({ trip, open, onOpenChange }: TripAmendmentDialogProps) {
  const requestAmendment = useRequestAmendment();
  
  const [changeType, setChangeType] = useState<AmendmentChangeType>('dates');
  const [reason, setReason] = useState('');
  const [proposedValues, setProposedValues] = useState({
    start_date: trip.start_date,
    end_date: trip.end_date,
    destination_id: trip.destination_id,
    travel_mode: trip.travel_mode,
    other_details: '',
  });

  const handleSubmit = async () => {
    const original: Record<string, unknown> = {};
    const proposed: Record<string, unknown> = {};

    switch (changeType) {
      case 'dates':
        original.start_date = trip.start_date;
        original.end_date = trip.end_date;
        proposed.start_date = proposedValues.start_date;
        proposed.end_date = proposedValues.end_date;
        break;
      case 'destination':
        original.destination_id = trip.destination_id;
        proposed.destination_id = proposedValues.destination_id;
        break;
      case 'travel_mode':
        original.travel_mode = trip.travel_mode;
        proposed.travel_mode = proposedValues.travel_mode;
        break;
      case 'other':
        proposed.details = proposedValues.other_details;
        break;
    }

    await requestAmendment.mutateAsync({
      trip_id: trip.id,
      change_type: changeType,
      original_values: original,
      proposed_values: proposed,
      reason,
    });

    onOpenChange(false);
    setReason('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Request Amendment</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Change Type */}
          <div className="space-y-3">
            <Label>What do you want to change?</Label>
            <RadioGroup
              value={changeType}
              onValueChange={(v) => setChangeType(v as AmendmentChangeType)}
              className="space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="dates" id="dates" />
                <Label htmlFor="dates" className="font-normal">Trip Dates</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="destination" id="destination" />
                <Label htmlFor="destination" className="font-normal">Destination</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="travel_mode" id="travel_mode" />
                <Label htmlFor="travel_mode" className="font-normal">Travel Mode</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="other" id="other" />
                <Label htmlFor="other" className="font-normal">Other</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Proposed Values based on change type */}
          {changeType === 'dates' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>New Start Date</Label>
                <Input
                  type="date"
                  value={proposedValues.start_date}
                  onChange={(e) => setProposedValues({ ...proposedValues, start_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>New End Date</Label>
                <Input
                  type="date"
                  value={proposedValues.end_date}
                  onChange={(e) => setProposedValues({ ...proposedValues, end_date: e.target.value })}
                />
              </div>
            </div>
          )}

          {changeType === 'travel_mode' && (
            <div className="space-y-2">
              <Label>New Travel Mode</Label>
              <RadioGroup
                value={proposedValues.travel_mode}
                onValueChange={(v) => setProposedValues({ ...proposedValues, travel_mode: v as 'plane' | 'car' })}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="plane" id="plane-new" />
                  <Label htmlFor="plane-new" className="font-normal">Plane</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="car" id="car-new" />
                  <Label htmlFor="car-new" className="font-normal">Car</Label>
                </div>
              </RadioGroup>
            </div>
          )}

          {changeType === 'other' && (
            <div className="space-y-2">
              <Label>Describe the change</Label>
              <Textarea
                value={proposedValues.other_details}
                onChange={(e) => setProposedValues({ ...proposedValues, other_details: e.target.value })}
                placeholder="Describe what you would like to change..."
              />
            </div>
          )}

          {/* Reason */}
          <div className="space-y-2">
            <Label>Reason for Amendment *</Label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain why this change is needed..."
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!reason.trim() || requestAmendment.isPending}
          >
            {requestAmendment.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Submit Amendment Request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
