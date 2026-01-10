import { useState } from "react";
import { ChevronDown, ChevronRight, Plus, Loader2, Circle, AlertCircle, CheckCircle, Calendar, Globe } from "lucide-react";
import { format } from "date-fns";
import { Project, ProjectStatus, projectStatuses } from "@/hooks/useProjects";
import { PriorityBadge } from "./PriorityBadge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

interface ListSectionProps {
  status: ProjectStatus;
  projects: Project[];
  onAddProject: (status: ProjectStatus) => void;
  onProjectClick: (project: Project) => void;
}

const statusIcons: Record<ProjectStatus, React.ReactNode> = {
  in_progress: <Loader2 className="h-4 w-4 text-teal-600" />,
  todo: <Circle className="h-4 w-4 text-muted-foreground" />,
  need_review: <AlertCircle className="h-4 w-4 text-yellow-500" />,
  done: <CheckCircle className="h-4 w-4 text-green-500" />,
};

export function ListSection({ status, projects, onAddProject, onProjectClick }: ListSectionProps) {
  const [isOpen, setIsOpen] = useState(true);
  const config = projectStatuses[status];

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      {/* Section Header */}
      <div className="flex items-center justify-between py-3 px-4 bg-muted/50 rounded-t-lg border border-border">
        <CollapsibleTrigger className="flex items-center gap-2">
          {isOpen ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
          {statusIcons[status]}
          <span className="font-medium text-sm text-foreground">{config.label}</span>
          <span className="text-xs text-muted-foreground bg-background px-1.5 py-0.5 rounded">
            {projects.length.toString().padStart(2, '0')}
          </span>
        </CollapsibleTrigger>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => onAddProject(status)}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <CollapsibleContent>
        {/* Table Header */}
        <div className="grid grid-cols-[auto_40px_1fr_1.5fr_120px_100px_80px] gap-4 px-4 py-2 border-x border-border bg-muted/30 text-xs text-muted-foreground font-medium">
          <div className="w-5" />
          <div />
          <div>Task Name</div>
          <div>Description</div>
          <div>Date</div>
          <div>People</div>
          <div>Priority</div>
        </div>

        {/* Table Rows */}
        <div className="border-x border-b border-border rounded-b-lg overflow-hidden">
          {projects.map((project) => {
            const assigneeCount = project.assigneeIds.length;

            return (
              <div
                key={project.id}
                className={cn(
                  "grid grid-cols-[auto_40px_1fr_1.5fr_120px_100px_80px] gap-4 px-4 py-3 items-center",
                  "border-b border-border last:border-b-0",
                  "hover:bg-muted/30 cursor-pointer transition-colors"
                )}
                onClick={() => onProjectClick(project)}
              >
                <Checkbox onClick={(e) => e.stopPropagation()} />
                <Globe className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground truncate">
                  {project.title}
                </span>
                <span className="text-sm text-muted-foreground truncate">
                  {project.description}
                </span>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{format(project.dueDate, "MMM, dd")}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-xs text-muted-foreground">
                    {assigneeCount} member{assigneeCount !== 1 ? 's' : ''}
                  </span>
                </div>
                <PriorityBadge priority={project.priority} />
              </div>
            );
          })}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
