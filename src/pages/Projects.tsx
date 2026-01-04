import { useState, useMemo } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import {
  ProjectsHeader,
  ProjectsToolbar,
  ProjectViewTabs,
  BoardView,
  ListView,
  TimelineView,
  ProjectFilters,
  CreateProjectDialog,
  ProjectDetailSheet,
  ProjectViewMode,
  TimelineGranularity,
  ProjectFiltersState,
} from "@/components/projects";
import { Project, ProjectStatus, ProjectActivity, mockProjects, projectStatuses } from "@/data/projects";
import { useToast } from "@/hooks/use-toast";
import { useRole } from "@/contexts/RoleContext";

export default function Projects() {
  const { toast } = useToast();
  const { currentUser } = useRole();
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [viewMode, setViewMode] = useState<ProjectViewMode>('board');
  const [searchQuery, setSearchQuery] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<ProjectFiltersState>({
    priorities: [],
    statuses: [],
    assignees: [],
  });
  
  // Create dialog state
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createDialogStatus, setCreateDialogStatus] = useState<ProjectStatus>('todo');
  
  // Detail sheet state
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [detailSheetOpen, setDetailSheetOpen] = useState(false);

  // Timeline state
  const [timelineDate, setTimelineDate] = useState(new Date(2024, 10, 7));
  const [timelineGranularity, setTimelineGranularity] = useState<TimelineGranularity>('week');

  // Filter projects
  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!project.title.toLowerCase().includes(query) &&
            !project.description.toLowerCase().includes(query)) {
          return false;
        }
      }

      // Priority filter
      if (filters.priorities.length > 0 && !filters.priorities.includes(project.priority)) {
        return false;
      }

      // Status filter
      if (filters.statuses.length > 0 && !filters.statuses.includes(project.status)) {
        return false;
      }

      return true;
    });
  }, [projects, searchQuery, filters]);

  const handleAddProject = (status: ProjectStatus) => {
    setCreateDialogStatus(status);
    setCreateDialogOpen(true);
  };

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
    setDetailSheetOpen(true);
  };

  const handleProjectMove = (projectId: string, newStatus: ProjectStatus, insertIndex?: number) => {
    setProjects(prevProjects => {
      const project = prevProjects.find(p => p.id === projectId);
      if (!project) return prevProjects;
      
      const oldStatus = project.status;
      
      // Create status change activity if status changed
      const newActivities = oldStatus !== newStatus 
        ? [
            ...project.activities,
            {
              id: `${projectId}-act-${Date.now()}`,
              projectId,
              type: 'status_change' as const,
              userId: currentUser.id,
              oldStatus,
              newStatus,
              timestamp: new Date(),
            },
          ]
        : project.activities;
      
      // Update project status
      const updatedProject = { 
        ...project, 
        status: newStatus, 
        activities: newActivities,
        updatedAt: new Date() 
      };
      
      // Remove from old position
      let newProjects = prevProjects.filter(p => p.id !== projectId);
      
      // Get projects in the target status (maintaining their current order)
      const targetStatusProjects = newProjects.filter(p => p.status === newStatus);
      const otherProjects = newProjects.filter(p => p.status !== newStatus);
      
      // Insert at specified index or at end
      if (insertIndex !== undefined && insertIndex <= targetStatusProjects.length) {
        targetStatusProjects.splice(insertIndex, 0, updatedProject);
      } else {
        targetStatusProjects.push(updatedProject);
      }
      
      const result = [...otherProjects, ...targetStatusProjects];
      
      // Show toast if status changed
      if (oldStatus !== newStatus) {
        toast({
          title: "Project moved",
          description: `Moved to ${projectStatuses[newStatus].label}`,
        });
      }
      
      return result;
    });
  };

  const handleAddComment = (projectId: string, comment: string) => {
    const newActivity: ProjectActivity = {
      id: `${projectId}-act-${Date.now()}`,
      projectId,
      type: 'comment',
      userId: currentUser.id,
      comment,
      timestamp: new Date(),
    };

    setProjects(prevProjects => 
      prevProjects.map(project => {
        if (project.id !== projectId) return project;
        
        const updatedProject = {
          ...project,
          activities: [...project.activities, newActivity],
          commentsCount: project.commentsCount + 1,
          updatedAt: new Date(),
        };
        
        // Update selected project immediately
        if (selectedProject?.id === projectId) {
          setSelectedProject(updatedProject);
        }
        
        return updatedProject;
      })
    );
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-[1600px] mx-auto space-y-6">
            {/* Header */}
            <ProjectsHeader />

            {/* View Tabs */}
            <ProjectViewTabs viewMode={viewMode} onViewModeChange={setViewMode} />

            {/* Toolbar */}
            <ProjectFilters
              open={filtersOpen}
              onOpenChange={setFiltersOpen}
              filters={filters}
              onFiltersChange={setFilters}
            >
              <div>
                <ProjectsToolbar
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  onFilterClick={() => setFiltersOpen(true)}
                />
              </div>
            </ProjectFilters>

            {/* View Content */}
            <div className="mt-6">
              {viewMode === 'board' && (
                <BoardView
                  projects={filteredProjects}
                  onAddProject={handleAddProject}
                  onProjectClick={handleProjectClick}
                  onProjectMove={handleProjectMove}
                />
              )}
              {viewMode === 'list' && (
                <ListView
                  projects={filteredProjects}
                  onAddProject={handleAddProject}
                  onProjectClick={handleProjectClick}
                />
              )}
              {viewMode === 'timeline' && (
                <TimelineView
                  projects={filteredProjects}
                  currentDate={timelineDate}
                  granularity={timelineGranularity}
                  onDateChange={setTimelineDate}
                  onGranularityChange={setTimelineGranularity}
                  onProjectClick={handleProjectClick}
                />
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Dialogs and Sheets */}
      <CreateProjectDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        defaultStatus={createDialogStatus}
      />
      <ProjectDetailSheet
        project={selectedProject}
        open={detailSheetOpen}
        onOpenChange={setDetailSheetOpen}
        onAddComment={handleAddComment}
      />
    </div>
  );
}