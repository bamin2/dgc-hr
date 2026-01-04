import { Search, SlidersHorizontal, Settings2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ProjectsToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onFilterClick: () => void;
}

export function ProjectsToolbar({ searchQuery, onSearchChange, onFilterClick }: ProjectsToolbarProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" className="gap-2" onClick={onFilterClick}>
          <SlidersHorizontal className="h-4 w-4" />
          Filter
        </Button>
        <Button variant="outline" className="gap-2">
          <Settings2 className="h-4 w-4" />
          Customize
        </Button>
      </div>
    </div>
  );
}
