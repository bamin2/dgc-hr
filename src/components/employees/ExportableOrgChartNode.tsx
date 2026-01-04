import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { OrgEmployee } from "./OrgChartNode";

export interface CardVisibilitySettings {
  showAvatar: boolean;
  showPosition: boolean;
  showDepartment: boolean;
  showLocation: boolean;
}

interface ExportableOrgChartNodeProps {
  employee: OrgEmployee;
  visibility: CardVisibilitySettings;
}

export function ExportableOrgChartNode({
  employee,
  visibility,
}: ExportableOrgChartNodeProps) {
  const initials = employee.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const hasDetails =
    visibility.showPosition ||
    visibility.showDepartment ||
    visibility.showLocation;

  return (
    <div className="relative flex flex-col items-center">
      <div
        className={`relative bg-card border border-border rounded-lg p-3 w-[180px] text-center shadow-sm ${
          !visibility.showAvatar && !hasDetails ? "py-2" : ""
        }`}
      >
        {/* Avatar */}
        {visibility.showAvatar && (
          <Avatar className="h-10 w-10 mx-auto mb-2">
            <AvatarImage src={employee.avatar} alt={employee.name} />
            <AvatarFallback className="bg-muted text-muted-foreground text-xs">
              {initials}
            </AvatarFallback>
          </Avatar>
        )}

        {/* Name - always shown */}
        <h4 className="font-medium text-sm text-foreground truncate">
          {employee.name}
        </h4>

        {/* Position */}
        {visibility.showPosition && (
          <p className="text-xs text-primary truncate mt-0.5">
            {employee.position}
          </p>
        )}

        {/* Department */}
        {visibility.showDepartment && (
          <p className="text-xs text-muted-foreground truncate mt-0.5">
            {employee.department}
          </p>
        )}

        {/* Location */}
        {visibility.showLocation && (
          <p className="text-xs text-muted-foreground/70 truncate mt-0.5">
            {employee.location}
          </p>
        )}
      </div>
    </div>
  );
}
