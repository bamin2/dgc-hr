import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CorrectionStatusBadge } from './CorrectionStatusBadge';
import { ReviewCorrectionDialog } from './ReviewCorrectionDialog';
import type { AttendanceCorrection, CorrectionStatus } from '@/hooks/useAttendanceCorrections';
import { formatDisplayDate } from '@/lib/dateUtils';
import { Eye, ArrowRight } from 'lucide-react';
import { useRole } from '@/contexts/RoleContext';
import { useAuth } from '@/hooks/useAuth';
import { useEmployee } from '@/hooks/useEmployees';

interface AttendanceCorrectionsTableProps {
  corrections: AttendanceCorrection[];
  showReviewActions?: boolean;
  reviewerType?: 'manager' | 'hr';
}

export function AttendanceCorrectionsTable({
  corrections,
  showReviewActions = false,
  reviewerType,
}: AttendanceCorrectionsTableProps) {
  const [selectedCorrection, setSelectedCorrection] = useState<AttendanceCorrection | null>(null);
  const { user } = useAuth();
  const { data: currentEmployee } = useEmployee(user?.id);

  if (corrections.length === 0) {
    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">No correction requests found</p>
        </CardContent>
      </Card>
    );
  }

  const canReview = (correction: AttendanceCorrection) => {
    if (!showReviewActions || !reviewerType || !currentEmployee) return false;
    
    if (reviewerType === 'manager') {
      return correction.status === 'pending_manager';
    }
    return correction.status === 'pending_hr';
  };

  return (
    <>
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Employee</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Original</TableHead>
                <TableHead>Requested</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {corrections.map((correction) => (
                <TableRow key={correction.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={correction.employee?.avatar_url || undefined} />
                        <AvatarFallback className="text-xs">
                          {correction.employee?.first_name?.[0]}
                          {correction.employee?.last_name?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">
                          {correction.employee?.first_name} {correction.employee?.last_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {correction.employee?.department?.name || 'No Department'}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {formatDisplayDate(correction.date)}
                  </TableCell>
                  <TableCell className="font-mono text-sm text-muted-foreground">
                    {correction.original_check_in || '--:--'} - {correction.original_check_out || '--:--'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 font-mono text-sm">
                      <span className="text-primary font-medium">
                        {correction.corrected_check_in} - {correction.corrected_check_out || '--:--'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <CorrectionStatusBadge status={correction.status} />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDisplayDate(correction.created_at)}
                  </TableCell>
                  <TableCell className="text-right">
                    {canReview(correction) ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedCorrection(correction)}
                      >
                        Review
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedCorrection(correction)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {selectedCorrection && showReviewActions && reviewerType && currentEmployee && (
        <ReviewCorrectionDialog
          correction={selectedCorrection}
          reviewerType={reviewerType}
          reviewerId={currentEmployee.id}
          open={!!selectedCorrection}
          onOpenChange={(open) => !open && setSelectedCorrection(null)}
        />
      )}
    </>
  );
}
