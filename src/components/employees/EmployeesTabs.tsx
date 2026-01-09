import { useMemo } from "react";
import { Users, Building2, Archive } from "lucide-react";
import { cn } from "@/lib/utils";

export type EmployeesTabType = "directory" | "org-chart" | "former-employees";

interface Tab {
  id: EmployeesTabType;
  label: string;
  icon: React.ElementType;
}

interface EmployeesTabsProps {
  activeTab: EmployeesTabType;
  onTabChange: (tab: EmployeesTabType) => void;
  canViewFormerEmployees: boolean;
}

export function EmployeesTabs({
  activeTab,
  onTabChange,
  canViewFormerEmployees,
}: EmployeesTabsProps) {
  const tabs = useMemo(() => {
    const baseTabs: Tab[] = [
      { id: "directory", label: "People Directory", icon: Users },
      { id: "org-chart", label: "ORG Chart", icon: Building2 },
    ];

    if (canViewFormerEmployees) {
      baseTabs.push({ id: "former-employees", label: "Former Employees", icon: Archive });
    }

    return baseTabs;
  }, [canViewFormerEmployees]);

  return (
    <div className="border-b mb-6 overflow-x-auto">
      <div className="flex gap-4 sm:gap-6 min-w-max">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex items-center gap-2 pb-3 text-sm font-medium border-b-2 transition-colors",
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
