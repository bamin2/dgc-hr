import { useMemo } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { 
  Calendar, 
  Banknote, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock,
  Inbox,
  Activity
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useLeaveRequests } from '@/hooks/useLeaveRequests';
import { useEmployeeLoansWithInstallments } from '@/hooks/useEmployeeLoansWithInstallments';
import { useEmployeeDocuments } from '@/hooks/useEmployeeDocuments';
import { useCompanySettings } from '@/contexts/CompanySettingsContext';
import { cn } from '@/lib/utils';

interface EmployeeActivityTabProps {
  employeeId: string;
}

interface ActivityEntry {
  id: string;
  type: 'leave' | 'loan' | 'document';
  title: string;
  description: string;
  status?: string;
  timestamp: string;
  icon: React.ReactNode;
  iconBgClass: string;
}

const statusConfig: Record<string, { icon: React.ReactNode; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pending: { icon: <Clock className="h-3 w-3" />, variant: 'secondary' },
  approved: { icon: <CheckCircle className="h-3 w-3" />, variant: 'default' },
  rejected: { icon: <XCircle className="h-3 w-3" />, variant: 'destructive' },
  active: { icon: <CheckCircle className="h-3 w-3" />, variant: 'default' },
  closed: { icon: <CheckCircle className="h-3 w-3" />, variant: 'outline' },
  disbursed: { icon: <Banknote className="h-3 w-3" />, variant: 'default' },
};

export function EmployeeActivityTab({ employeeId }: EmployeeActivityTabProps) {
  const { formatCurrency } = useCompanySettings();
  
  const { data: leaveRequests, isLoading: loadingLeave } = useLeaveRequests({ employeeId });
  const { data: loans, isLoading: loadingLoans } = useEmployeeLoansWithInstallments(employeeId);
  const { data: documents, isLoading: loadingDocs } = useEmployeeDocuments(employeeId);

  const isLoading = loadingLeave || loadingLoans || loadingDocs;

  const activities = useMemo(() => {
    const items: ActivityEntry[] = [];

    // Map leave requests
    leaveRequests?.forEach((req) => {
      items.push({
        id: `leave-${req.id}`,
        type: 'leave',
        title: `${req.leave_type?.name || 'Leave'} Request`,
        description: `${req.days_count} day${req.days_count !== 1 ? 's' : ''} (${format(new Date(req.start_date), 'MMM d')} - ${format(new Date(req.end_date), 'MMM d')})`,
        status: req.status,
        timestamp: req.created_at || req.start_date,
        icon: <Calendar className="h-4 w-4" />,
        iconBgClass: 'bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400',
      });
    });

    // Map loans
    loans?.forEach((loan) => {
      const installmentCount = loan.loan_installments?.length || 0;
      items.push({
        id: `loan-${loan.id}`,
        type: 'loan',
        title: 'Loan Request',
        description: `${formatCurrency(loan.principal_amount)}${installmentCount > 0 ? ` - ${installmentCount} installments` : ''}`,
        status: loan.status,
        timestamp: loan.created_at || loan.start_date,
        icon: <Banknote className="h-4 w-4" />,
        iconBgClass: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
      });
    });

    // Map documents
    documents?.forEach((doc) => {
      items.push({
        id: `doc-${doc.id}`,
        type: 'document',
        title: 'Document Uploaded',
        description: doc.documentName,
        timestamp: doc.createdAt || new Date().toISOString(),
        icon: <FileText className="h-4 w-4" />,
        iconBgClass: 'bg-stone-100 dark:bg-stone-900/30 text-stone-600 dark:text-stone-400',
      });
    });

    // Sort by timestamp (most recent first)
    return items.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    ).slice(0, 50); // Limit to 50 items
  }, [leaveRequests, loans, documents, formatCurrency]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-start gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (activities.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Inbox className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium">No Activity Found</h3>
          <p className="text-sm text-muted-foreground mt-1">
            This employee has no recorded activity yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity, index) => {
            const config = activity.status ? statusConfig[activity.status] : null;
            
            return (
              <div
                key={activity.id}
                className={cn(
                  'flex items-start gap-4 pb-4',
                  index < activities.length - 1 && 'border-b'
                )}
              >
                <div className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full flex-shrink-0',
                  activity.iconBgClass
                )}>
                  {activity.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-sm">{activity.title}</p>
                    {config && activity.status && (
                      <Badge variant={config.variant} className="gap-1 h-5 text-xs">
                        {config.icon}
                        {activity.status}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5 truncate">
                    {activity.description}
                  </p>
                </div>
                <div className="text-xs text-muted-foreground flex-shrink-0">
                  {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
