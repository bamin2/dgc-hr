import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface LeaveStatusBadgeProps {
  status: 'pending' | 'approved' | 'rejected';
}

const statusConfig = {
  pending: {
    label: 'Pending',
    className: 'bg-warning/10 text-warning border-warning/30',
  },
  approved: {
    label: 'Approved',
    className: 'bg-success/10 text-success border-success/30',
  },
  rejected: {
    label: 'Rejected',
    className: 'bg-destructive/10 text-destructive border-destructive/30',
  },
};

export function LeaveStatusBadge({ status }: LeaveStatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <Badge variant="outline" className={cn('font-medium', config.className)}>
      {config.label}
    </Badge>
  );
}
