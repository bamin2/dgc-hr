import { 
  CheckCircle, 
  DollarSign, 
  FileText, 
  Clock, 
  Settings, 
  Megaphone,
  Briefcase,
  CreditCard
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { NotificationType } from "@/hooks/useNotifications";
import type { NotificationEntityType } from "@/lib/notificationService";

interface NotificationTypeBadgeProps {
  type: NotificationType;
  entityType?: NotificationEntityType;
  size?: "sm" | "md" | "lg";
  className?: string;
}

// Config for main notification types
const typeConfig: Record<NotificationType, {
  icon: typeof CheckCircle;
  bgColor: string;
  iconColor: string;
}> = {
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
  document: {
    icon: FileText,
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
    iconColor: "text-blue-600 dark:text-blue-400"
  },
  reminder: {
    icon: Clock,
    bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
    iconColor: "text-yellow-600 dark:text-yellow-400"
  },
  announcement: {
    icon: Megaphone,
    bgColor: "bg-purple-100 dark:bg-purple-900/30",
    iconColor: "text-purple-600 dark:text-purple-400"
  },
  system: {
    icon: Settings,
    bgColor: "bg-gray-100 dark:bg-gray-800",
    iconColor: "text-gray-600 dark:text-gray-400"
  }
};

// Override icons based on entity type for more specific visuals
const entityTypeIcons: Partial<Record<NotificationEntityType, typeof CheckCircle>> = {
  business_trip: Briefcase,
  loan: CreditCard,
};

const sizeConfig = {
  sm: { wrapper: "w-7 h-7", icon: "w-3.5 h-3.5" },
  md: { wrapper: "w-9 h-9", icon: "w-4 h-4" },
  lg: { wrapper: "w-10 h-10", icon: "w-5 h-5" }
};

export function NotificationTypeBadge({ 
  type, 
  entityType,
  size = "md", 
  className 
}: NotificationTypeBadgeProps) {
  const config = typeConfig[type] || typeConfig.system;
  const sizes = sizeConfig[size];
  
  // Use entity-specific icon if available, otherwise fall back to type icon
  const Icon = (entityType && entityTypeIcons[entityType]) || config.icon;

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
