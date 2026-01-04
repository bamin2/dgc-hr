import { Project, ProjectStatus } from "@/data/projects";
import { ListSection } from "./ListSection";

interface ListViewProps {
  projects: Project[];
  onAddProject: (status: ProjectStatus) => void;
  onProjectClick: (project: Project) => void;
}

const statusOrder: ProjectStatus[] = ['in_progress', 'todo', 'need_review', 'done'];

export function ListView({ projects, onAddProject, onProjectClick }: ListViewProps) {
  const getProjectsForStatus = (status: ProjectStatus) => {
    return projects.filter(p => p.status === status);
  };

  return (
    <div className="space-y-4">
      {statusOrder.map((status) => {
        const statusProjects = getProjectsForStatus(status);
        if (statusProjects.length === 0) return null;
        
        return (
          <ListSection
            key={status}
            status={status}
            projects={statusProjects}
            onAddProject={onAddProject}
            onProjectClick={onProjectClick}
          />
        );
      })}
    </div>
  );
}
