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

          {/* Children with connectors */}
          <div className="flex">
            {employee.children!.map((child, index) => (
              <div key={child.id} className="flex flex-col items-center">
                {/* Horizontal + vertical connector */}
                <div className="flex w-full h-8">
                  {/* Left horizontal segment */}
                  <div
                    className={`h-px flex-1 ${
                      index === 0 ? "bg-transparent" : "bg-border"
                    }`}
                  />
                  {/* Vertical drop */}
                  <div className="w-px h-full bg-border" />
                  {/* Right horizontal segment */}
                  <div
                    className={`h-px flex-1 ${
                      index === employee.children!.length - 1
                        ? "bg-transparent"
                        : "bg-border"
                    }`}
                  />
                </div>
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
