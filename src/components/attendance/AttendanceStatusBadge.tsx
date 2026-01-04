import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface AttendanceStatusBadgeProps {
  status: 'present' | 'absent' | 'late' | 'on_leave' | 'half_day';
}

const statusConfig = {
  present: {
    label: 'Present',
    className: 'bg-green-100 text-green-700 border-green-200',
  },
  absent: {
    label: 'Absent',
    className: 'bg-red-100 text-red-700 border-red-200',
  },
  late: {
    label: 'Late',
    className: 'bg-orange-100 text-orange-700 border-orange-200',
  },
  on_leave: {
    label: 'On Leave',
    className: 'bg-blue-100 text-blue-700 border-blue-200',
  },
  half_day: {
    label: 'Half Day',
    className: 'bg-purple-100 text-purple-700 border-purple-200',
  },
};

export function AttendanceStatusBadge({ status }: AttendanceStatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <Badge variant="outline" className={cn('font-medium', config.className)}>
      {config.label}
    </Badge>
  );
}
