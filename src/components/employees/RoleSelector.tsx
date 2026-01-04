import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AppRole, roleLabels, roleDescriptions } from "@/data/roles";
import { Shield, User, Users, Crown } from "lucide-react";

interface RoleSelectorProps {
  value: AppRole;
  onValueChange: (value: AppRole) => void;
  disabled?: boolean;
}

const roleIcons: Record<AppRole, React.ComponentType<{ className?: string }>> = {
  employee: User,
  manager: Users,
  hr: Shield,
  admin: Crown,
};

const roles: AppRole[] = ['employee', 'manager', 'hr', 'admin'];

export function RoleSelector({ value, onValueChange, disabled }: RoleSelectorProps) {
  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select a role" />
      </SelectTrigger>
      <SelectContent>
        {roles.map((role) => {
          const Icon = roleIcons[role];
          return (
            <SelectItem key={role} value={role}>
              <div className="flex items-center gap-2">
                <Icon className="w-4 h-4 text-muted-foreground" />
                <div className="flex flex-col">
                  <span>{roleLabels[role]}</span>
                </div>
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}

export function RoleSelectorWithDescription({ 
  value, 
  onValueChange, 
  disabled 
}: RoleSelectorProps) {
  return (
    <div className="space-y-3">
      <RoleSelector value={value} onValueChange={onValueChange} disabled={disabled} />
      <p className="text-sm text-muted-foreground">
        {roleDescriptions[value]}
      </p>
    </div>
  );
}
