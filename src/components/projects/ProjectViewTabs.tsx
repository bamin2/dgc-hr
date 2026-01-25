import { LayoutGrid, List, GanttChart } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export type ProjectViewMode = 'board' | 'list' | 'timeline';

interface ProjectViewTabsProps {
  viewMode: ProjectViewMode;
  onViewModeChange: (mode: ProjectViewMode) => void;
}

const viewModes: { id: ProjectViewMode; label: string; icon: React.ElementType }[] = [
  { id: 'board', label: 'Board', icon: LayoutGrid },
  { id: 'list', label: 'List', icon: List },
  { id: 'timeline', label: 'Timeline', icon: GanttChart },
];

export function ProjectViewTabs({ viewMode, onViewModeChange }: ProjectViewTabsProps) {
  return (
    <Tabs value={viewMode} onValueChange={(value) => onViewModeChange(value as ProjectViewMode)}>
      <TabsList>
        {viewModes.map((mode) => {
          const Icon = mode.icon;
          return (
            <TabsTrigger key={mode.id} value={mode.id}>
              <Icon className="h-4 w-4" />
              {mode.label}
            </TabsTrigger>
          );
        })}
      </TabsList>
    </Tabs>
  );
}
