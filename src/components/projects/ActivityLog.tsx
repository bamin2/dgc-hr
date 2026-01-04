import { Clock } from "lucide-react";
import { ProjectActivity } from "@/data/projects";
import { ActivityItem } from "./ActivityItem";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ActivityLogProps {
  activities: ProjectActivity[];
}

export function ActivityLog({ activities }: ActivityLogProps) {
  const sortedActivities = [...activities].sort(
    (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
  );

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Clock className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Activity ({activities.length})</span>
      </div>
      
      {sortedActivities.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          No activity yet
        </p>
      ) : (
        <ScrollArea className="h-[280px] pr-4">
          <div className="space-y-0">
            {sortedActivities.map((activity, index) => (
              <ActivityItem
                key={activity.id}
                activity={activity}
                isLast={index === sortedActivities.length - 1}
              />
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
