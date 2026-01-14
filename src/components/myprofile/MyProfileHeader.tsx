import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Employee } from '@/hooks/useEmployees';

interface MyProfileHeaderProps {
  employee: Employee;
}

const statusVariants: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  active: { label: 'Active', variant: 'default' },
  on_leave: { label: 'On Leave', variant: 'secondary' },
  on_boarding: { label: 'Onboarding', variant: 'outline' },
  probation: { label: 'Probation', variant: 'outline' },
  terminated: { label: 'Terminated', variant: 'destructive' },
};

export function MyProfileHeader({ employee }: MyProfileHeaderProps) {
  const initials = `${employee.firstName[0]}${employee.lastName[0]}`.toUpperCase();
  const statusInfo = statusVariants[employee.status] || statusVariants.active;

  return (
    <Card className="border-0 shadow-sm bg-gradient-to-r from-primary/5 to-primary/10">
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
          {/* Avatar */}
          <Avatar className="h-20 w-20 sm:h-24 sm:w-24 border-4 border-background shadow-lg">
            <AvatarImage src={employee.avatar} alt={employee.fullName} />
            <AvatarFallback className="text-xl font-semibold bg-primary text-primary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>

          {/* Info */}
          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">
                {employee.fullName}
              </h1>
              <Badge variant={statusInfo.variant} className="w-fit mx-auto sm:mx-0">
                {statusInfo.label}
              </Badge>
            </div>
            
            <div className="text-muted-foreground space-y-0.5">
              <p className="text-sm sm:text-base font-medium text-foreground/80">
                {employee.position}
              </p>
              <p className="text-sm">
                {employee.department}
              </p>
            </div>

            <p className="text-xs text-muted-foreground">
              Employee ID: {employee.employeeId}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}