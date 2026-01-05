import { useState } from "react";
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
import { cn } from "@/lib/utils";
import { departments, jobTitles, workLocations } from "@/data/team";
import { mockEmployees } from "@/data/employees";

export interface TeamRoleData {
  workLocation: string;
  jobTitle: string;
  department: string;
  managerId: string;
  startDate: Date | undefined;
}

interface TeamRoleStepProps {
  data: TeamRoleData;
  onChange: (data: TeamRoleData) => void;
}

export function TeamRoleStep({ data, onChange }: TeamRoleStepProps) {
  const updateField = <K extends keyof TeamRoleData>(
    field: K,
    value: TeamRoleData[K]
  ) => {
    onChange({ ...data, [field]: value });
  };

  const managers = mockEmployees.filter(
    (emp) => emp.position.includes("Manager") || emp.position.includes("Director")
  );

  const selectedManager = managers.find((m) => m.id === data.managerId);

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
          value={data.workLocation}
          onValueChange={(value) => updateField("workLocation", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select location" />
          </SelectTrigger>
          <SelectContent>
            {workLocations.map((location) => (
              <SelectItem key={location} value={location}>
                {location}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Job Title */}
      <div className="space-y-2">
        <Label>Job title</Label>
        <Select
          value={data.jobTitle}
          onValueChange={(value) => updateField("jobTitle", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select job title" />
          </SelectTrigger>
          <SelectContent>
            {jobTitles.map((title) => (
              <SelectItem key={title} value={title}>
                {title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Department */}
      <div className="space-y-2">
        <Label>Department</Label>
        <Select
          value={data.department}
          onValueChange={(value) => updateField("department", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select department" />
          </SelectTrigger>
          <SelectContent>
            {departments.map((dept) => (
              <SelectItem key={dept} value={dept}>
                {dept}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Manager */}
      <div className="space-y-2">
        <Label>Manager</Label>
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
            {managers.map((manager) => (
              <SelectItem key={manager.id} value={manager.id}>
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={manager.avatar} />
                    <AvatarFallback className="text-xs">
                      {manager.firstName[0]}
                      {manager.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <span>
                    {manager.firstName} {manager.lastName}
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
