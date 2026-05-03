import { useState } from "react";
import { ChevronDown, ChevronRight, FileText, GraduationCap, Settings, Users, Shield } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { TaskCategory, TaskAssignee } from "@/hooks/useOnboarding";
import { AssigneeBadge } from "../AssigneeBadge";
import { cn } from "@/lib/utils";

// Local task interface for TaskCustomizeStep
interface LocalTask {
  id: string;
  title: string;
  description: string;
  category: TaskCategory;
  dueDate: string;
  assignedTo: TaskAssignee;
  status: "pending" | "in_progress" | "completed" | "skipped";
  completedAt: string | null;
  completedBy: string | null;
  required: boolean;
  order: number;
}

interface TaskCustomizeStepProps {
  tasks: LocalTask[];
  onChange: (tasks: LocalTask[]) => void;
}

const categoryConfig: Record<TaskCategory, { label: string; icon: React.ComponentType<{ className?: string }>; color: string }> = {
  documentation: { label: "Documentation", icon: FileText, color: "text-teal-600" },
  training: { label: "Training", icon: GraduationCap, color: "text-amber-600" },
  setup: { label: "Setup", icon: Settings, color: "text-orange-600" },
  introduction: { label: "Introduction", icon: Users, color: "text-green-600" },
  compliance: { label: "Compliance", icon: Shield, color: "text-red-600" },
};

export function TaskCustomizeStep({ tasks, onChange }: TaskCustomizeStepProps) {
  const [openCategories, setOpenCategories] = useState<TaskCategory[]>(
    Object.keys(categoryConfig) as TaskCategory[]
  );

  const tasksByCategory = tasks.reduce(
    (acc, task) => {
      if (!acc[task.category]) {
        acc[task.category] = [];
      }
      acc[task.category].push(task);
      return acc;
    },
    {} as Record<TaskCategory, LocalTask[]>
  );

  const toggleCategory = (category: TaskCategory) => {
    setOpenCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const toggleTask = (taskId: string) => {
    onChange(
      tasks.map((task) =>
        task.id === taskId
          ? { ...task, status: task.status === "skipped" ? "pending" : "skipped" }
          : task
      )
    );
  };

  const enableAll = () => {
    onChange(tasks.map((task) => ({ ...task, status: "pending" })));
  };

  const disableOptional = () => {
    onChange(
      tasks.map((task) => ({
        ...task,
        status: task.required ? "pending" : "skipped",
      }))
    );
  };

  const enabledCount = tasks.filter((t) => t.status !== "skipped").length;
  const requiredCount = tasks.filter((t) => t.required).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-1">Customize Tasks</h2>
          <p className="text-muted-foreground">
            Enable or disable tasks for this onboarding. Required tasks cannot be disabled.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={enableAll}>
            Enable All
          </Button>
          <Button variant="outline" size="sm" onClick={disableOptional}>
            Required Only
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4 text-sm">
        <Badge variant="secondary">
          {enabledCount} of {tasks.length} tasks enabled
        </Badge>
        <Badge variant="outline" className="text-amber-600 border-amber-600">
          {requiredCount} required
        </Badge>
      </div>

      <div className="space-y-3">
        {(Object.keys(categoryConfig) as TaskCategory[]).map((category) => {
          const config = categoryConfig[category];
          const categoryTasks = tasksByCategory[category] || [];
          if (categoryTasks.length === 0) return null;

          const Icon = config.icon;
          const enabledInCategory = categoryTasks.filter((t) => t.status !== "skipped").length;
          const isOpen = openCategories.includes(category);

          return (
            <Card key={category}>
              <Collapsible open={isOpen} onOpenChange={() => toggleCategory(category)}>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors py-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {isOpen ? (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        )}
                        <Icon className={cn("h-5 w-5", config.color)} />
                        <CardTitle className="text-base">{config.label}</CardTitle>
                      </div>
                      <Badge variant="secondary">
                        {enabledInCategory} / {categoryTasks.length}
                      </Badge>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="pt-0 pb-4">
                    <div className="space-y-2">
                      {categoryTasks.map((task) => {
                        const isEnabled = task.status !== "skipped";
                        return (
                          <div
                            key={task.id}
                            className={cn(
                              "flex items-center gap-3 p-3 rounded-lg border transition-colors",
                              isEnabled ? "bg-background" : "bg-muted/50 opacity-60"
                            )}
                          >
                            <Checkbox
                              checked={isEnabled}
                              disabled={task.required}
                              onCheckedChange={() => toggleTask(task.id)}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className={cn(
                                  "font-medium text-sm",
                                  !isEnabled && "line-through text-muted-foreground"
                                )}>
                                  {task.title}
                                </span>
                                {task.required && (
                                  <Badge variant="outline" className="text-xs text-amber-600 border-amber-600">
                                    Required
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground truncate">
                                {task.description}
                              </p>
                            </div>
                            <AssigneeBadge assignee={task.assignedTo} />
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
