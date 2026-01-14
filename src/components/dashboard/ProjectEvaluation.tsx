import { MoreHorizontal } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useProjects, ProjectStatus } from "@/hooks/useProjects";
import { useEmployees } from "@/hooks/useEmployees";
import { format } from "date-fns";

const statusStyles: Record<string, string> = {
  in_progress: "bg-info/10 text-info border-info/20",
  todo: "bg-muted/10 text-muted-foreground border-muted/20",
  need_review: "bg-warning/10 text-warning border-warning/20",
  done: "bg-success/10 text-success border-success/20",
};

const statusLabels: Record<string, string> = {
  in_progress: "In Progress",
  todo: "To Do",
  need_review: "Need Review",
  done: "Completed",
};

export function ProjectEvaluation() {
  const { projects, isLoading } = useProjects();
  const { data: employees } = useEmployees();

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Skeleton className="h-6 w-36 mb-1" />
            <Skeleton className="h-4 w-28" />
          </div>
          <Skeleton className="w-8 h-8 rounded" />
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-4 rounded-xl bg-secondary/30">
              <Skeleton className="h-5 w-40 mb-2" />
              <Skeleton className="h-4 w-24 mb-3" />
              <div className="flex items-center justify-between">
                <div className="flex -space-x-2">
                  {[...Array(3)].map((_, j) => (
                    <Skeleton key={j} className="w-7 h-7 rounded-full" />
                  ))}
                </div>
                <Skeleton className="h-2 w-24 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  // Get top 3 most recent projects
  const displayProjects = projects.slice(0, 3);

  // Get employee avatars for assignees
  const getEmployeeAvatar = (employeeId: string) => {
    const employee = (employees || []).find(e => e.id === employeeId);
    return employee?.avatar_url || null;
  };

  const getEmployeeInitials = (employeeId: string) => {
    const employee = (employees || []).find(e => e.id === employeeId);
    if (!employee) return '??';
    return `${employee.first_name?.[0] || ''}${employee.last_name?.[0] || ''}`;
  };

  // Calculate progress based on status
  const getProgress = (status: ProjectStatus) => {
    switch (status) {
      case 'done': return 100;
      case 'need_review': return 80;
      case 'in_progress': return 50;
      case 'todo': return 0;
      default: return 0;
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            Project Evaluation
          </h3>
          <p className="text-sm text-muted-foreground">
            Current HR initiatives
          </p>
        </div>
        <Button variant="ghost" size="icon" className="text-muted-foreground">
          <MoreHorizontal className="w-5 h-5" />
        </Button>
      </div>

      <div className="space-y-4">
        {displayProjects.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">
            No projects found
          </p>
        ) : (
          displayProjects.map((project) => {
            const progress = getProgress(project.status);
            
            return (
              <div
                key={project.id}
                className="p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground mb-1">
                      {project.title}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Due: {format(project.dueDate, 'MMM dd')}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs font-medium",
                      statusStyles[project.status] || statusStyles.todo
                    )}
                  >
                    {statusLabels[project.status] || project.status}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  {/* Team Avatars */}
                  <div className="flex -space-x-2">
                    {project.assigneeIds.slice(0, 4).map((assigneeId, i) => (
                      <Avatar
                        key={assigneeId}
                        className="w-7 h-7 border-2 border-card"
                      >
                        <AvatarImage src={getEmployeeAvatar(assigneeId) || undefined} />
                        <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                          {getEmployeeInitials(assigneeId)}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                    {project.assigneeIds.length > 4 && (
                      <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-medium border-2 border-card">
                        +{project.assigneeIds.length - 4}
                      </div>
                    )}
                    {project.assigneeIds.length === 0 && (
                      <span className="text-xs text-muted-foreground">No assignees</span>
                    )}
                  </div>

                  {/* Progress Bar */}
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all",
                          project.status === "done"
                            ? "bg-success"
                            : project.status === "in_progress"
                            ? "bg-primary"
                            : "bg-warning"
                        )}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">
                      {progress}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
}
