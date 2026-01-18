import { Mail, Phone, MoreVertical, Eye, Pencil, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatusBadge } from "./StatusBadge";
import { Employee } from "@/hooks/useEmployees";

interface EmployeeCardProps {
  employee: Employee;
  onView: (employee: Employee) => void;
  onEdit: (employee: Employee) => void;
  onDelete: (employee: Employee) => void;
}

export function EmployeeCard({ employee, onView, onEdit, onDelete }: EmployeeCardProps) {
  const initials = `${employee.firstName[0]}${employee.lastName[0]}`;

  return (
    <Card className="group hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-4">
          <Avatar className="h-14 w-14 ring-2 ring-background shadow-md">
            <AvatarImage src={employee.avatar} alt={`${employee.firstName} ${employee.lastName}`} />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView(employee)}>
                <Eye className="h-4 w-4 mr-2" />
                View Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(employee)}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete(employee)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="space-y-2 mb-4">
          <h3 className="font-semibold text-foreground">
            {employee.firstName} {employee.lastName}
          </h3>
          <p className="text-sm text-muted-foreground">{employee.position}</p>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-md font-medium">
              {employee.department}
            </span>
            <StatusBadge status={employee.status} />
          </div>
        </div>
        
        <div className="space-y-2 pt-4 border-t">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="h-3.5 w-3.5" />
            <span className="truncate">{employee.email}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="h-3.5 w-3.5" />
            <span>{employee.phone}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
