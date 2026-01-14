import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useDepartments, usePositions, useEmployees } from "@/hooks/useEmployees";
import { useWorkLocations } from "@/hooks/useWorkLocations";
import { isInactiveEmployee } from "@/utils/orgHierarchy";

export interface TeamRoleData {
  workLocationId: string;
  positionId: string;
  departmentId: string;
  managerId: string;
  startDate: Date | undefined;
}

interface TeamRoleStepProps {
  data: TeamRoleData;
  onChange: (data: TeamRoleData) => void;
}

export function TeamRoleStep({ data, onChange }: TeamRoleStepProps) {
  const { data: departments, isLoading: depsLoading } = useDepartments();
  const { data: positions, isLoading: posLoading } = usePositions();
  const { data: employees, isLoading: empLoading } = useEmployees();
  const { data: workLocations, isLoading: locLoading } = useWorkLocations();

  const updateField = <K extends keyof TeamRoleData>(
    field: K,
    value: TeamRoleData[K]
  ) => {
    onChange({ ...data, [field]: value });
  };

  // Filter out inactive employees from manager options
  const activeEmployees = employees?.filter(e => !isInactiveEmployee(e)) || [];
  const selectedManager = activeEmployees.find((e) => e.id === data.managerId);

  const isLoading = depsLoading || posLoading || empLoading || locLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-6 w-40 mb-2" />
          <Skeleton className="h-4 w-60" />
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">
          Role information
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Set up the role and reporting structure
        </p>
      </div>

      {/* Work Location */}
      <div className="space-y-2">
        <Label>Work location</Label>
        <Select
          value={data.workLocationId}
          onValueChange={(value) => updateField("workLocationId", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select location" />
          </SelectTrigger>
          <SelectContent>
            {workLocations?.map((location) => (
              <SelectItem key={location.id} value={location.id}>
                {location.name}
                {location.city && ` - ${location.city}`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Job Title (Position) */}
      <div className="space-y-2">
        <Label>Job title</Label>
        <Select
          value={data.positionId}
          onValueChange={(value) => updateField("positionId", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select job title" />
          </SelectTrigger>
          <SelectContent>
            {positions?.map((position) => (
              <SelectItem key={position.id} value={position.id}>
                {position.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Department */}
      <div className="space-y-2">
        <Label>Department</Label>
        <Select
          value={data.departmentId}
          onValueChange={(value) => updateField("departmentId", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select department" />
          </SelectTrigger>
          <SelectContent>
            {departments?.map((dept) => (
              <SelectItem key={dept.id} value={dept.id}>
                {dept.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Manager (Optional) */}
      <div className="space-y-2">
        <Label>Manager (optional)</Label>
        <Select
          value={data.managerId}
          onValueChange={(value) => updateField("managerId", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select manager">
              {selectedManager && (
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={selectedManager.avatar} />
                    <AvatarFallback className="text-xs">
                      {selectedManager.firstName[0]}
                      {selectedManager.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <span>
                    {selectedManager.firstName} {selectedManager.lastName}
                  </span>
                </div>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {activeEmployees.map((employee) => (
              <SelectItem key={employee.id} value={employee.id}>
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={employee.avatar} />
                    <AvatarFallback className="text-xs">
                      {employee.firstName[0]}
                      {employee.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <span>
                    {employee.firstName} {employee.lastName}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Start Date */}
      <div className="space-y-2">
        <Label>Start date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !data.startDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {data.startDate ? (
                format(data.startDate, "PPP")
              ) : (
                <span>Pick a date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={data.startDate}
              onSelect={(date) => updateField("startDate", date)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
