import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Building2, 
  Briefcase, 
  MapPin, 
  Calendar, 
  Users,
  Hash,
  Clock
} from 'lucide-react';
import { Employee } from '@/hooks/useEmployees';
import { format } from 'date-fns';

interface MyProfileOverviewTabProps {
  employee: Employee;
}

interface InfoCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | undefined;
  className?: string;
}

function InfoCard({ icon, label, value, className }: InfoCardProps) {
  return (
    <Card className={className}>
      <CardContent className="p-4">
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
      </CardContent>
    </Card>
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
    <div className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <User className="h-4 w-4 text-primary" />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
        </CardContent>
      </Card>

      {/* Work Information */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InfoCard
          icon={<Building2 className="h-4 w-4 text-primary" />}
          label="Department"
          value={employee.department}
        />
        <InfoCard
          icon={<Briefcase className="h-4 w-4 text-primary" />}
          label="Position"
          value={employee.position}
        />
        <InfoCard
          icon={<MapPin className="h-4 w-4 text-primary" />}
          label="Work Location"
          value={employee.workLocationName || employee.location}
        />
        <InfoCard
          icon={<Users className="h-4 w-4 text-primary" />}
          label="Manager"
          value={employee.manager}
        />
        <InfoCard
          icon={<Calendar className="h-4 w-4 text-primary" />}
          label="Join Date"
          value={joinDate}
        />
        <InfoCard
          icon={<Clock className="h-4 w-4 text-primary" />}
          label="Employment Type"
          value="Full-time"
        />
      </div>
    </div>
  );
}