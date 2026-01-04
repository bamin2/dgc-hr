import { useState } from "react";
import { cn } from "@/lib/utils";
import { OnboardingTask, TaskCategory } from "@/data/onboarding";
import { TaskStatusBadge } from "./TaskStatusBadge";
import { AssigneeBadge } from "./AssigneeBadge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  FileText,
  GraduationCap,
  Settings,
  Users,
  Shield,
  Calendar,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

interface OnboardingTaskListProps {
  tasks: OnboardingTask[];
  onTaskToggle?: (taskId: string, completed: boolean) => void;
}

const categoryConfig: Record<TaskCategory, { label: string; icon: React.ElementType; color: string }> = {
  documentation: {
    label: "Documentation",
    icon: FileText,
    color: "text-blue-600 dark:text-blue-400",
  },
  training: {
    label: "Training",
    icon: GraduationCap,
    color: "text-purple-600 dark:text-purple-400",
  },
  setup: {
    label: "Setup",
    icon: Settings,
    color: "text-orange-600 dark:text-orange-400",
  },
  introduction: {
    label: "Introduction",
    icon: Users,
    color: "text-green-600 dark:text-green-400",
  },
  compliance: {
    label: "Compliance",
    icon: Shield,
    color: "text-red-600 dark:text-red-400",
  },
};

export function OnboardingTaskList({ tasks, onTaskToggle }: OnboardingTaskListProps) {
  const [expandedTask, setExpandedTask] = useState<string | null>(null);

  // Group tasks by category
  const tasksByCategory = tasks.reduce((acc, task) => {
    if (!acc[task.category]) {
      acc[task.category] = [];
    }
    acc[task.category].push(task);
    return acc;
  }, {} as Record<TaskCategory, OnboardingTask[]>);

  const categories = Object.keys(tasksByCategory) as TaskCategory[];

  const getCategoryProgress = (categoryTasks: OnboardingTask[]) => {
    const completed = categoryTasks.filter((t) => t.status === "completed").length;
    return Math.round((completed / categoryTasks.length) * 100);
  };

  return (
    <Accordion type="multiple" defaultValue={categories} className="space-y-3">
      {categories.map((category) => {
        const config = categoryConfig[category];
        const categoryTasks = tasksByCategory[category];
        const progress = getCategoryProgress(categoryTasks);
        const completedCount = categoryTasks.filter((t) => t.status === "completed").length;
        const Icon = config.icon;

        return (
          <AccordionItem
            key={category}
            value={category}
            className="border rounded-lg bg-card overflow-hidden"
          >
            <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/50">
              <div className="flex items-center justify-between w-full pr-2">
                <div className="flex items-center gap-3">
                  <div className={cn("p-2 rounded-lg bg-muted", config.color)}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <h4 className="font-medium text-sm">{config.label}</h4>
                    <p className="text-xs text-muted-foreground">
                      {completedCount} of {categoryTasks.length} tasks completed
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-24">
                    <Progress value={progress} className="h-2" />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground w-10">
                    {progress}%
                  </span>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="space-y-2 pt-2">
                {categoryTasks
                  .sort((a, b) => a.order - b.order)
                  .map((task) => (
                    <div
                      key={task.id}
                      className={cn(
                        "rounded-lg border p-3 transition-all cursor-pointer",
                        task.status === "completed" && "bg-muted/30",
                        expandedTask === task.id && "ring-1 ring-primary/50"
                      )}
                      onClick={() =>
                        setExpandedTask(expandedTask === task.id ? null : task.id)
                      }
                    >
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={task.status === "completed"}
                          onCheckedChange={(checked) => {
                            onTaskToggle?.(task.id, checked as boolean);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="mt-0.5"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={cn(
                                "font-medium text-sm",
                                task.status === "completed" &&
                                  "line-through text-muted-foreground"
                              )}
                            >
                              {task.title}
                            </span>
                            {task.required && (
                              <span className="text-destructive text-xs">*</span>
                            )}
                          </div>
                          
                          {expandedTask === task.id && (
                            <p className="text-sm text-muted-foreground mt-2">
                              {task.description}
                            </p>
                          )}

                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <AssigneeBadge assignee={task.assignedTo} />
                            <TaskStatusBadge status={task.status} />
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Calendar className="w-3 h-3" />
                              {task.dueDate}
                            </span>
                          </div>

                          {task.status === "completed" && task.completedAt && (
                            <div className="flex items-center gap-1 mt-2 text-xs text-green-600 dark:text-green-400">
                              <CheckCircle2 className="w-3 h-3" />
                              Completed on {task.completedAt}
                              {task.completedBy && ` by ${task.completedBy}`}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
