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
import { Project, ProjectStatus, mockProjects } from "@/data/projects";

export default function Projects() {
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
    return mockProjects.filter(project => {
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
  }, [searchQuery, filters]);

  const handleAddProject = (status: ProjectStatus) => {
    setCreateDialogStatus(status);
    setCreateDialogOpen(true);
  };

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
    setDetailSheetOpen(true);
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
      />
    </div>
  );
}
