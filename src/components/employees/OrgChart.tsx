import { useState, useMemo } from "react";
import { Search, Pencil } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { OrgChartTree } from "./OrgChartTree";
import { OrgChartControls } from "./OrgChartControls";
import { OrgEmployee } from "./OrgChartNode";
import { Employee } from "@/data/employees";
import { buildOrgTree } from "@/utils/orgHierarchy";
import { toast } from "@/hooks/use-toast";

interface OrgChartProps {
  employees: Employee[];
  onView?: (employee: OrgEmployee) => void;
  onEdit?: (employee: OrgEmployee) => void;
}

export function OrgChart({ employees, onView, onEdit }: OrgChartProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [zoom, setZoom] = useState(1);

  // Build org tree from employees array
  const orgData = useMemo(() => buildOrgTree(employees), [employees]);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.1, 1.5));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.1, 0.5));
  const handleReset = () => setZoom(1);

  const handleEditOrgChart = () => {
    toast({
      title: "Edit ORG Chart",
      description: "ORG Chart editing mode coming soon.",
    });
  };

  if (!orgData) {
    return (
      <div className="flex items-center justify-center h-96 text-muted-foreground">
        No organizational data available. Add a CEO to get started.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search employee..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button variant="outline" onClick={handleEditOrgChart} className="gap-2">
          <Pencil className="h-4 w-4" />
          Edit ORG Chart
        </Button>
      </div>

      {/* Canvas */}
      <div
        className="relative flex-1 border rounded-lg overflow-auto min-h-[500px]"
        style={{
          backgroundImage: `radial-gradient(circle, hsl(var(--muted-foreground) / 0.2) 1px, transparent 1px)`,
          backgroundSize: "20px 20px",
        }}
      >
        <div
          className="p-8 min-w-max flex justify-center"
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: "top center",
          }}
        >
          <OrgChartTree employee={orgData} onView={onView} onEdit={onEdit} />
        </div>

        {/* Zoom Controls */}
        <OrgChartControls
          zoom={zoom}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onReset={handleReset}
        />
      </div>
    </div>
  );
}
