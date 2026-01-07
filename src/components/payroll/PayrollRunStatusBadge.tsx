import { Badge } from "@/components/ui/badge";
import { FileText, CheckCircle, Send } from "lucide-react";

export type PayrollRunStatus = 'draft' | 'finalized' | 'payslips_issued';

interface PayrollRunStatusBadgeProps {
  status: PayrollRunStatus;
}

const statusConfig: Record<PayrollRunStatus, { label: string; variant: "default" | "secondary" | "outline"; icon: React.ComponentType<{ className?: string }> }> = {
  draft: {
    label: "Draft",
    variant: "secondary",
    icon: FileText,
  },
  finalized: {
    label: "Finalized",
    variant: "default",
    icon: CheckCircle,
  },
  payslips_issued: {
    label: "Payslips Issued",
    variant: "outline",
    icon: Send,
  },
};

export function PayrollRunStatusBadge({ status }: PayrollRunStatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.draft;
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className="gap-1">
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}
