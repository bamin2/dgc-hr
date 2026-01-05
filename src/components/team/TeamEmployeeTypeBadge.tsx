import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { EmploymentType } from "@/data/team";

interface TeamEmployeeTypeBadgeProps {
  type: EmploymentType;
  className?: string;
}

const typeConfig: Record<EmploymentType, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
  full_time: { label: 'Full-time', variant: 'default' },
  part_time: { label: 'Part-time', variant: 'secondary' },
  contract: { label: 'Contract', variant: 'outline' },
};

export function TeamEmployeeTypeBadge({ type, className }: TeamEmployeeTypeBadgeProps) {
  const config = typeConfig[type];

  return (
    <Badge variant={config.variant} className={cn("font-normal", className)}>
      {config.label}
    </Badge>
  );
}
