import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar as CalendarIcon, User } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import {
  type EmployeeDepartureData,
  type DepartureReason,
  type NoticePeriodStatus,
} from "./OffboardingWizard";
import {
  departureReasonOptions,
  noticePeriodStatusOptions,
} from "@/hooks/useOffboarding";

interface EmployeeInfo {
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  jobTitle: string;
}

interface OffboardingEmployeeStepProps {
  employee: EmployeeInfo;
  departureData: EmployeeDepartureData;
  onDepartureDataChange: (data: EmployeeDepartureData) => void;
}

export function OffboardingEmployeeStep({
  employee,
  departureData,
  onDepartureDataChange,
}: OffboardingEmployeeStepProps) {
  const updateField = <K extends keyof EmployeeDepartureData>(
    field: K,
    value: EmployeeDepartureData[K]
  ) => {
    onDepartureDataChange({ ...departureData, [field]: value });
  };

  return (
    <div className="space-y-6">
      {/* Employee Info Card */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Employee Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground text-sm">Full Name</Label>
              <p className="font-medium">{employee.firstName} {employee.lastName}</p>
            </div>
            <div>
              <Label className="text-muted-foreground text-sm">Email</Label>
              <p className="font-medium">{employee.email}</p>
            </div>
            <div>
              <Label className="text-muted-foreground text-sm">Department</Label>
              <p className="font-medium">{employee.department}</p>
            </div>
            <div>
              <Label className="text-muted-foreground text-sm">Job Title</Label>
              <p className="font-medium">{employee.jobTitle}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Departure Details Card */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-primary" />
            Departure Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Last Working Day *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !departureData.lastWorkingDay && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {departureData.lastWorkingDay ? format(parseISO(departureData.lastWorkingDay), "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 z-[100]" align="start">
                  <Calendar
                    mode="single"
                    selected={departureData.lastWorkingDay ? parseISO(departureData.lastWorkingDay) : undefined}
                    onSelect={(date) => updateField("lastWorkingDay", date ? format(date, "yyyy-MM-dd") : "")}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="departureReason">Departure Reason *</Label>
              <Select
                value={departureData.departureReason}
                onValueChange={(value: DepartureReason) =>
                  updateField("departureReason", value)
                }
              >
                <SelectTrigger id="departureReason">
                  <SelectValue placeholder="Select reason" />
                </SelectTrigger>
                <SelectContent>
                  {departureReasonOptions.map((reason) => (
                    <SelectItem key={reason.value} value={reason.value}>
                      {reason.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="noticePeriodStatus">Notice Period Status *</Label>
            <Select
              value={departureData.noticePeriodStatus}
              onValueChange={(value: NoticePeriodStatus) =>
                updateField("noticePeriodStatus", value)
              }
            >
              <SelectTrigger id="noticePeriodStatus">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {noticePeriodStatusOptions.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <Checkbox
              id="resignationLetterReceived"
              checked={departureData.resignationLetterReceived}
              onCheckedChange={(checked) =>
                updateField("resignationLetterReceived", checked as boolean)
              }
            />
            <Label
              htmlFor="resignationLetterReceived"
              className="text-sm font-normal cursor-pointer"
            >
              Resignation letter received
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="managerConfirmed"
              checked={departureData.managerConfirmed}
              onCheckedChange={(checked) =>
                updateField("managerConfirmed", checked as boolean)
              }
            />
            <Label
              htmlFor="managerConfirmed"
              className="text-sm font-normal cursor-pointer"
            >
              Manager has confirmed the departure
            </Label>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
