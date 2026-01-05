import { Pencil, Trash2, MoreHorizontal } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatusBadge } from "./StatusBadge";
import { Employee } from "@/hooks/useEmployees";
import { format } from "date-fns";

interface EmployeeTableProps {
  employees: Employee[];
  selectedEmployees: string[];
  onSelectionChange: (selected: string[]) => void;
  onView: (employee: Employee) => void;
  onEdit: (employee: Employee) => void;
  onDelete: (employee: Employee) => void;
}

export function EmployeeTable({
  employees,
  selectedEmployees,
  onSelectionChange,
  onView,
  onEdit,
  onDelete,
}: EmployeeTableProps) {
  const allSelected = employees.length > 0 && employees.every(emp => selectedEmployees.includes(emp.id));
  const someSelected = employees.some(emp => selectedEmployees.includes(emp.id)) && !allSelected;

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange([...new Set([...selectedEmployees, ...employees.map(emp => emp.id)])]);
    } else {
      onSelectionChange(selectedEmployees.filter(id => !employees.find(emp => emp.id === id)));
    }
  };

  const handleSelectOne = (employeeId: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedEmployees, employeeId]);
    } else {
      onSelectionChange(selectedEmployees.filter(id => id !== employeeId));
    }
  };

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead className="w-12">
              <Checkbox
                checked={allSelected}
                ref={(el) => {
                  if (el) {
                    (el as HTMLButtonElement & { indeterminate: boolean }).indeterminate = someSelected;
                  }
                }}
                onCheckedChange={handleSelectAll}
              />
            </TableHead>
            <TableHead className="font-medium">Employee Name</TableHead>
            <TableHead className="font-medium">Email Address</TableHead>
            <TableHead className="font-medium">Department</TableHead>
            <TableHead className="font-medium">Job Title</TableHead>
            <TableHead className="font-medium">Joined Date</TableHead>
            <TableHead className="font-medium">Status</TableHead>
            <TableHead className="font-medium text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.map((employee) => {
            const initials = `${employee.firstName[0]}${employee.lastName[0]}`;
            const isSelected = selectedEmployees.includes(employee.id);
            
            return (
              <TableRow 
                key={employee.id} 
                className={isSelected ? "bg-primary/5" : ""}
                onClick={() => onView(employee)}
              >
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={(checked) => handleSelectOne(employee.id, checked as boolean)}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={employee.avatar} alt={`${employee.firstName} ${employee.lastName}`} />
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-foreground">
                      {employee.firstName} {employee.lastName}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {employee.email}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {employee.department}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {employee.position}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {format(new Date(employee.joinDate), 'MMM d, yyyy')}
                </TableCell>
                <TableCell>
                  <StatusBadge status={employee.status} />
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => onDelete(employee)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      onClick={() => onEdit(employee)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-popover">
                        <DropdownMenuItem onClick={() => onView(employee)}>
                          View Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit(employee)}>
                          Edit Employee
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => onDelete(employee)}
                          className="text-destructive focus:text-destructive"
                        >
                          Delete Employee
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
