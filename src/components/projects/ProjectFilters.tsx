import { X } from "lucide-react";
import { ProjectPriority, ProjectStatus, projectStatuses, priorityConfig } from "@/data/projects";
import { mockEmployees } from "@/data/employees";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";

export interface ProjectFiltersState {
  priorities: ProjectPriority[];
  statuses: ProjectStatus[];
  assignees: string[];
}

interface ProjectFiltersProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: ProjectFiltersState;
  onFiltersChange: (filters: ProjectFiltersState) => void;
  children: React.ReactNode;
}

export function ProjectFilters({
  open,
  onOpenChange,
  filters,
  onFiltersChange,
  children,
}: ProjectFiltersProps) {
  const togglePriority = (priority: ProjectPriority) => {
    const newPriorities = filters.priorities.includes(priority)
      ? filters.priorities.filter(p => p !== priority)
      : [...filters.priorities, priority];
    onFiltersChange({ ...filters, priorities: newPriorities });
  };

  const toggleStatus = (status: ProjectStatus) => {
    const newStatuses = filters.statuses.includes(status)
      ? filters.statuses.filter(s => s !== status)
      : [...filters.statuses, status];
    onFiltersChange({ ...filters, statuses: newStatuses });
  };

  const clearFilters = () => {
    onFiltersChange({ priorities: [], statuses: [], assignees: [] });
  };

  const hasFilters = filters.priorities.length > 0 || filters.statuses.length > 0 || filters.assignees.length > 0;

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent className="w-72" align="end">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium text-sm">Filters</h4>
          {hasFilters && (
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={clearFilters}>
              Clear all
            </Button>
          )}
        </div>

        {/* Priority filters */}
        <div className="mb-4">
          <Label className="text-xs text-muted-foreground mb-2 block">Priority</Label>
          <div className="space-y-2">
            {(Object.keys(priorityConfig) as ProjectPriority[]).map((priority) => (
              <div key={priority} className="flex items-center gap-2">
                <Checkbox
                  id={`priority-${priority}`}
                  checked={filters.priorities.includes(priority)}
                  onCheckedChange={() => togglePriority(priority)}
                />
                <label
                  htmlFor={`priority-${priority}`}
                  className="text-sm cursor-pointer capitalize"
                >
                  {priority}
                </label>
              </div>
            ))}
          </div>
        </div>

        <Separator className="my-4" />

        {/* Status filters */}
        <div>
          <Label className="text-xs text-muted-foreground mb-2 block">Status</Label>
          <div className="space-y-2">
            {(Object.keys(projectStatuses) as ProjectStatus[]).map((status) => (
              <div key={status} className="flex items-center gap-2">
                <Checkbox
                  id={`status-${status}`}
                  checked={filters.statuses.includes(status)}
                  onCheckedChange={() => toggleStatus(status)}
                />
                <label
                  htmlFor={`status-${status}`}
                  className="text-sm cursor-pointer"
                >
                  {projectStatuses[status].label}
                </label>
              </div>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
