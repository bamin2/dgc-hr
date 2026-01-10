import { Calendar, CheckCircle, DollarSign, UserPlus, Settings, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Notification } from "@/data/notifications";

interface NotificationTypeBadgeProps {
  type: Notification["type"];
  size?: "sm" | "md" | "lg";
  className?: string;
}

const typeConfig = {
  leave_request: {
    icon: Calendar,
    bgColor: "bg-teal-100 dark:bg-teal-900/30",
    iconColor: "text-teal-600 dark:text-teal-400"
  },
  approval: {
    icon: CheckCircle,
    bgColor: "bg-green-100 dark:bg-green-900/30",
    iconColor: "text-green-600 dark:text-green-400"
  },
  payroll: {
    icon: DollarSign,
    bgColor: "bg-orange-100 dark:bg-orange-900/30",
    iconColor: "text-orange-600 dark:text-orange-400"
  },
  employee: {
    icon: UserPlus,
    bgColor: "bg-stone-100 dark:bg-stone-900/30",
    iconColor: "text-stone-600 dark:text-stone-400"
  },
  system: {
    icon: Settings,
    bgColor: "bg-gray-100 dark:bg-gray-800",
    iconColor: "text-gray-600 dark:text-gray-400"
  },
  reminder: {
    icon: Clock,
    bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
    iconColor: "text-yellow-600 dark:text-yellow-400"
  }
};

const sizeConfig = {
  sm: { wrapper: "w-7 h-7", icon: "w-3.5 h-3.5" },
  md: { wrapper: "w-9 h-9", icon: "w-4 h-4" },
  lg: { wrapper: "w-10 h-10", icon: "w-5 h-5" }
};

export function NotificationTypeBadge({ type, size = "md", className }: NotificationTypeBadgeProps) {
  const config = typeConfig[type];
  const sizes = sizeConfig[size];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full shrink-0",
        sizes.wrapper,
        config.bgColor,
        className
      )}
    >
      <Icon className={cn(sizes.icon, config.iconColor)} />
    </div>
  );
}
