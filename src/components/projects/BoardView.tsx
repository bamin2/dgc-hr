import { useState } from "react";
import { Project, ProjectStatus } from "@/data/projects";
import { BoardColumn } from "./BoardColumn";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface BoardViewProps {
  projects: Project[];
  onAddProject: (status: ProjectStatus) => void;
  onProjectClick: (project: Project) => void;
  onProjectMove?: (projectId: string, newStatus: ProjectStatus, insertIndex?: number) => void;
}

const statusOrder: ProjectStatus[] = ['in_progress', 'todo', 'need_review', 'done'];

export function BoardView({ projects, onAddProject, onProjectClick, onProjectMove }: BoardViewProps) {
  const [draggedProjectId, setDraggedProjectId] = useState<string | null>(null);

  const getProjectsForStatus = (status: ProjectStatus) => {
    return projects.filter(p => p.status === status);
  };

  const handleDragStart = (project: Project) => {
    setDraggedProjectId(project.id);
  };

  const handleDragEnd = () => {
    setDraggedProjectId(null);
  };

  const handleDrop = (projectId: string, newStatus: ProjectStatus, insertIndex?: number) => {
    onProjectMove?.(projectId, newStatus, insertIndex);
    setDraggedProjectId(null);
  };

  return (
    <ScrollArea className="w-full">
      <div className="flex gap-4 pb-4">
        {statusOrder.map((status) => (
          <BoardColumn
            key={status}
            status={status}
            projects={getProjectsForStatus(status)}
            onAddProject={onAddProject}
            onProjectClick={onProjectClick}
            draggedProjectId={draggedProjectId}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDrop={handleDrop}
          />
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
