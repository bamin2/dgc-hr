import { GripVertical, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { employeeTableColumns, EmployeeTableColumnId } from "@/data/settings";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface ColumnCustomizerProps {
  visibleColumns: EmployeeTableColumnId[];
  onColumnsChange: (columns: EmployeeTableColumnId[]) => void;
  isSaving?: boolean;
}

interface SortableColumnItemProps {
  column: typeof employeeTableColumns[number];
  isChecked: boolean;
  onToggle: (checked: boolean) => void;
}

function SortableColumnItem({ column, isChecked, onToggle }: SortableColumnItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: column.id, disabled: column.required });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted"
    >
      <button
        type="button"
        className={`cursor-grab active:cursor-grabbing p-0.5 text-muted-foreground ${
          column.required ? "opacity-30 cursor-not-allowed" : ""
        }`}
        {...attributes}
        {...listeners}
        disabled={column.required}
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <label className="flex items-center gap-2 flex-1 cursor-pointer">
        <Checkbox
          checked={isChecked}
          disabled={column.required}
          onCheckedChange={(checked) => onToggle(checked as boolean)}
        />
        <span className="text-sm">{column.label}</span>
      </label>
    </div>
  );
}

export function ColumnCustomizer({
  visibleColumns,
  onColumnsChange,
  isSaving,
}: ColumnCustomizerProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Get all columns in order (visible ones first in their order, then hidden ones)
  const orderedColumns = [
    ...visibleColumns.map(id => employeeTableColumns.find(c => c.id === id)!),
    ...employeeTableColumns.filter(c => !visibleColumns.includes(c.id)),
  ];

  const handleToggleColumn = (columnId: EmployeeTableColumnId, checked: boolean) => {
    if (checked) {
      // Add column at the end of visible columns
      onColumnsChange([...visibleColumns, columnId]);
    } else {
      onColumnsChange(visibleColumns.filter(id => id !== columnId));
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = visibleColumns.indexOf(active.id as EmployeeTableColumnId);
      const newIndex = visibleColumns.indexOf(over.id as EmployeeTableColumnId);

      // Only reorder if both items are visible
      if (oldIndex !== -1 && newIndex !== -1) {
        const newOrder = arrayMove(visibleColumns, oldIndex, newIndex);
        onColumnsChange(newOrder);
      }
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2" disabled={isSaving}>
          <Settings2 className="h-4 w-4" />
          Columns
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52 p-2">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={orderedColumns.map(c => c.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-1">
              {orderedColumns.map((column) => (
                <SortableColumnItem
                  key={column.id}
                  column={column}
                  isChecked={visibleColumns.includes(column.id)}
                  onToggle={(checked) => handleToggleColumn(column.id, checked)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
