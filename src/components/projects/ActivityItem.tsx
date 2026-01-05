import { format, formatDistanceToNow } from "date-fns";
import { ArrowRight, MessageSquare, Plus, UserMinus, UserPlus, RefreshCw } from "lucide-react";
import { ProjectActivityDisplay, projectStatuses, ActivityType } from "@/hooks/useProjects";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CommentContent } from "./CommentContent";
import { cn } from "@/lib/utils";

interface ActivityItemProps {
  activity: ProjectActivityDisplay;
  isLast?: boolean;
}

const activityConfig: Record<ActivityType, { icon: typeof Plus; colorClass: string }> = {
  created: { icon: Plus, colorClass: "bg-green-500" },
  status_change: { icon: ArrowRight, colorClass: "bg-blue-500" },
  assignee_added: { icon: UserPlus, colorClass: "bg-green-500" },
  assignee_removed: { icon: UserMinus, colorClass: "bg-orange-500" },
  comment: { icon: MessageSquare, colorClass: "bg-muted-foreground" },
  updated: { icon: RefreshCw, colorClass: "bg-blue-500" },
};

export function ActivityItem({ activity, isLast }: ActivityItemProps) {
  const config = activityConfig[activity.type];
  const Icon = config.icon;

  const getActionText = () => {
    switch (activity.type) {
      case 'created':
        return 'created this project';
      case 'status_change':
        return activity.oldStatus && activity.newStatus ? (
          <span className="flex items-center gap-1 flex-wrap">
            changed status from{" "}
            <span className="font-medium">{projectStatuses[activity.oldStatus].label}</span>
            {" → "}
            <span className="font-medium">{projectStatuses[activity.newStatus].label}</span>
          </span>
        ) : 'changed status';
      case 'assignee_added':
        return 'added a team member';
      case 'assignee_removed':
        return 'removed a team member';
      case 'comment':
        return 'added a comment';
      case 'updated':
        return 'updated the project';
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
            <AvatarFallback className="text-[10px]">
              U
            </AvatarFallback>
          </Avatar>
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
