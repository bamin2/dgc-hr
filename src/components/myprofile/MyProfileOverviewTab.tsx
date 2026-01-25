import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Building2, 
  Briefcase, 
  MapPin, 
  Calendar, 
  Users,
  Clock
} from 'lucide-react';
import { Employee } from '@/hooks/useEmployees';
import { format } from 'date-fns';
import { BentoGrid, BentoCard } from '@/components/dashboard/bento';

interface MyProfileOverviewTabProps {
  employee: Employee;
}

interface InfoItemProps {
  icon: React.ReactNode;
  label: string;
  value: string | undefined;
}

function InfoItem({ icon, label, value }: InfoItemProps) {
  return (
    <div className="flex items-start gap-3">
      <div className="p-2 bg-primary/10 rounded-lg shrink-0">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground mb-1">{label}</p>
        <p className="text-sm font-medium truncate">
          {value || 'Not set'}
        </p>
      </div>
    </div>
  );
}

export function MyProfileOverviewTab({ employee }: MyProfileOverviewTabProps) {
  const joinDate = employee.joinDate 
    ? format(new Date(employee.joinDate), 'MMMM d, yyyy')
    : 'Not set';

  const statusVariants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    active: 'default',
    on_leave: 'secondary',
    on_boarding: 'outline',
    probation: 'outline',
    terminated: 'destructive',
  };

  const statusLabels: Record<string, string> = {
    active: 'Active',
    on_leave: 'On Leave',
    on_boarding: 'Onboarding',
    probation: 'Probation',
    terminated: 'Terminated',
  };

  return (
    <BentoGrid noPadding>
      {/* Basic Information - Primary Card */}
      <BentoCard colSpan={8}>
        <div className="flex items-center gap-2 mb-4">
          <User className="h-4 w-4 text-primary" />
          <h3 className="text-base font-medium">Basic Information</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Full Name</p>
            <p className="text-sm font-medium">{employee.fullName}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Employee ID</p>
            <p className="text-sm font-medium font-mono">{employee.employeeId}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Email</p>
            <p className="text-sm font-medium truncate">{employee.email}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Status</p>
            <Badge variant={statusVariants[employee.status] || 'default'}>
              {statusLabels[employee.status] || employee.status}
            </Badge>
          </div>
        </div>
      </BentoCard>

      {/* Quick Status Summary */}
      <BentoCard colSpan={4}>
        <div className="flex flex-col items-center justify-center h-full text-center gap-2">
          <Badge 
            variant={statusVariants[employee.status] || 'default'}
            className="text-base px-4 py-1"
          >
            {statusLabels[employee.status] || employee.status}
          </Badge>
          <p className="text-xs text-muted-foreground mt-2">
            {employee.department || 'No department'} • {employee.position || 'No position'}
          </p>
        </div>
      </BentoCard>

      {/* Work Information Cards */}
      <BentoCard colSpan={4}>
        <InfoItem
          icon={<Building2 className="h-4 w-4 text-primary" />}
          label="Department"
          value={employee.department}
        />
      </BentoCard>

      <BentoCard colSpan={4}>
        <InfoItem
          icon={<Briefcase className="h-4 w-4 text-primary" />}
          label="Position"
          value={employee.position}
        />
      </BentoCard>

      <BentoCard colSpan={4}>
        <InfoItem
          icon={<MapPin className="h-4 w-4 text-primary" />}
          label="Work Location"
          value={employee.workLocationName || employee.location}
        />
      </BentoCard>

      <BentoCard colSpan={4}>
        <InfoItem
          icon={<Users className="h-4 w-4 text-primary" />}
          label="Manager"
          value={employee.manager}
        />
      </BentoCard>

      <BentoCard colSpan={4}>
        <InfoItem
          icon={<Calendar className="h-4 w-4 text-primary" />}
          label="Join Date"
          value={joinDate}
        />
      </BentoCard>

      <BentoCard colSpan={4}>
        <InfoItem
          icon={<Clock className="h-4 w-4 text-primary" />}
          label="Employment Type"
          value="Full-time"
        />
      </BentoCard>
    </BentoGrid>
  );
}
