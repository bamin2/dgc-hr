import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  Briefcase,
  Users,
  Calendar,
  IdCard
} from 'lucide-react';
import { Employee } from '@/hooks/useEmployees';
import { format } from 'date-fns';
import { BentoGrid, BentoCard } from '@/components/dashboard/bento';
import { cn } from '@/lib/utils';

interface MyProfileOverviewTabProps {
  employee: Employee;
}

// Helper component for consistent info display
function InfoRow({ label, value, mono, muted }: { 
  label: string; 
  value?: string; 
  mono?: boolean;
  muted?: boolean;
}) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={cn(
        "text-sm font-medium text-right",
        mono && "font-mono",
        muted && "text-muted-foreground"
      )}>
        {value || 'Not set'}
      </span>
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
      {/* ROW 1 */}
      
      {/* Role & Organization Card */}
      <BentoCard colSpan={6}>
        <div className="flex items-center gap-2 mb-4">
          <Briefcase className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-medium">Role & Organization</h3>
        </div>
        <div className="space-y-3">
          <InfoRow label="Job Title" value={employee.position} />
          <InfoRow label="Department" value={employee.department} />
          <InfoRow label="Employment Type" value="Full-time" />
          <InfoRow label="Work Location" value={employee.workLocationName || employee.location} />
        </div>
      </BentoCard>

      {/* Employment Details Card */}
      <BentoCard colSpan={6}>
        <div className="flex items-center gap-2 mb-4">
          <IdCard className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-medium">Employment Details</h3>
        </div>
        <div className="space-y-3">
          <InfoRow label="Employee ID" value={employee.employeeId} mono />
          <InfoRow label="Join Date" value={joinDate} />
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Status</span>
            <Badge variant={statusVariants[employee.status] || 'default'}>
              {statusLabels[employee.status] || employee.status}
            </Badge>
          </div>
          <InfoRow label="Direct Manager" value={employee.manager || 'Not assigned'} />
        </div>
      </BentoCard>

      {/* ROW 2 */}

      {/* Department Details Card */}
      <BentoCard colSpan={6}>
        <div className="flex items-center gap-2 mb-4">
          <Building2 className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-medium">Department Details</h3>
        </div>
        <div className="space-y-3">
          <InfoRow label="Department" value={employee.department} />
          <InfoRow label="Position" value={employee.position} />
        </div>
      </BentoCard>

      {/* Reporting Line Card */}
      <BentoCard colSpan={6}>
        <div className="flex items-center gap-2 mb-4">
          <Users className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-medium">Reporting Line</h3>
        </div>
        <div className="space-y-3">
          <InfoRow label="Manager Name" value={employee.manager || 'Not assigned'} />
          <InfoRow label="Manager Role" value="Direct Supervisor" muted />
        </div>
      </BentoCard>
    </BentoGrid>
  );
}
