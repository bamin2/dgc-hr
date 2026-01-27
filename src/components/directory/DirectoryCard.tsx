import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2 } from "lucide-react";

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  avatar: string;
  department: string;
  position: string;
}

interface DirectoryCardProps {
  employee: Employee;
}

export function DirectoryCard({ employee }: DirectoryCardProps) {
  const initials = `${employee.firstName[0]}${employee.lastName[0]}`.toUpperCase();
  const fullName = `${employee.firstName} ${employee.lastName}`;

  return (
    <Card className="shadow-[0_6px_20px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] hover:scale-[1.01] hover:-translate-y-0.5 transition-all duration-200">
      <CardContent className="p-6">
        <div className="flex flex-col items-center text-center space-y-3">
          <Avatar className="h-20 w-20">
            <AvatarImage src={employee.avatar} alt={fullName} />
            <AvatarFallback className="text-lg bg-primary/10 text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          
          <div className="space-y-1">
            <h3 className="font-semibold text-foreground">{fullName}</h3>
            <p className="text-sm text-muted-foreground">{employee.position}</p>
          </div>

          <Badge variant="secondary" className="gap-1.5">
            <Building2 className="h-3 w-3" />
            {employee.department}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
