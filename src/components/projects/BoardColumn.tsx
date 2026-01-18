import { useState } from "react";
import { Plus, Loader2, Circle, AlertCircle, CheckCircle } from "lucide-react";
import { Project, ProjectStatus, projectStatuses } from "@/hooks/useProjects";
import { ProjectCard } from "./ProjectCard";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BoardColumnProps {
  status: ProjectStatus;
  projects: Project[];
  onAddProject: (status: ProjectStatus) => void;
  onProjectClick: (project: Project) => void;
  draggedProjectId: string | null;
  onDragStart: (project: Project) => void;
  onDragEnd: () => void;
  onDrop: (projectId: string, newStatus: ProjectStatus, insertIndex?: number) => void;
}

const statusIcons: Record<ProjectStatus, React.ReactNode> = {
  in_progress: <Loader2 className="h-4 w-4 text-blue-500" />,
  todo: <Circle className="h-4 w-4 text-muted-foreground" />,
  need_review: <AlertCircle className="h-4 w-4 text-yellow-500" />,
  done: <CheckCircle className="h-4 w-4 text-green-500" />,
};

export function BoardColumn({ 
  status, 
  projects, 
  onAddProject, 
  onProjectClick,
  draggedProjectId,
  onDragStart,
  onDragEnd,
  onDrop,
}: BoardColumnProps) {
  const config = projectStatuses[status];
  const [isDragOver, setIsDragOver] = useState(false);
  const [dropIndex, setDropIndex] = useState<number | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setIsDragOver(true);

    // Calculate drop index based on mouse position
    const container = e.currentTarget as HTMLElement;
    const cards = container.querySelectorAll('[data-card-index]');
    const mouseY = e.clientY;
    
    let newDropIndex = projects.length;
    cards.forEach((card, index) => {
      const rect = card.getBoundingClientRect();
      const cardMiddle = rect.top + rect.height / 2;
      if (mouseY < cardMiddle && newDropIndex === projects.length) {
        newDropIndex = index;
      }
    });
    setDropIndex(newDropIndex);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only set isDragOver to false if we're actually leaving the column
    const relatedTarget = e.relatedTarget as HTMLElement;
    if (!e.currentTarget.contains(relatedTarget)) {
      setIsDragOver(false);
      setDropIndex(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const projectId = e.dataTransfer.getData("projectId");
    if (projectId) {
      onDrop(projectId, status, dropIndex ?? undefined);
    }
    setIsDragOver(false);
    setDropIndex(null);
  };
  
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
          size="icon-sm"
          onClick={() => onAddProject(status)}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Cards Container */}
      <div 
        className={cn(
          "flex flex-col gap-3 flex-1 min-h-[200px] p-2 rounded-lg transition-colors",
          "bg-muted/30",
          isDragOver && "bg-primary/5 border-2 border-dashed border-primary/50"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {projects.map((project, index) => (
          <div key={project.id} data-card-index={index}>
            {dropIndex === index && isDragOver && (
              <div className="h-1 bg-primary rounded-full mb-3 animate-pulse" />
            )}
            <ProjectCard
              project={project}
              onClick={() => onProjectClick(project)}
              isDragging={draggedProjectId === project.id}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
            />
          </div>
        ))}
        {dropIndex === projects.length && isDragOver && (
          <div className="h-1 bg-primary rounded-full animate-pulse" />
        )}
      </div>
    </div>
  );
}
