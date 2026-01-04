import { MoreHorizontal } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { Project, getProjectAssignees, priorityConfig } from "@/data/projects";
import { PriorityBadge } from "./PriorityBadge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface TimelineCardProps {
  project: Project;
  weekStart: Date;
  dayWidth: number;
  onClick?: () => void;
}

export function TimelineCard({ project, weekStart, dayWidth, onClick }: TimelineCardProps) {
  const assignees = getProjectAssignees(project);
  const displayedAssignees = assignees.slice(0, 3);
  const remainingCount = assignees.length - 3;

  // Calculate position and width
  const startOffset = Math.max(0, differenceInDays(project.startDate, weekStart));
  const duration = differenceInDays(project.endDate, project.startDate) + 1;
  
  const left = startOffset * dayWidth;
  const width = Math.max(duration * dayWidth - 8, dayWidth - 8); // Minimum width of 1 day

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  const progressConfig = priorityConfig[project.priority];

  return (
    <div
      className={cn(
        "absolute bg-card border border-border rounded-lg p-3 cursor-pointer",
        "hover:shadow-md transition-shadow"
      )}
      style={{
        left: `${left}px`,
        width: `${width}px`,
        minWidth: '200px',
      }}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="text-sm font-medium text-foreground line-clamp-1">
          {project.title}
        </h4>
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon" className="h-5 w-5 shrink-0">
              <MoreHorizontal className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Edit</DropdownMenuItem>
            <DropdownMenuItem>Move to...</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Date range */}
      <p className="text-xs text-muted-foreground mb-3">
        {format(project.startDate, "EEE dd")} - {format(project.endDate, "EEE dd")}
      </p>

      {/* Priority and assignees */}
      <div className="flex items-center justify-between mb-3">
        <PriorityBadge priority={project.priority} />
        
        <div className="flex items-center">
          <div className="flex -space-x-2">
            {displayedAssignees.map((assignee) => (
              <Avatar key={assignee.id} className="h-5 w-5 border-2 border-card">
                <AvatarImage src={assignee.avatar} alt={`${assignee.firstName} ${assignee.lastName}`} />
                <AvatarFallback className="text-[8px]">
                  {getInitials(assignee.firstName, assignee.lastName)}
                </AvatarFallback>
              </Avatar>
            ))}
          </div>
          {remainingCount > 0 && (
            <span className="ml-1 text-xs text-muted-foreground">
              +{remainingCount.toString().padStart(2, '0')}
            </span>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full", progressConfig.dotClass)}
          style={{ width: '70%' }}
        />
      </div>
    </div>
  );
}
