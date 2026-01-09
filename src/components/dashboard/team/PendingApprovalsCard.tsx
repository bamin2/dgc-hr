import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ClipboardList, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PendingApprovalsData {
  leaveRequests: number;
}

interface PendingApprovalsCardProps {
  pendingApprovals: PendingApprovalsData;
  isLoading?: boolean;
}

export function PendingApprovalsCard({ pendingApprovals, isLoading }: PendingApprovalsCardProps) {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-36" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    );
  }

  const total = pendingApprovals.leaveRequests;

  return (
    <Card className={total > 0 ? 'border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/20' : ''}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <ClipboardList className="h-4 w-4 text-primary" />
          Pending Approvals
        </CardTitle>
      </CardHeader>
      <CardContent>
        {total === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No pending approvals
          </p>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Time Off Requests</span>
              <span className="font-semibold text-amber-600">
                {pendingApprovals.leaveRequests}
              </span>
            </div>
            
            <Button 
              variant="outline" 
              className="w-full gap-2"
              onClick={() => navigate('/leave?status=pending')}
            >
              Review Requests
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
