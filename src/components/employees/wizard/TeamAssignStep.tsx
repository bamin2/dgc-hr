import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Users, Monitor, UserCheck } from "lucide-react";
import { mockEmployees } from "@/data/employees";

export interface TeamAssignments {
  managerId: string;
  buddyId: string;
  itContactId: string;
  hrContactId: string;
  welcomeMessage: string;
}

interface TeamAssignStepProps {
  data: TeamAssignments;
  onChange: (data: TeamAssignments) => void;
}

const managers = mockEmployees.filter((emp) =>
  ["CEO", "CTO", "VP", "Director", "Manager", "Lead"].some((title) =>
    emp.position.includes(title)
  )
);

const allEmployees = mockEmployees.filter((emp) => emp.status === "active");

const hrEmployees = mockEmployees.filter((emp) =>
  emp.department === "HR" || emp.position.toLowerCase().includes("hr")
);

const itEmployees = mockEmployees.filter((emp) =>
  emp.department === "IT" || emp.department === "Engineering" || emp.position.toLowerCase().includes("it")
);

export function TeamAssignStep({ data, onChange }: TeamAssignStepProps) {
  const updateField = <K extends keyof TeamAssignments>(
    field: K,
    value: TeamAssignments[K]
  ) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-1">Assign Team</h2>
        <p className="text-muted-foreground">
          Assign key people who will support this employee's onboarding journey.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <UserCheck className="h-4 w-4 text-green-600" />
              Manager
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select
              value={data.managerId}
              onValueChange={(value) => updateField("managerId", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select manager" />
              </SelectTrigger>
              <SelectContent>
                {managers.map((emp) => (
                  <SelectItem key={emp.id} value={emp.id}>
                    {emp.firstName} {emp.lastName} - {emp.position}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-2">
              Direct supervisor responsible for role-specific guidance
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="h-4 w-4 text-amber-600" />
              Onboarding Buddy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select
              value={data.buddyId}
              onValueChange={(value) => updateField("buddyId", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select buddy" />
              </SelectTrigger>
              <SelectContent>
                {allEmployees.map((emp) => (
                  <SelectItem key={emp.id} value={emp.id}>
                    {emp.firstName} {emp.lastName} - {emp.department}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-2">
              A peer who will help with day-to-day questions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Monitor className="h-4 w-4 text-orange-600" />
              IT Contact
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select
              value={data.itContactId}
              onValueChange={(value) => updateField("itContactId", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select IT contact" />
              </SelectTrigger>
              <SelectContent>
                {itEmployees.length > 0 ? (
                  itEmployees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName} - {emp.position}
                    </SelectItem>
                  ))
                ) : (
                  allEmployees.slice(0, 5).map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName} - {emp.position}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-2">
              Handles equipment setup and technical access
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-4 w-4 text-teal-600" />
              HR Contact
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select
              value={data.hrContactId}
              onValueChange={(value) => updateField("hrContactId", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select HR contact" />
              </SelectTrigger>
              <SelectContent>
                {hrEmployees.length > 0 ? (
                  hrEmployees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName} - {emp.position}
                    </SelectItem>
                  ))
                ) : (
                  allEmployees.slice(0, 5).map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName} - {emp.position}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-2">
              Primary HR contact for policies and benefits
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Welcome Message (Optional)</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Write a personalized welcome message for the new employee..."
            value={data.welcomeMessage}
            onChange={(e) => updateField("welcomeMessage", e.target.value)}
            rows={4}
          />
          <p className="text-xs text-muted-foreground mt-2">
            This message will be sent to the employee on their first day
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
