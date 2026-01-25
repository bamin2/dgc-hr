import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Employee } from '@/hooks/employee/types';

interface MobileProfileHeaderProps {
  employee: Employee;
}

export function MobileProfileHeader({ employee }: MobileProfileHeaderProps) {
  const initials = `${employee.firstName?.[0] || ''}${employee.lastName?.[0] || ''}`.toUpperCase();
  const fullName = employee.fullName || `${employee.firstName} ${employee.lastName}`;
  
  const statusColors: Record<string, string> = {
    active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    on_leave: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    probation: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    on_boarding: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    terminated: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
  };

  return (
    <div className="bg-gradient-to-b from-primary/5 to-primary/10 rounded-2xl p-6">
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16 border-2 border-background shadow-sm">
          <AvatarImage src={employee.avatar || undefined} alt={fullName} />
          <AvatarFallback className="text-lg font-semibold bg-primary/10 text-primary">
            {initials}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-semibold truncate">{fullName}</h1>
          <p className="text-sm text-muted-foreground truncate">
            {employee.position || 'Employee'}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-muted-foreground">
              {employee.department}
            </span>
            {employee.employeeId && (
              <>
                <span className="text-xs text-muted-foreground">•</span>
                <span className="text-xs text-muted-foreground font-mono">
                  {employee.employeeId}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
      
      {employee.status && (
        <div className="mt-4">
          <Badge
            variant="secondary"
            className={statusColors[employee.status] || statusColors.active}
          >
            {employee.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </Badge>
        </div>
      )}
    </div>
  );
}
