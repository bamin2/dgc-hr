import { Eye, Pencil, Trash2, ArrowUpDown } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "./StatusBadge";
import { Employee } from "@/data/employees";
import { format } from "date-fns";

interface EmployeeTableProps {
  employees: Employee[];
  onView: (employee: Employee) => void;
  onEdit: (employee: Employee) => void;
  onDelete: (employee: Employee) => void;
  sortField: string;
  sortDirection: 'asc' | 'desc';
  onSort: (field: string) => void;
}

export function EmployeeTable({
  employees,
  onView,
  onEdit,
  onDelete,
  sortField,
  sortDirection,
  onSort,
}: EmployeeTableProps) {
  const SortableHeader = ({ field, children }: { field: string; children: React.ReactNode }) => (
    <Button
      variant="ghost"
      className="h-auto p-0 font-medium hover:bg-transparent"
      onClick={() => onSort(field)}
    >
      {children}
      <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
    </Button>
  );

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-[280px]">
              <SortableHeader field="name">Employee</SortableHeader>
            </TableHead>
            <TableHead>
              <SortableHeader field="employeeId">ID</SortableHeader>
            </TableHead>
            <TableHead>
              <SortableHeader field="department">Department</SortableHeader>
            </TableHead>
            <TableHead>
              <SortableHeader field="position">Position</SortableHeader>
            </TableHead>
            <TableHead>
              <SortableHeader field="status">Status</SortableHeader>
            </TableHead>
            <TableHead>
              <SortableHeader field="joinDate">Join Date</SortableHeader>
            </TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.map((employee) => {
            const initials = `${employee.firstName[0]}${employee.lastName[0]}`;
            
            return (
              <TableRow key={employee.id} className="group">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={employee.avatar} alt={`${employee.firstName} ${employee.lastName}`} />
                      <AvatarFallback className="bg-primary/10 text-primary text-sm">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-foreground">
                        {employee.firstName} {employee.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">{employee.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="font-mono text-sm text-muted-foreground">
                  {employee.employeeId}
                </TableCell>
                <TableCell>
                  <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-md font-medium">
                    {employee.department}
                  </span>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {employee.position}
                </TableCell>
                <TableCell>
                  <StatusBadge status={employee.status} />
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {format(new Date(employee.joinDate), 'MMM d, yyyy')}
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onView(employee)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onEdit(employee)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => onDelete(employee)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
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
