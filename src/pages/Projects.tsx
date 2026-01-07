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
import { useProjects, Project, ProjectStatus, projectStatuses } from "@/hooks/useProjects";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function Projects() {
  const { toast } = useToast();
  const { 
    projects, 
    isLoading, 
    updateProjectStatus, 
    addComment,
    deleteProject 
  } = useProjects();
  
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
  const [timelineDate, setTimelineDate] = useState(new Date());
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

  const handleProjectMove = async (projectId: string, newStatus: ProjectStatus) => {
    const project = projects.find(p => p.id === projectId);
    if (!project || project.status === newStatus) return;
    
    try {
      await updateProjectStatus({
        projectId,
        newStatus,
        oldStatus: project.status,
      });
      
      toast({
        title: "Project moved",
        description: `Moved to ${projectStatuses[newStatus].label}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to move project",
        variant: "destructive",
      });
    }
  };

  const handleAddComment = async (projectId: string, comment: string, mentionedUserIds: string[] = []) => {
    try {
      await addComment({
        projectId,
        comment,
        mentionedUserIds,
      });
      
      // Update selected project with new comment count
      if (selectedProject?.id === projectId) {
        const updatedProject = projects.find(p => p.id === projectId);
        if (updatedProject) {
          setSelectedProject(updatedProject);
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive",
      });
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      await deleteProject(projectId);
      setDetailSheetOpen(false);
      toast({
        title: "Project deleted",
        description: "The project has been removed.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete project",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex items-center justify-center min-w-0 overflow-hidden">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6">
          <div className="max-w-[1600px] mx-auto space-y-4 sm:space-y-6">
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
        onDelete={handleDeleteProject}
      />
    </div>
  );
}
