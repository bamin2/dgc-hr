import { useState } from "react";
import { GripVertical, MoreHorizontal, Plus, Pencil, Eye } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";
import { OrgEmployee } from "./OrgChartNode";
import { cn } from "@/lib/utils";

interface DraggableOrgNodeProps {
  employee: OrgEmployee;
  onView?: (employee: OrgEmployee) => void;
  onEdit?: (employee: OrgEmployee) => void;
  onDragStart?: (employee: OrgEmployee) => void;
  onDragEnd?: () => void;
  onDrop?: (draggedEmployee: OrgEmployee, targetEmployee: OrgEmployee) => void;
  isDragging?: boolean;
  isDropTarget?: boolean;
  isValidDropTarget?: boolean;
  draggedEmployeeId?: string | null;
  canDrag?: boolean;
}

export function DraggableOrgNode({
  employee,
  onView,
  onEdit,
  onDragStart,
  onDragEnd,
  onDrop,
  isDragging,
  isDropTarget,
  isValidDropTarget,
  draggedEmployeeId,
  canDrag = true,
}: DraggableOrgNodeProps) {
  const [isHovering, setIsHovering] = useState(false);

  const initials = employee.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const handleAddReport = () => {
    toast({
      title: "Add Direct Report",
      description: `Add a new direct report under ${employee.name}`,
    });
  };

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest("button") || target.closest('[role="menu"]')) {
      return;
    }
    onView?.(employee);
  };

  const handleDragStart = (e: React.DragEvent) => {
    if (!canDrag) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData("text/plain", employee.id);
    e.dataTransfer.effectAllowed = "move";
    onDragStart?.(employee);
  };

  const handleDragEnd = () => {
    onDragEnd?.();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (draggedEmployeeId && draggedEmployeeId !== employee.id && isValidDropTarget) {
      e.dataTransfer.dropEffect = "move";
    } else {
      e.dataTransfer.dropEffect = "none";
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setIsHovering(true);
  };

  const handleDragLeave = () => {
    setIsHovering(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsHovering(false);
    
    if (isValidDropTarget && onDrop && draggedEmployeeId) {
      // The parent component will handle finding the dragged employee
      onDrop({ id: draggedEmployeeId } as OrgEmployee, employee);
    }
  };

  const showDropIndicator = isHovering && draggedEmployeeId && draggedEmployeeId !== employee.id;

  return (
    <div className="relative flex flex-col items-center">
      <div
        draggable={canDrag}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleCardClick}
        className={cn(
          "relative bg-card border rounded-lg p-4 w-[200px] text-center shadow-sm transition-all",
          canDrag ? "cursor-grab active:cursor-grabbing" : "cursor-pointer",
          isDragging && "opacity-50 scale-95",
          !isDragging && "hover:border-primary/50 hover:shadow-md",
          showDropIndicator && isValidDropTarget && "border-emerald-500 border-2 bg-emerald-50 dark:bg-emerald-950/30",
          showDropIndicator && !isValidDropTarget && "border-destructive border-2 bg-destructive/10",
          !showDropIndicator && "border-dashed border-border"
        )}
      >
        {/* Drag Handle */}
        {canDrag && (
          <div className="absolute top-2 left-2">
            <GripVertical className="h-4 w-4 text-muted-foreground/50" />
          </div>
        )}

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
