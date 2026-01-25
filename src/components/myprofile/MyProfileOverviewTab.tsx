import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  MapPin, 
  Users,
  Calendar,
  Clock
} from 'lucide-react';
import { Employee } from '@/hooks/useEmployees';
import { format } from 'date-fns';
import { BentoGrid, BentoCard } from '@/components/dashboard/bento';

interface MyProfileOverviewTabProps {
  employee: Employee;
}

export function MyProfileOverviewTab({ employee }: MyProfileOverviewTabProps) {
  const initials = `${employee.firstName[0]}${employee.lastName[0]}`.toUpperCase();
  
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
      {/* ROW 1 */}
      
      {/* Employee Overview Card */}
      <BentoCard colSpan={8}>
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16 border-2 border-border shrink-0">
            <AvatarImage src={employee.avatar} alt={employee.fullName} />
            <AvatarFallback className="text-lg font-semibold bg-primary text-primary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold truncate">{employee.fullName}</h2>
              <Badge variant={statusVariants[employee.status] || 'default'}>
                {statusLabels[employee.status] || employee.status}
              </Badge>
            </div>
            
            <p className="text-sm text-muted-foreground">{employee.position || 'No position'}</p>
            <p className="text-sm text-muted-foreground">{employee.department || 'No department'}</p>
            
            <p className="text-xs text-muted-foreground font-mono">
              ID: {employee.employeeId}
            </p>
          </div>
        </div>
      </BentoCard>

      {/* Quick Stats Card */}
      <BentoCard colSpan={4}>
        <h3 className="text-sm font-medium mb-4">Quick Stats</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Employment Type</p>
              <p className="text-sm font-medium">Full-time</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Work Location</p>
              <p className="text-sm font-medium truncate">
                {employee.workLocationName || employee.location || 'Not set'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Manager</p>
              <p className="text-sm font-medium truncate">{employee.manager || 'Not assigned'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Join Date</p>
              <p className="text-sm font-medium">{joinDate}</p>
            </div>
          </div>
        </div>
      </BentoCard>

      {/* ROW 2 */}

      {/* Department Card */}
      <BentoCard colSpan={4}>
        <div className="flex items-center gap-2 mb-3">
          <Building2 className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-medium">Department</h3>
        </div>
        <div className="space-y-2">
          <div>
            <p className="text-xs text-muted-foreground">Department</p>
            <p className="text-sm font-medium">{employee.department || 'Not set'}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Position</p>
            <p className="text-sm font-medium">{employee.position || 'Not set'}</p>
          </div>
        </div>
      </BentoCard>

      {/* Work Location Card */}
      <BentoCard colSpan={4}>
        <div className="flex items-center gap-2 mb-3">
          <MapPin className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-medium">Work Location</h3>
        </div>
        <div className="space-y-2">
          <div>
            <p className="text-xs text-muted-foreground">Location</p>
            <p className="text-sm font-medium">
              {employee.workLocationName || employee.location || 'Not set'}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Country</p>
            <p className="text-sm font-medium">
              {employee.workLocationCountry || 'Not set'}
            </p>
          </div>
        </div>
      </BentoCard>

      {/* Manager Card */}
      <BentoCard colSpan={4}>
        <div className="flex items-center gap-2 mb-3">
          <Users className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-medium">Manager</h3>
        </div>
        <div className="space-y-2">
          <div>
            <p className="text-xs text-muted-foreground">Manager Name</p>
            <p className="text-sm font-medium">{employee.manager || 'Not assigned'}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Manager Role</p>
            <p className="text-sm font-medium text-muted-foreground">
              Direct Supervisor
            </p>
          </div>
        </div>
      </BentoCard>
    </BentoGrid>
  );
}
