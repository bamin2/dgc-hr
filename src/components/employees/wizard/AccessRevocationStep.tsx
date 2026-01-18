import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShieldOff, Plus, Trash2, Mail, Cloud, Building, Globe, KeyRound, CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { type AccessSystem, type AccessSystemType, type AccessStatus } from "./OffboardingWizard";
import { Badge } from "@/components/ui/badge";
import { useEmployees } from "@/hooks/useEmployees";

interface AccessRevocationStepProps {
  systems: AccessSystem[];
  onSystemsChange: (systems: AccessSystem[]) => void;
  itContact: string;
  onItContactChange: (contact: string) => void;
  dataBackupRequired: boolean;
  onDataBackupRequiredChange: (required: boolean) => void;
  emailForwarding: boolean;
  onEmailForwardingChange: (forwarding: boolean) => void;
  lastWorkingDay: string;
}

const typeIcons: Record<AccessSystemType, React.ReactNode> = {
  email: <Mail className="h-4 w-4" />,
  cloud: <Cloud className="h-4 w-4" />,
  internal: <Building className="h-4 w-4" />,
  third_party: <Globe className="h-4 w-4" />,
  physical: <KeyRound className="h-4 w-4" />,
};

const typeLabels: Record<AccessSystemType, string> = {
  email: "Email",
  cloud: "Cloud",
  internal: "Internal",
  third_party: "Third Party",
  physical: "Physical",
};

const statusColors: Record<AccessStatus, string> = {
  active: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  scheduled: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400",
  revoked: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
};

export function AccessRevocationStep({
  systems,
  onSystemsChange,
  itContact,
  onItContactChange,
  dataBackupRequired,
  onDataBackupRequiredChange,
  emailForwarding,
  onEmailForwardingChange,
  lastWorkingDay,
}: AccessRevocationStepProps) {
  const [newSystemName, setNewSystemName] = useState("");
  const [newSystemType, setNewSystemType] = useState<AccessSystemType>("cloud");
  const { data: employees = [] } = useEmployees();

  const itEmployees = employees.filter((emp) => emp.department === "Engineering");

  const updateSystem = (id: string, field: keyof AccessSystem, value: string) => {
    onSystemsChange(
      systems.map((system) =>
        system.id === id ? { ...system, [field]: value } : system
      )
    );
  };

  const addSystem = () => {
    if (!newSystemName.trim()) return;

    const newSystem: AccessSystem = {
      id: `custom-${Date.now()}`,
      name: newSystemName,
      type: newSystemType,
      accessLevel: "Standard",
      revocationDate: lastWorkingDay,
      status: "scheduled",
    };

    onSystemsChange([...systems, newSystem]);
    setNewSystemName("");
    setNewSystemType("cloud");
  };

  const removeSystem = (id: string) => {
    onSystemsChange(systems.filter((system) => system.id !== id));
  };

  const scheduledCount = systems.filter((s) => s.status === "scheduled").length;
  const revokedCount = systems.filter((s) => s.status === "revoked").length;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{systems.length}</div>
            <p className="text-sm text-muted-foreground">Total Systems</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-teal-600">{scheduledCount}</div>
            <p className="text-sm text-muted-foreground">Scheduled for Revocation</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gray-600">{revokedCount}</div>
            <p className="text-sm text-muted-foreground">Already Revoked</p>
          </CardContent>
        </Card>
      </div>

      {/* IT Contact & Options */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Revocation Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="itContact">IT Contact for Revocation *</Label>
              <Select value={itContact} onValueChange={onItContactChange}>
                <SelectTrigger id="itContact">
                  <SelectValue placeholder="Select IT contact" />
                </SelectTrigger>
                <SelectContent>
                  {itEmployees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName}
                    </SelectItem>
                  ))}
                  {itEmployees.length === 0 && (
                    <SelectItem value="it-default">IT Support</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-4 pt-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="dataBackup"
                checked={dataBackupRequired}
                onCheckedChange={(checked) => onDataBackupRequiredChange(checked as boolean)}
              />
              <Label htmlFor="dataBackup" className="text-sm font-normal cursor-pointer">
                Data backup required before revocation
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="emailForwarding"
                checked={emailForwarding}
                onCheckedChange={(checked) => onEmailForwardingChange(checked as boolean)}
              />
              <Label htmlFor="emailForwarding" className="text-sm font-normal cursor-pointer">
                Set up email forwarding
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Systems Table */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <ShieldOff className="h-5 w-5 text-primary" />
            System Access
          </CardTitle>
          <CardDescription>
            Schedule access revocation for all systems
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>System</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Access Level</TableHead>
                <TableHead>Revocation Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {systems.map((system) => (
                <TableRow key={system.id}>
                  <TableCell className="font-medium">{system.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {typeIcons[system.type]}
                      <span className="text-sm text-muted-foreground">
                        {typeLabels[system.type]}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-normal">
                      {system.accessLevel}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className={cn(
                            "h-8 w-36 justify-start text-left font-normal",
                            !system.revocationDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-3 w-3" />
                          {system.revocationDate ? format(parseISO(system.revocationDate), "MMM d, yyyy") : "Select"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 z-[100]" align="start">
                        <Calendar
                          mode="single"
                          selected={system.revocationDate ? parseISO(system.revocationDate) : undefined}
                          onSelect={(date) => updateSystem(system.id, "revocationDate", date ? format(date, "yyyy-MM-dd") : "")}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={system.status}
                      onValueChange={(value: AccessStatus) =>
                        updateSystem(system.id, "status", value)
                      }
                    >
                      <SelectTrigger className="h-8 w-28">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                        <SelectItem value="revoked">Revoked</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    {system.id.startsWith("custom-") && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => removeSystem(system.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Add Custom System */}
          <div className="flex items-center gap-3 mt-4 pt-4 border-t">
            <Input
              value={newSystemName}
              onChange={(e) => setNewSystemName(e.target.value)}
              placeholder="Add custom system..."
              className="flex-1"
            />
            <Select
              value={newSystemType}
              onValueChange={(value: AccessSystemType) => setNewSystemType(value)}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(typeLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={addSystem} disabled={!newSystemName.trim()} className="gap-2">
              <Plus className="h-4 w-4" />
              Add
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
