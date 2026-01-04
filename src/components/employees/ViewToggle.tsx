import { LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ViewToggleProps {
  view: 'table' | 'grid';
  onViewChange: (view: 'table' | 'grid') => void;
}

export function ViewToggle({ view, onViewChange }: ViewToggleProps) {
  return (
    <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "h-8 w-8 p-0",
          view === 'table' && "bg-background shadow-sm"
        )}
        onClick={() => onViewChange('table')}
      >
        <List className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "h-8 w-8 p-0",
          view === 'grid' && "bg-background shadow-sm"
        )}
        onClick={() => onViewChange('grid')}
      >
        <LayoutGrid className="h-4 w-4" />
      </Button>
    </div>
  );
}
