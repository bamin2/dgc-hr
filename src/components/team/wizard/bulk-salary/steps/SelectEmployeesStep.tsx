import { useMemo } from "react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users } from "lucide-react";
import { TeamMemberWithGosi } from "@/hooks/useBulkSalaryWizard";
import { BulkSalaryWizardData } from "../types";

interface SelectEmployeesStepProps {
  data: BulkSalaryWizardData;
  employees: TeamMemberWithGosi[];
  departments: { id: string; name: string }[];
  positions: { id: string; title: string }[];
  onUpdateData: <K extends keyof BulkSalaryWizardData>(field: K, value: BulkSalaryWizardData[K]) => void;
}

export function SelectEmployeesStep({
  data,
  employees,
  departments,
  positions,
  onUpdateData,
}: SelectEmployeesStepProps) {
  const updateFilter = (key: keyof BulkSalaryWizardData['filters'], value: string | undefined) => {
    onUpdateData('filters', {
      ...data.filters,
      [key]: value === 'all' ? undefined : value,
    });
  };

  const filteredEmployees = useMemo(() => {
    let result = [...employees];
    
    if (data.filters.departmentId) {
      result = result.filter(m => m.departmentId === data.filters.departmentId);
    }
    if (data.filters.positionId) {
      result = result.filter(m => m.positionId === data.filters.positionId);
    }
    if (data.filters.employmentType) {
      result = result.filter(m => m.employmentType === data.filters.employmentType);
    }
    
    return result;
  }, [employees, data.filters]);

  const handleSelectAll = () => {
    const allIds = filteredEmployees.map(e => e.id);
    onUpdateData('selectedEmployeeIds', allIds);
  };

  const handleClearAll = () => {
    onUpdateData('selectedEmployeeIds', []);
  };

  const toggleEmployee = (id: string) => {
    const current = data.selectedEmployeeIds;
    if (current.includes(id)) {
      onUpdateData('selectedEmployeeIds', current.filter(i => i !== id));
    } else {
      onUpdateData('selectedEmployeeIds', [...current, id]);
    }
  };

  const formatCurrency = (amount: number | undefined) => {
    if (amount === undefined) return '-';
    return `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase();
  };

  const nationalities = useMemo(() => {
    const unique = new Set(employees.map(e => (e as any).nationality).filter(Boolean));
    return Array.from(unique).sort();
  }, [employees]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Select Employees</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Filter and select employees to include in this bulk salary update
        </p>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Department</Label>
          <Select
            value={data.filters.departmentId || 'all'}
            onValueChange={(v) => updateFilter('departmentId', v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Departments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map(d => (
                <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Job Title</Label>
          <Select
            value={data.filters.positionId || 'all'}
            onValueChange={(v) => updateFilter('positionId', v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Positions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Positions</SelectItem>
              {positions.map(p => (
                <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Employment Type</Label>
          <Select
            value={data.filters.employmentType || 'all'}
            onValueChange={(v) => updateFilter('employmentType', v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="full_time">Full-Time</SelectItem>
              <SelectItem value="part_time">Part-Time</SelectItem>
              <SelectItem value="contract">Contract</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Selection controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="gap-1">
            <Users className="h-3 w-3" />
            {data.selectedEmployeeIds.length} selected
          </Badge>
          <span className="text-sm text-muted-foreground">
            of {filteredEmployees.length} employees
          </span>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleSelectAll}>
            Select All
          </Button>
          <Button variant="outline" size="sm" onClick={handleClearAll}>
            Clear All
          </Button>
        </div>
      </div>

      {/* Employee list */}
      <ScrollArea className="h-[400px] border rounded-lg">
        <div className="divide-y">
          {filteredEmployees.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              No employees match the current filters
            </div>
          ) : (
            filteredEmployees.map(employee => {
              const isSelected = data.selectedEmployeeIds.includes(employee.id);
              
              return (
                <div
                  key={employee.id}
                  className={`flex items-center gap-4 px-4 py-3 cursor-pointer hover:bg-muted/50 transition-colors ${
                    isSelected ? 'bg-primary/5' : ''
                  }`}
                  onClick={() => toggleEmployee(employee.id)}
                >
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => toggleEmployee(employee.id)}
                  />
                  
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={employee.avatar} />
                    <AvatarFallback>
                      {getInitials(employee.firstName, employee.lastName)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {employee.firstName} {employee.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {employee.jobTitle} • {employee.department}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {formatCurrency(employee.salary)}
                    </p>
                    {employee.isSubjectToGosi && (
                      <p className="text-xs text-muted-foreground">
                        GOSI: {formatCurrency(employee.gosiRegisteredSalary)}
                      </p>
                    )}
                  </div>

                  {employee.isSubjectToGosi && (
                    <Badge variant="outline" className="text-xs">
                      GOSI
                    </Badge>
                  )}
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>

      {data.selectedEmployeeIds.length === 0 && (
        <p className="text-sm text-destructive">
          Please select at least one employee to continue
        </p>
      )}
    </div>
  );
}
