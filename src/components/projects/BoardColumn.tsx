import { Plus, Loader2, Circle, AlertCircle, CheckCircle } from "lucide-react";
import { Project, ProjectStatus, projectStatuses } from "@/data/projects";
import { ProjectCard } from "./ProjectCard";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BoardColumnProps {
  status: ProjectStatus;
  projects: Project[];
  onAddProject: (status: ProjectStatus) => void;
  onProjectClick: (project: Project) => void;
}

const statusIcons: Record<ProjectStatus, React.ReactNode> = {
  in_progress: <Loader2 className="h-4 w-4 text-blue-500" />,
  todo: <Circle className="h-4 w-4 text-muted-foreground" />,
  need_review: <AlertCircle className="h-4 w-4 text-yellow-500" />,
  done: <CheckCircle className="h-4 w-4 text-green-500" />,
};

export function BoardColumn({ status, projects, onAddProject, onProjectClick }: BoardColumnProps) {
  const config = projectStatuses[status];
  
  return (
    <div className="flex flex-col min-w-[300px] max-w-[300px]">
      {/* Column Header */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2">
          {statusIcons[status]}
          <span className="font-medium text-sm text-foreground">{config.label}</span>
          <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
            {projects.length.toString().padStart(2, '0')}
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => onAddProject(status)}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Cards Container */}
      <div className={cn(
        "flex flex-col gap-3 flex-1 min-h-[200px] p-2 rounded-lg",
        "bg-muted/30"
      )}>
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onClick={() => onProjectClick(project)}
          />
        ))}
      </div>
    </div>
  );
}
