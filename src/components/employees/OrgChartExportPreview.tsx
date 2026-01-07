import { forwardRef } from "react";
import { OrgEmployee } from "./OrgChartNode";
import {
  ExportableOrgChartNode,
  CardVisibilitySettings,
} from "./ExportableOrgChartNode";

interface OrgChartExportPreviewProps {
  orgData: OrgEmployee | OrgEmployee[];
  visibility: CardVisibilitySettings;
}

interface TreeNodeProps {
  employee: OrgEmployee;
  visibility: CardVisibilitySettings;
}

function TreeNode({ employee, visibility }: TreeNodeProps) {
  const hasChildren = employee.children && employee.children.length > 0;

  return (
    <div className="flex flex-col items-center">
      <ExportableOrgChartNode employee={employee} visibility={visibility} />

      {hasChildren && (
        <>
          {/* Vertical connector from parent */}
          <div className="w-px h-6 bg-border" />

          {/* Children with connectors */}
          <div className="flex gap-4">
            {employee.children!.map((child, index) => (
              <div key={child.id} className="flex flex-col items-center">
                {/* Horizontal + vertical connector */}
                <div className="flex items-start w-full h-6">
                  {/* Left horizontal segment */}
                  <div
                    className={`h-px flex-1 min-w-[10px] ${
                      index === 0 ? "bg-transparent" : "bg-border"
                    }`}
                  />
                  {/* Vertical drop */}
                  <div className="w-px h-full bg-border" />
                  {/* Right horizontal segment */}
                  <div
                    className={`h-px flex-1 min-w-[10px] ${
                      index === employee.children!.length - 1
                        ? "bg-transparent"
                        : "bg-border"
                    }`}
                  />
                </div>
                {/* Recursive child tree */}
                <TreeNode employee={child} visibility={visibility} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export const OrgChartExportPreview = forwardRef<
  HTMLDivElement,
  OrgChartExportPreviewProps
>(({ orgData, visibility }, ref) => {
  const trees = Array.isArray(orgData) ? orgData : [orgData];

  return (
    <div
      ref={ref}
      className="p-6 bg-background min-w-max flex justify-center"
    >
      <div className="flex gap-16 items-start">
        {trees.map((tree) => (
          <TreeNode key={tree.id} employee={tree} visibility={visibility} />
        ))}
      </div>
    </div>
  );
});

OrgChartExportPreview.displayName = "OrgChartExportPreview";
