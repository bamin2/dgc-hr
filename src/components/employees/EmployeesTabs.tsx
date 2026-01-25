import { useMemo } from "react";
import { Users, Building2, Archive } from "lucide-react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";

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
    <div className="mb-6">
      <TabsList>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              data-state={activeTab === tab.id ? "active" : "inactive"}
              onClick={() => onTabChange(tab.id)}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </TabsTrigger>
          );
        })}
      </TabsList>
    </div>
  );
}
