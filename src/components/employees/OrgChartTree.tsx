import { OrgChartNode, OrgEmployee } from "./OrgChartNode";

interface OrgChartTreeProps {
  employee: OrgEmployee;
  onView?: (employee: OrgEmployee) => void;
  onEdit?: (employee: OrgEmployee) => void;
}

export function OrgChartTree({ employee, onView, onEdit }: OrgChartTreeProps) {
  const hasChildren = employee.children && employee.children.length > 0;

  return (
    <div className="flex flex-col items-center">
      {/* Node */}
      <OrgChartNode employee={employee} onView={onView} onEdit={onEdit} />

      {/* Connector lines and children */}
      {hasChildren && (
        <>
          {/* Vertical line down from parent */}
          <div className="w-px h-8 bg-border" />

          {/* Horizontal connector bar */}
          {employee.children!.length > 1 && (
            <div
              className="h-px bg-border"
              style={{
                width: `${(employee.children!.length - 1) * 240}px`,
              }}
            />
          )}

          {/* Children row */}
          <div className="flex gap-10">
            {employee.children!.map((child, index) => (
              <div key={child.id} className="flex flex-col items-center">
                {/* Vertical line down to child */}
                <div className="w-px h-8 bg-border" />
                {/* Recursive child tree */}
                <OrgChartTree employee={child} onView={onView} onEdit={onEdit} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
