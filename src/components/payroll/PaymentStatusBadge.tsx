import { cn } from "@/lib/utils";

interface PaymentStatusBadgeProps {
  status: 'paid' | 'pending' | 'processing';
  className?: string;
}

const statusConfig = {
  paid: {
    label: 'Paid',
    className: 'bg-success/10 text-success border-success/20',
  },
  pending: {
    label: 'Pending',
    className: 'bg-warning/10 text-warning border-warning/20',
  },
  processing: {
    label: 'Processing',
    className: 'bg-info/10 text-info border-info/20',
  },
};

export function PaymentStatusBadge({ status, className }: PaymentStatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
