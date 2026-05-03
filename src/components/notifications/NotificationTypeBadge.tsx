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
    bgColor: "bg-success/10",
    iconColor: "text-success"
  },
  payroll: {
    icon: DollarSign,
    bgColor: "bg-warning/10",
    iconColor: "text-warning"
  },
  document: {
    icon: FileText,
    bgColor: "bg-info/10",
    iconColor: "text-info"
  },
  reminder: {
    icon: Clock,
    bgColor: "bg-warning/10",
    iconColor: "text-warning"
  },
  announcement: {
    icon: Megaphone,
    bgColor: "bg-info/10",
    iconColor: "text-info"
  },
  system: {
    icon: Settings,
    bgColor: "bg-muted",
    iconColor: "text-muted-foreground"
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
