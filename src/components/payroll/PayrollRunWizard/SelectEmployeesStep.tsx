import { useEffect, useMemo } from "react";
import { useEmployeesWithCompensation } from "@/hooks/useEmployeesWithCompensation";
import { useEmployeesAlreadyPaidInPeriod } from "@/hooks/useEmployeesAlreadyPaidInPeriod";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface SelectEmployeesStepProps {
  locationId: string;
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  payPeriodStart: string;
  payPeriodEnd: string;
  excludeRunId?: string | null;
}

export function SelectEmployeesStep({
  locationId,
  selectedIds,
  onSelectionChange,
  payPeriodStart,
  payPeriodEnd,
  excludeRunId,
}: SelectEmployeesStepProps) {
  const { data: allEmployees = [], isLoading } = useEmployeesWithCompensation(locationId);
  const { data: alreadyPaid } = useEmployeesAlreadyPaidInPeriod({
    locationId,
    payPeriodStart,
    payPeriodEnd,
    excludeRunId,
  });

  const alreadyPaidIds = alreadyPaid?.ids ?? new Set<string>();

  const sortByName = <T extends { firstName?: string | null; lastName?: string | null }>(list: T[]) =>
    [...list].sort((a, b) => {
      const an = `${a.firstName ?? ""} ${a.lastName ?? ""}`.trim().toLowerCase();
      const bn = `${b.firstName ?? ""} ${b.lastName ?? ""}`.trim().toLowerCase();
      return an.localeCompare(bn);
    });

  const hasSalary = (emp: { netSalary?: number | null; baseSalary?: number | null }) => {
    const net = Number(emp.netSalary ?? 0);
    const base = Number((emp as { baseSalary?: number | null }).baseSalary ?? 0);
    return net > 0 || base > 0;
  };

  // Active employees at this location, excluding ones already paid in an
  // overlapping finalized run. Split into payable (has salary) and zero-salary.
  const { employees, zeroSalaryEmployees } = useMemo(() => {
    const eligible = allEmployees.filter(
      (emp) =>
        emp.workLocationId === locationId &&
        emp.status === "active" &&
        !alreadyPaidIds.has(emp.id)
    );
    return {
      employees: sortByName(eligible.filter(hasSalary)),
      zeroSalaryEmployees: sortByName(eligible.filter((e) => !hasSalary(e))),
    };
  }, [allEmployees, locationId, alreadyPaidIds]);

  const hiddenEmployees = useMemo(
    () =>
      sortByName(
        allEmployees.filter(
          (emp) =>
            emp.workLocationId === locationId &&
            emp.status === "active" &&
            alreadyPaidIds.has(emp.id)
        )
      ),
    [allEmployees, locationId, alreadyPaidIds]
  );

  const zeroSalaryIds = useMemo(
    () => new Set(zeroSalaryEmployees.map((e) => e.id)),
    [zeroSalaryEmployees]
  );

  // Auto-select all eligible (payable) employees on mount if none selected.
  useEffect(() => {
    if (employees.length > 0 && selectedIds.length === 0) {
      onSelectionChange(employees.map((e) => e.id));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employees.length]);

  // Drop any selected ID that became hidden (already paid) or has zero salary.
  useEffect(() => {
    if (selectedIds.length === 0) return;
    const filtered = selectedIds.filter(
      (id) => !alreadyPaidIds.has(id) && !zeroSalaryIds.has(id)
    );
    if (filtered.length !== selectedIds.length) {
      onSelectionChange(filtered);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alreadyPaidIds, zeroSalaryIds]);

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

      {hiddenEmployees.length > 0 && (
        <div className="mb-3 flex items-center gap-2 rounded-md border border-border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
          <Info className="h-4 w-4 shrink-0" />
          <span>
            {hiddenEmployees.length} employee{hiddenEmployees.length === 1 ? "" : "s"} hidden — already paid for this period.
          </span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button type="button" className="underline underline-offset-2 hover:text-foreground">
                  View
                </button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <ul className="space-y-1 text-xs">
                  {hiddenEmployees.map((emp) => (
                    <li key={emp.id}>
                      {emp.firstName} {emp.lastName}
                    </li>
                  ))}
                </ul>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}

      {employees.length === 0 && zeroSalaryEmployees.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          {hiddenEmployees.length > 0
            ? "All active employees for this location have already been paid for this period."
            : "No active employees found for this location."}
        </div>
      ) : (
        <div className="space-y-6">
          {employees.length > 0 && (
            <div className="border rounded-lg divide-y max-h-[400px] overflow-y-auto">
              {employees.map((employee) => {
                const isSelected = selectedIds.includes(employee.id);
                const initials = `${employee.firstName?.[0] || ''}${employee.lastName?.[0] || ''}`;

                return (
                  <div
                    key={employee.id}
                    className="flex items-center gap-4 p-3 hover:bg-white/60 dark:hover:bg-white/10 hover:shadow-sm cursor-pointer transition-all duration-200"
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
                        {employee.netSalary?.toLocaleString() || 0}
                      </p>
                      <p className="text-xs text-muted-foreground">Net Salary</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {zeroSalaryEmployees.length > 0 && (
            <div>
              <div className="mb-2">
                <h3 className="text-sm font-semibold text-foreground">
                  Not included in this payroll run ({zeroSalaryEmployees.length})
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  These employees are excluded because their salary has not been entered in the system. Update their compensation to include them.
                </p>
              </div>
              <div className="border border-dashed rounded-lg divide-y bg-muted/20 max-h-[300px] overflow-y-auto">
                {zeroSalaryEmployees.map((employee) => {
                  const initials = `${employee.firstName?.[0] || ''}${employee.lastName?.[0] || ''}`;
                  return (
                    <div
                      key={employee.id}
                      className="flex items-center gap-4 p-3 opacity-70"
                    >
                      <Checkbox checked={false} disabled />
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
                      <div className="text-right flex items-center gap-3">
                        <div>
                          <p className="font-medium text-muted-foreground">0</p>
                          <p className="text-xs text-muted-foreground">No salary set</p>
                        </div>
                        <a
                          href={`/employees/${employee.id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-primary underline underline-offset-2 hover:text-primary/80"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Edit salary
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
