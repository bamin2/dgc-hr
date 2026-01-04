import { Badge } from "@/components/ui/badge";
import { AppRole, roleLabels, roleColors } from "@/data/roles";
import { cn } from "@/lib/utils";
import { Shield, User, Users, Crown } from "lucide-react";

interface RoleBadgeProps {
  role: AppRole;
  showIcon?: boolean;
  className?: string;
}

const roleIcons: Record<AppRole, React.ComponentType<{ className?: string }>> = {
  employee: User,
  manager: Users,
  hr: Shield,
  admin: Crown,
};

export function RoleBadge({ role, showIcon = true, className }: RoleBadgeProps) {
  const Icon = roleIcons[role];
  const colors = roleColors[role];

  return (
    <Badge
      variant="secondary"
      className={cn(
        "font-medium",
        colors.bg,
        colors.text,
        className
      )}
    >
      {showIcon && <Icon className="w-3 h-3 mr-1" />}
      {roleLabels[role]}
    </Badge>
  );
}
