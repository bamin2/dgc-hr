import { MoreHorizontal } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const projects = [
  {
    id: 1,
    title: "Q4 Performance Reviews",
    team: [
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=50",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50",
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50",
    ],
    status: "In Progress",
    progress: 65,
    dueDate: "Dec 15",
  },
  {
    id: 2,
    title: "New Employee Onboarding",
    team: [
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50",
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=50",
    ],
    status: "Pending",
    progress: 30,
    dueDate: "Dec 20",
  },
  {
    id: 3,
    title: "Benefits Enrollment 2024",
    team: [
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50",
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=50",
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=50",
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=50",
    ],
    status: "Completed",
    progress: 100,
    dueDate: "Dec 01",
  },
];

const statusStyles = {
  "In Progress": "bg-info/10 text-info border-info/20",
  Pending: "bg-warning/10 text-warning border-warning/20",
  Completed: "bg-success/10 text-success border-success/20",
};

export function ProjectEvaluation() {
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
        {projects.map((project) => (
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
                  Due: {project.dueDate}
                </p>
              </div>
              <Badge
                variant="outline"
                className={cn(
                  "text-xs font-medium",
                  statusStyles[project.status as keyof typeof statusStyles]
                )}
              >
                {project.status}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              {/* Team Avatars */}
              <div className="flex -space-x-2">
                {project.team.slice(0, 4).map((avatar, i) => (
                  <Avatar
                    key={i}
                    className="w-7 h-7 border-2 border-card"
                  >
                    <AvatarImage src={avatar} />
                    <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                      T{i + 1}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {project.team.length > 4 && (
                  <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-medium border-2 border-card">
                    +{project.team.length - 4}
                  </div>
                )}
              </div>

              {/* Progress Bar */}
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      project.status === "Completed"
                        ? "bg-success"
                        : project.status === "In Progress"
                        ? "bg-primary"
                        : "bg-warning"
                    )}
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-muted-foreground">
                  {project.progress}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}