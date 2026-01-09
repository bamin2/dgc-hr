import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ClipboardCheck, CalendarDays, Banknote, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PendingApprovals {
  leaveRequests: number;
  loanRequests: number;
}

interface AllPendingApprovalsCardProps {
  pendingApprovals: PendingApprovals;
  isLoading?: boolean;
}

export function AllPendingApprovalsCard({ pendingApprovals, isLoading }: AllPendingApprovalsCardProps) {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  const total = pendingApprovals.leaveRequests + pendingApprovals.loanRequests;

  const items = [
    { 
      label: 'Time Off', 
      count: pendingApprovals.leaveRequests, 
      icon: CalendarDays,
      path: '/time-off?status=pending'
    },
    { 
      label: 'Loans', 
      count: pendingApprovals.loanRequests, 
      icon: Banknote,
      path: '/loans?status=requested'
    },
  ];

  return (
    <Card className={total > 0 ? 'border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/20' : ''}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <ClipboardCheck className="h-4 w-4 text-primary" />
          All Pending Approvals
          {total > 0 && (
            <span className="ml-auto rounded-full bg-amber-500 px-2 py-0.5 text-xs font-semibold text-white">
              {total}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {total === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            All caught up! No pending approvals.
          </p>
        ) : (
          <div className="space-y-2">
            {items.filter(item => item.count > 0).map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.label}
                  variant="ghost"
                  className="w-full justify-between"
                  onClick={() => navigate(item.path)}
                >
                  <span className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="font-semibold text-amber-600">{item.count}</span>
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </Button>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
