import { Calendar, MessageSquare, Paperclip, MoreHorizontal, GripVertical } from "lucide-react";
import { format } from "date-fns";
import { Project } from "@/hooks/useProjects";
import { PriorityBadge } from "./PriorityBadge";
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
  const assigneeCount = project.assigneeIds.length;

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
        
        <span className="text-xs text-muted-foreground">
          {assigneeCount} member{assigneeCount !== 1 ? 's' : ''}
        </span>
      </div>
    </div>
  );
}
