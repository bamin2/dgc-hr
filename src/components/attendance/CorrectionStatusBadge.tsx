import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, XCircle, UserCheck } from 'lucide-react';
import type { CorrectionStatus } from '@/hooks/useAttendanceCorrections';

interface CorrectionStatusBadgeProps {
  status: CorrectionStatus;
}

const statusConfig: Record<CorrectionStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ElementType; className: string }> = {
  pending_manager: {
    label: 'Pending Manager',
    variant: 'outline',
    icon: Clock,
    className: 'border-amber-500/50 text-amber-600 bg-amber-50 dark:bg-amber-950/20',
  },
  pending_hr: {
    label: 'Pending HR',
    variant: 'outline',
    icon: UserCheck,
    className: 'border-teal-500/50 text-teal-600 bg-teal-50 dark:bg-teal-950/20',
  },
  approved: {
    label: 'Approved',
    variant: 'outline',
    icon: CheckCircle,
    className: 'border-green-500/50 text-green-600 bg-green-50 dark:bg-green-950/20',
  },
  rejected: {
    label: 'Rejected',
    variant: 'destructive',
    icon: XCircle,
    className: '',
  },
};

export function CorrectionStatusBadge({ status }: CorrectionStatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className={`gap-1 ${config.className}`}>
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}
