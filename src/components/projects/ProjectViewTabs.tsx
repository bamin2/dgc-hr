import { LayoutGrid, List, GanttChart } from "lucide-react";
import { cn } from "@/lib/utils";

export type ProjectViewMode = 'board' | 'list' | 'timeline';

interface ProjectViewTabsProps {
  viewMode: ProjectViewMode;
  onViewModeChange: (mode: ProjectViewMode) => void;
}

const viewModes: { id: ProjectViewMode; label: string; icon: React.ReactNode }[] = [
  { id: 'board', label: 'Board', icon: <LayoutGrid className="h-4 w-4" /> },
  { id: 'list', label: 'List', icon: <List className="h-4 w-4" /> },
  { id: 'timeline', label: 'Timeline', icon: <GanttChart className="h-4 w-4" /> },
];

export function ProjectViewTabs({ viewMode, onViewModeChange }: ProjectViewTabsProps) {
  return (
    <div className="flex items-center gap-1 border-b border-border">
      {viewModes.map((mode) => (
        <button
          key={mode.id}
          onClick={() => onViewModeChange(mode.id)}
          className={cn(
            "flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors",
            "border-b-2 -mb-px",
            viewMode === mode.id
              ? "text-primary border-primary"
              : "text-muted-foreground border-transparent hover:text-foreground"
          )}
        >
          {mode.icon}
          {mode.label}
        </button>
      ))}
    </div>
  );
}
