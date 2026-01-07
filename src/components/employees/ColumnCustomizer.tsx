import { Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { employeeTableColumns, EmployeeTableColumnId } from "@/data/settings";

interface ColumnCustomizerProps {
  visibleColumns: EmployeeTableColumnId[];
  onColumnsChange: (columns: EmployeeTableColumnId[]) => void;
  isSaving?: boolean;
}

export function ColumnCustomizer({
  visibleColumns,
  onColumnsChange,
  isSaving,
}: ColumnCustomizerProps) {
  const handleToggleColumn = (columnId: EmployeeTableColumnId, checked: boolean) => {
    if (checked) {
      // Add column in original order
      const orderedColumns = employeeTableColumns
        .map(col => col.id)
        .filter(id => visibleColumns.includes(id) || id === columnId);
      onColumnsChange(orderedColumns);
    } else {
      onColumnsChange(visibleColumns.filter(id => id !== columnId));
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
      <DropdownMenuContent align="end" className="w-48 p-2">
        <div className="space-y-2">
          {employeeTableColumns.map((column) => {
            const isChecked = visibleColumns.includes(column.id);
            const isDisabled = column.required;

            return (
              <label
                key={column.id}
                className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted cursor-pointer"
              >
                <Checkbox
                  checked={isChecked}
                  disabled={isDisabled}
                  onCheckedChange={(checked) =>
                    handleToggleColumn(column.id, checked as boolean)
                  }
                />
                <span className="text-sm">{column.label}</span>
              </label>
            );
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
