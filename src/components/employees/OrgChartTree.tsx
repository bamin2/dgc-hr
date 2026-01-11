import { DraggableOrgNode } from "./DraggableOrgNode";
import { OrgEmployee } from "./OrgChartNode";

interface OrgChartTreeProps {
  employee: OrgEmployee;
  onView?: (employee: OrgEmployee) => void;
  onEdit?: (employee: OrgEmployee) => void;
  onDragStart?: (employee: OrgEmployee) => void;
  onDragEnd?: () => void;
  onDrop?: (draggedEmployee: OrgEmployee, targetEmployee: OrgEmployee) => void;
  draggedEmployeeId?: string | null;
  descendantIds?: string[];
  isRoot?: boolean;
}

export function OrgChartTree({
  employee,
  onView,
  onEdit,
  onDragStart,
  onDragEnd,
  onDrop,
  draggedEmployeeId,
  descendantIds = [],
  isRoot = false,
}: OrgChartTreeProps) {
  const hasChildren = employee.children && employee.children.length > 0;

  // Determine if this node is a valid drop target
  // Cannot drop on self or on a descendant of the dragged node
  const isValidDropTarget =
    draggedEmployeeId !== null &&
    draggedEmployeeId !== employee.id &&
    !descendantIds.includes(employee.id);

  // CEO (root) cannot be dragged
  const canDrag = !isRoot;

  return (
    <div className="flex flex-col items-center">
      {/* Node */}
      <DraggableOrgNode
        employee={employee}
        onView={onView}
        onEdit={onEdit}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDrop={onDrop}
        isDragging={draggedEmployeeId === employee.id}
        isDropTarget={draggedEmployeeId !== null && draggedEmployeeId !== employee.id}
        isValidDropTarget={isValidDropTarget}
        draggedEmployeeId={draggedEmployeeId}
        canDrag={canDrag}
      />

      {/* Connector lines and children */}
      {hasChildren && (
        <>
          {/* Vertical line down from parent */}
          <div className="w-0.5 h-8 bg-muted-foreground/50" />

          {/* Children with connectors */}
          <div className="relative flex gap-6">
            {/* Single continuous horizontal line spanning from first to last child */}
            {employee.children!.length > 1 && (
              <div 
                className="absolute top-0 h-0.5 bg-muted-foreground/50"
                style={{
                  left: `calc(100% / ${employee.children!.length} / 2)`,
                  right: `calc(100% / ${employee.children!.length} / 2)`,
                }}
              />
            )}
            
            {employee.children!.map((child) => (
              <div key={child.id} className="flex flex-col items-center">
                {/* Vertical drop only */}
                <div className="w-0.5 h-8 bg-muted-foreground/50" />
                {/* Recursive child tree */}
                <OrgChartTree
                  employee={child}
                  onView={onView}
                  onEdit={onEdit}
                  onDragStart={onDragStart}
                  onDragEnd={onDragEnd}
                  onDrop={onDrop}
                  draggedEmployeeId={draggedEmployeeId}
                  descendantIds={descendantIds}
                  isRoot={false}
                />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
