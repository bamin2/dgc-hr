import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Users, UserPlus } from "lucide-react";
import { Employee } from "@/hooks/useEmployees";
import { isTopLevelPosition } from "@/utils/orgHierarchy";

interface BulkAssignManagersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employees: Employee[];
  onAssign: (assignments: { employeeId: string; managerId: string }[]) => Promise<void>;
}

export function BulkAssignManagersDialog({
  open,
  onOpenChange,
  employees,
  onAssign,
}: BulkAssignManagersDialogProps) {
  const [selectedEmployees, setSelectedEmployees] = useState<Set<string>>(new Set());
  const [assignments, setAssignments] = useState<Record<string, string>>({});
  const [bulkManagerId, setBulkManagerId] = useState<string>("");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get unassigned employees (excluding top-level positions)
  const unassignedEmployees = useMemo(() => 
    employees.filter(e => !e.managerId && !isTopLevelPosition(e)),
    [employees]
  );

  // Get potential managers (employees who have a position or are top-level)
  const potentialManagers = useMemo(() => 
    employees.filter(e => e.position || isTopLevelPosition(e))
      .sort((a, b) => {
        const nameA = `${a.firstName} ${a.lastName}`;
        const nameB = `${b.firstName} ${b.lastName}`;
        return nameA.localeCompare(nameB);
      }),
    [employees]
  );

  // Get unique departments
  const departments = useMemo(() => {
    const depts = new Set(unassignedEmployees.map(e => e.department).filter(Boolean));
    return Array.from(depts).sort();
  }, [unassignedEmployees]);

  // Filter employees by department
  const filteredEmployees = useMemo(() => {
    if (departmentFilter === "all") return unassignedEmployees;
    return unassignedEmployees.filter(e => e.department === departmentFilter);
  }, [unassignedEmployees, departmentFilter]);

  // Count pending assignments
  const pendingCount = Object.keys(assignments).length;

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedEmployees(new Set(filteredEmployees.map(e => e.id)));
    } else {
      setSelectedEmployees(new Set());
    }
  };

  const handleSelectEmployee = (employeeId: string, checked: boolean) => {
    const newSelected = new Set(selectedEmployees);
    if (checked) {
      newSelected.add(employeeId);
    } else {
      newSelected.delete(employeeId);
    }
    setSelectedEmployees(newSelected);
  };

  const handleIndividualAssign = (employeeId: string, managerId: string) => {
    if (managerId) {
      setAssignments(prev => ({ ...prev, [employeeId]: managerId }));
    } else {
      const newAssignments = { ...assignments };
      delete newAssignments[employeeId];
      setAssignments(newAssignments);
    }
  };

  const handleBulkAssign = () => {
    if (!bulkManagerId || selectedEmployees.size === 0) return;
    
    const newAssignments = { ...assignments };
    selectedEmployees.forEach(empId => {
      newAssignments[empId] = bulkManagerId;
    });
    setAssignments(newAssignments);
    setSelectedEmployees(new Set());
    setBulkManagerId("");
  };

  const handleSubmit = async () => {
    if (pendingCount === 0) return;
    
    setIsSubmitting(true);
    try {
      const assignmentList = Object.entries(assignments).map(([employeeId, managerId]) => ({
        employeeId,
        managerId,
      }));
      await onAssign(assignmentList);
      setAssignments({});
      setSelectedEmployees(new Set());
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setAssignments({});
    setSelectedEmployees(new Set());
    setBulkManagerId("");
    setDepartmentFilter("all");
    onOpenChange(false);
  };

  const isAllSelected = filteredEmployees.length > 0 && 
    filteredEmployees.every(e => selectedEmployees.has(e.id));

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Bulk Assign Managers
          </DialogTitle>
          <DialogDescription>
            {unassignedEmployees.length} employees without a manager assigned.
            Select managers for each employee or use bulk assignment.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-4 py-2">
          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map(dept => (
                <SelectItem key={dept} value={dept!}>{dept}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {pendingCount > 0 && (
            <Badge variant="secondary">
              {pendingCount} assignment{pendingCount !== 1 ? 's' : ''} pending
            </Badge>
          )}
        </div>

        <ScrollArea className="flex-1 min-h-0 border rounded-md overflow-hidden">
          <div className="p-4 space-y-2">
            {/* Select All Header */}
            <div className="flex items-center gap-3 pb-2 border-b">
              <Checkbox 
                checked={isAllSelected}
                onCheckedChange={handleSelectAll}
              />
              <span className="text-sm font-medium">Select All ({filteredEmployees.length})</span>
            </div>

            {/* Employee List */}
            {filteredEmployees.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                No unassigned employees in this department
              </div>
            ) : (
              filteredEmployees.map(employee => (
                <div 
                  key={employee.id} 
                  className="flex items-center gap-3 py-2 hover:bg-muted/50 rounded px-2"
                >
                  <Checkbox 
                    checked={selectedEmployees.has(employee.id)}
                    onCheckedChange={(checked) => handleSelectEmployee(employee.id, checked as boolean)}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{employee.firstName} {employee.lastName}</div>
                    <div className="text-sm text-muted-foreground truncate">
                      {employee.position || 'No position'} • {employee.department || 'No department'}
                    </div>
                  </div>
                  <Select 
                    value={assignments[employee.id] || ""} 
                    onValueChange={(value) => handleIndividualAssign(employee.id, value)}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Select manager" />
                    </SelectTrigger>
                    <SelectContent>
                      {potentialManagers
                        .filter(m => m.id !== employee.id)
                        .map(manager => (
                          <SelectItem key={manager.id} value={manager.id}>
                            {manager.firstName} {manager.lastName}
                            {manager.position && (
                              <span className="text-muted-foreground ml-1">
                                ({manager.position})
                              </span>
                            )}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        {/* Bulk Assignment Section */}
        <div className="flex items-center gap-3 py-3 px-4 bg-muted/50 rounded-md">
          <UserPlus className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">
            Assign selected ({selectedEmployees.size}) to:
          </span>
          <Select value={bulkManagerId} onValueChange={setBulkManagerId}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select manager" />
            </SelectTrigger>
            <SelectContent>
              {potentialManagers.map(manager => (
                <SelectItem key={manager.id} value={manager.id}>
                  {manager.firstName} {manager.lastName}
                  {manager.position && (
                    <span className="text-muted-foreground ml-1">
                      ({manager.position})
                    </span>
                  )}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button 
            variant="secondary" 
            size="sm"
            onClick={handleBulkAssign}
            disabled={!bulkManagerId || selectedEmployees.size === 0}
          >
            Apply
          </Button>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={pendingCount === 0 || isSubmitting}
          >
            {isSubmitting ? "Saving..." : `Save ${pendingCount} Assignment${pendingCount !== 1 ? 's' : ''}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
