import { format, formatDistanceToNow } from "date-fns";
import { ArrowRight, MessageSquare, Plus, UserMinus, UserPlus } from "lucide-react";
import { ProjectActivity, projectStatuses } from "@/data/projects";
import { mockEmployees } from "@/data/employees";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CommentContent } from "./CommentContent";
import { cn } from "@/lib/utils";

interface ActivityItemProps {
  activity: ProjectActivity;
  isLast?: boolean;
}

const activityConfig: Record<ProjectActivity['type'], { icon: typeof Plus; colorClass: string }> = {
  created: { icon: Plus, colorClass: "bg-green-500" },
  status_change: { icon: ArrowRight, colorClass: "bg-blue-500" },
  assignee_added: { icon: UserPlus, colorClass: "bg-green-500" },
  assignee_removed: { icon: UserMinus, colorClass: "bg-orange-500" },
  comment: { icon: MessageSquare, colorClass: "bg-muted-foreground" },
};

export function ActivityItem({ activity, isLast }: ActivityItemProps) {
  const user = mockEmployees.find(e => e.id === activity.userId);
  const assignee = activity.assigneeId ? mockEmployees.find(e => e.id === activity.assigneeId) : null;
  const config = activityConfig[activity.type];
  const Icon = config.icon;

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  const getActionText = () => {
    switch (activity.type) {
      case 'created':
        return 'created this project';
      case 'status_change':
        return (
          <span className="flex items-center gap-1 flex-wrap">
            changed status from{" "}
            <span className="font-medium">{projectStatuses[activity.oldStatus!].label}</span>
            {" → "}
            <span className="font-medium">{projectStatuses[activity.newStatus!].label}</span>
          </span>
        );
      case 'assignee_added':
        return (
          <span>
            added <span className="font-medium">{assignee?.firstName} {assignee?.lastName}</span>
          </span>
        );
      case 'assignee_removed':
        return (
          <span>
            removed <span className="font-medium">{assignee?.firstName} {assignee?.lastName}</span>
          </span>
        );
      case 'comment':
        return 'added a comment';
      default:
        return 'made a change';
    }
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays < 7) {
      return formatDistanceToNow(date, { addSuffix: true });
    }
    return format(date, "MMM d, yyyy 'at' h:mm a");
  };

  return (
    <div className="relative flex gap-3 pb-4">
      {/* Timeline connector */}
      {!isLast && (
        <div className="absolute left-[11px] top-6 bottom-0 w-0.5 bg-border" />
      )}
      
      {/* Icon */}
      <div className={cn(
        "relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
        config.colorClass
      )}>
        <Icon className="h-3 w-3 text-white" />
      </div>
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <Avatar className="h-5 w-5">
            <AvatarImage src={user?.avatar} alt={`${user?.firstName} ${user?.lastName}`} />
            <AvatarFallback className="text-[10px]">
              {user ? getInitials(user.firstName, user.lastName) : '??'}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium truncate">
            {user?.firstName} {user?.lastName}
          </span>
          <span className="text-sm text-muted-foreground">
            {getActionText()}
          </span>
        </div>
        
        {/* Comment content */}
        {activity.type === 'comment' && activity.comment && (
          <div className="mt-2 p-3 bg-muted/50 rounded-lg text-sm">
            <CommentContent 
              content={activity.comment} 
              mentionedUserIds={activity.mentionedUserIds}
            />
          </div>
        )}
        
        {/* Timestamp */}
        <p className="text-xs text-muted-foreground mt-1">
          {formatTimestamp(activity.timestamp)}
        </p>
      </div>
    </div>
  );
}
