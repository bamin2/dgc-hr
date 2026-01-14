import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2 } from "lucide-react";
import { Employee } from "@/hooks/useEmployees";

interface DirectoryCardProps {
  employee: Employee;
}

export function DirectoryCard({ employee }: DirectoryCardProps) {
  const initials = `${employee.first_name[0]}${employee.last_name[0]}`.toUpperCase();
  const fullName = `${employee.first_name} ${employee.last_name}`;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex flex-col items-center text-center space-y-3">
          <Avatar className="h-20 w-20">
            <AvatarImage src={employee.avatar_url || undefined} alt={fullName} />
            <AvatarFallback className="text-lg bg-primary/10 text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          
          <div className="space-y-1">
            <h3 className="font-semibold text-foreground">{fullName}</h3>
            <p className="text-sm text-muted-foreground">{employee.position?.title || 'No position'}</p>
          </div>

          <Badge variant="secondary" className="gap-1.5">
            <Building2 className="h-3 w-3" />
            {employee.department?.name || 'No department'}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
