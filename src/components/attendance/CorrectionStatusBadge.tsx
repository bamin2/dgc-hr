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
    className: 'border-warning/50 text-warning bg-warning/10',
  },
  pending_hr: {
    label: 'Pending HR',
    variant: 'outline',
    icon: UserCheck,
    className: 'border-info/50 text-info bg-info/10',
  },
  approved: {
    label: 'Approved',
    variant: 'outline',
    icon: CheckCircle,
    className: 'border-success/50 text-success bg-success/10',
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
