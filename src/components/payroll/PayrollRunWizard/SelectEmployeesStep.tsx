import { useEffect } from "react";
import { useEmployees } from "@/hooks/useEmployees";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

interface SelectEmployeesStepProps {
  locationId: string;
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
}

export function SelectEmployeesStep({
  locationId,
  selectedIds,
  onSelectionChange,
}: SelectEmployeesStepProps) {
  const { data: allEmployees = [], isLoading } = useEmployees();

  // Filter employees by location
  const employees = allEmployees.filter(
    (emp) => emp.workLocationId === locationId && emp.status === 'active'
  );

  // Auto-select all employees on mount if none selected
  useEffect(() => {
    if (employees.length > 0 && selectedIds.length === 0) {
      onSelectionChange(employees.map((e) => e.id));
    }
  }, [employees.length]);

  const handleToggle = (employeeId: string) => {
    if (selectedIds.includes(employeeId)) {
      onSelectionChange(selectedIds.filter((id) => id !== employeeId));
    } else {
      onSelectionChange([...selectedIds, employeeId]);
    }
  };

  const handleSelectAll = () => {
    onSelectionChange(employees.map((e) => e.id));
  };

  const handleDeselectAll = () => {
    onSelectionChange([]);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-12" />
        <Skeleton className="h-12" />
        <Skeleton className="h-12" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Select Employees</h2>
          <p className="text-muted-foreground">
            Choose employees to include in this payroll run ({selectedIds.length} of {employees.length} selected)
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleSelectAll}>
            Select All
          </Button>
          <Button variant="outline" size="sm" onClick={handleDeselectAll}>
            Deselect All
          </Button>
        </div>
      </div>

      {employees.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No active employees found for this location.
        </div>
      ) : (
        <div className="border rounded-lg divide-y max-h-[400px] overflow-y-auto">
          {employees.map((employee) => {
            const isSelected = selectedIds.includes(employee.id);
            const initials = `${employee.firstName?.[0] || ''}${employee.lastName?.[0] || ''}`;
            
            return (
              <div
                key={employee.id}
                className="flex items-center gap-4 p-3 hover:bg-muted/50 cursor-pointer"
                onClick={() => handleToggle(employee.id)}
              >
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => handleToggle(employee.id)}
                />
                <Avatar className="h-10 w-10">
                  <AvatarImage src={employee.avatar || undefined} />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground">
                    {employee.firstName} {employee.lastName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {employee.position || 'No position'} • {employee.department || 'No department'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-foreground">
                    {employee.salary?.toLocaleString() || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">Base Salary</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
