import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface AttendanceStatusBadgeProps {
  status: 'present' | 'absent' | 'late' | 'on_leave' | 'half_day' | 'remote';
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
    className: 'bg-teal-100 text-teal-700 border-teal-200',
  },
  half_day: {
    label: 'Half Day',
    className: 'bg-amber-100 text-amber-700 border-amber-200',
  },
  remote: {
    label: 'Remote',
    className: 'bg-cyan-100 text-cyan-700 border-cyan-200',
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
