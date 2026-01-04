import { Calendar, MessageSquare, Paperclip, MoreHorizontal, GripVertical } from "lucide-react";
import { format } from "date-fns";
import { Project, getProjectAssignees } from "@/data/projects";
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

interface ProjectCardProps {
  project: Project;
  onClick?: () => void;
  isDragging?: boolean;
  onDragStart?: (project: Project) => void;
  onDragEnd?: () => void;
}

export function ProjectCard({ project, onClick, isDragging, onDragStart, onDragEnd }: ProjectCardProps) {
  const assignees = getProjectAssignees(project);
  const displayedAssignees = assignees.slice(0, 3);
  const remainingCount = assignees.length - 3;

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("projectId", project.id);
    e.dataTransfer.effectAllowed = "move";
    onDragStart?.(project);
  };

  const handleDragEnd = () => {
    onDragEnd?.();
  };

  return (
    <div
      className={cn(
        "bg-card border border-border rounded-lg p-4 cursor-pointer group",
        "hover:shadow-md transition-all",
        isDragging && "opacity-50 scale-95"
      )}
      onClick={onClick}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {/* Header with drag handle, title and menu */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-start gap-2">
          <GripVertical className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity cursor-grab mt-0.5 shrink-0" />
          <h4 className="text-sm font-medium text-foreground line-clamp-2">
            {project.title}
          </h4>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Edit</DropdownMenuItem>
            <DropdownMenuItem>Move to...</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Description */}
      <p className="text-xs text-muted-foreground line-clamp-2 mb-3 ml-6">
        {project.description}
      </p>

      {/* Meta info */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3 ml-6">
        <div className="flex items-center gap-1">
          <Calendar className="h-3.5 w-3.5" />
          <span>{format(project.dueDate, "MMM, dd, yyyy")}</span>
        </div>
        <div className="flex items-center gap-1">
          <MessageSquare className="h-3.5 w-3.5" />
          <span>{project.commentsCount}</span>
        </div>
        <div className="flex items-center gap-1">
          <Paperclip className="h-3.5 w-3.5" />
          <span>{project.attachmentsCount}</span>
        </div>
      </div>

      {/* Footer with priority and assignees */}
      <div className="flex items-center justify-between ml-6">
        <PriorityBadge priority={project.priority} />
        
        <div className="flex items-center">
          <div className="flex -space-x-2">
            {displayedAssignees.map((assignee) => (
              <Avatar key={assignee.id} className="h-6 w-6 border-2 border-card">
                <AvatarImage src={assignee.avatar} alt={`${assignee.firstName} ${assignee.lastName}`} />
                <AvatarFallback className="text-[10px]">
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
    </div>
  );
}
