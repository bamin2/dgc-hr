import { Briefcase, Code, TrendingUp, Globe, Crown, Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TaskCategory } from "@/hooks/useOnboarding";
import { cn } from "@/lib/utils";

// Template interface for WorkflowSelectStep compatibility
interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  estimatedDays: number;
  categories: TaskCategory[];
  tasks: { id: string; title: string; description: string; category: TaskCategory; dueDate: string; assignedTo: string; required: boolean; order: number }[];
}

interface WorkflowSelectStepProps {
  templates: WorkflowTemplate[];
  selectedTemplateId: string | null;
  onSelect: (template: WorkflowTemplate) => void;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Briefcase,
  Code,
  TrendingUp,
  Globe,
  Crown,
};

const categoryColors: Record<TaskCategory, string> = {
  documentation: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  training: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  setup: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  introduction: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  compliance: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

export function WorkflowSelectStep({
  templates,
  selectedTemplateId,
  onSelect,
}: WorkflowSelectStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-1">Select Workflow Template</h2>
        <p className="text-muted-foreground">
          Choose a pre-built onboarding workflow that best fits the role.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => {
          const Icon = iconMap[template.icon] || Briefcase;
          const isSelected = selectedTemplateId === template.id;

          return (
            <Card
              key={template.id}
              className={cn(
                "cursor-pointer transition-all hover:shadow-md",
                isSelected
                  ? "ring-2 ring-primary border-primary"
                  : "hover:border-primary/50"
              )}
              onClick={() => onSelect(template)}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className={cn(
                    "p-2 rounded-lg",
                    isSelected ? "bg-primary text-primary-foreground" : "bg-muted"
                  )}>
                    <Icon className="h-5 w-5" />
                  </div>
                  {isSelected && (
                    <div className="bg-primary text-primary-foreground rounded-full p-1">
                      <Check className="h-4 w-4" />
                    </div>
                  )}
                </div>

                <h3 className="font-semibold text-foreground mb-1">{template.name}</h3>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {template.description}
                </p>

                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                  <span>{template.tasks.length} tasks</span>
                  <span>•</span>
                  <span>{template.estimatedDays} days</span>
                </div>

                <div className="flex flex-wrap gap-1">
                  {template.categories.map((category) => (
                    <Badge
                      key={category}
                      variant="secondary"
                      className={cn("text-xs capitalize", categoryColors[category])}
                    >
                      {category}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
