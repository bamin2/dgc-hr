import { MoreHorizontal, Plus, Pencil, Eye } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";

export interface OrgEmployee {
  id: string;
  name: string;
  position: string;
  department: string;
  location: string;
  avatar: string;
  children?: OrgEmployee[];
}

interface OrgChartNodeProps {
  employee: OrgEmployee;
  onView?: (employee: OrgEmployee) => void;
  onEdit?: (employee: OrgEmployee) => void;
}

export function OrgChartNode({ employee, onView, onEdit }: OrgChartNodeProps) {
  const initials = employee.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();

  const handleAddReport = () => {
    toast({
      title: "Add Direct Report",
      description: `Add a new direct report under ${employee.name}`,
    });
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent navigation when clicking on interactive elements
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('[role="menu"]')) {
      return;
    }
    onView?.(employee);
  };

  return (
    <div className="relative flex flex-col items-center">
      <div 
        onClick={handleCardClick}
        className="relative bg-card border border-dashed border-border rounded-lg p-4 w-[200px] text-center shadow-sm cursor-pointer hover:border-primary/50 hover:shadow-md transition-all"
      >
        {/* More Options Menu */}
        <div className="absolute top-2 right-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm">
                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView?.(employee)}>
                <Eye className="h-4 w-4 mr-2" />
                View Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit?.(employee)}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Avatar */}
        <Avatar className="h-12 w-12 mx-auto mb-3">
          <AvatarImage src={employee.avatar} alt={employee.name} />
          <AvatarFallback className="bg-muted text-muted-foreground">
            {initials}
          </AvatarFallback>
        </Avatar>

        {/* Info */}
        <h4 className="font-medium text-sm text-foreground truncate">
          {employee.name}
        </h4>
        <p className="text-xs text-muted-foreground truncate mt-0.5">
          {employee.department}
        </p>
        <p className="text-xs text-muted-foreground/70 truncate mt-0.5">
          {employee.location}
        </p>

        {/* Add Button */}
        <button
          onClick={handleAddReport}
          className="absolute -bottom-3 left-1/2 -translate-x-1/2 h-6 w-6 bg-emerald-500 hover:bg-emerald-600 rounded-full flex items-center justify-center transition-colors shadow-sm"
        >
          <Plus className="h-3.5 w-3.5 text-white" />
        </button>
      </div>
    </div>
  );
}
