import { Project, ProjectStatus, getProjectsByStatus } from "@/data/projects";
import { BoardColumn } from "./BoardColumn";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface BoardViewProps {
  projects: Project[];
  onAddProject: (status: ProjectStatus) => void;
  onProjectClick: (project: Project) => void;
}

const statusOrder: ProjectStatus[] = ['in_progress', 'todo', 'need_review', 'done'];

export function BoardView({ projects, onAddProject, onProjectClick }: BoardViewProps) {
  const getProjectsForStatus = (status: ProjectStatus) => {
    return projects.filter(p => p.status === status);
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
          />
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
