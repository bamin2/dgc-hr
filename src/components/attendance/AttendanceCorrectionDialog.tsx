import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useCreateAttendanceCorrection } from '@/hooks/useAttendanceCorrections';
import type { AttendanceRecord } from '@/hooks/useAttendanceRecords';
import { format } from 'date-fns';

interface AttendanceCorrectionDialogProps {
  attendanceRecord: AttendanceRecord;
  employeeId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AttendanceCorrectionDialog({
  attendanceRecord,
  employeeId,
  open,
  onOpenChange,
}: AttendanceCorrectionDialogProps) {
  const [correctedCheckIn, setCorrectedCheckIn] = useState(attendanceRecord.check_in || '');
  const [correctedCheckOut, setCorrectedCheckOut] = useState(attendanceRecord.check_out || '');
  const [reason, setReason] = useState('');

  const createCorrection = useCreateAttendanceCorrection();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reason.trim()) {
      return;
    }

    await createCorrection.mutateAsync({
      employee_id: employeeId,
      attendance_record_id: attendanceRecord.id,
      date: attendanceRecord.date,
      original_check_in: attendanceRecord.check_in,
      original_check_out: attendanceRecord.check_out,
      corrected_check_in: correctedCheckIn,
      corrected_check_out: correctedCheckOut || null,
      reason: reason.trim(),
    });

    onOpenChange(false);
    setReason('');
  };

  const formattedDate = format(new Date(attendanceRecord.date), 'EEEE, MMMM d, yyyy');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle>Request Attendance Correction</DialogTitle>
          <DialogDescription>
            Submit a correction request for {formattedDate}. This will require approval from your manager and HR.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Original Times */}
          <div className="rounded-lg bg-muted/50 p-3 space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Original Times</p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Check In:</span>{' '}
                <span className="font-medium">{attendanceRecord.check_in || 'Not recorded'}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Check Out:</span>{' '}
                <span className="font-medium">{attendanceRecord.check_out || 'Not recorded'}</span>
              </div>
            </div>
          </div>

          {/* Corrected Times */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="corrected-check-in">Corrected Check In</Label>
              <Input
                id="corrected-check-in"
                type="time"
                value={correctedCheckIn}
                onChange={(e) => setCorrectedCheckIn(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="corrected-check-out">Corrected Check Out</Label>
              <Input
                id="corrected-check-out"
                type="time"
                value={correctedCheckOut}
                onChange={(e) => setCorrectedCheckOut(e.target.value)}
              />
            </div>
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Correction</Label>
            <Textarea
              id="reason"
              placeholder="Please explain why you need this correction..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createCorrection.isPending || !reason.trim()}>
              {createCorrection.isPending ? 'Submitting...' : 'Submit Request'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
