import { useState, useMemo } from "react";
import { Search, Pencil } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { OrgChartTree } from "./OrgChartTree";
import { OrgChartControls } from "./OrgChartControls";
import { OrgEmployee } from "./OrgChartNode";
import { toast } from "@/hooks/use-toast";

// Org chart data structure
const orgData: OrgEmployee = {
  id: "ceo",
  name: "Tahsan Khan",
  position: "CEO",
  department: "Founder",
  location: "Boston HQ",
  avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
  children: [
    {
      id: "eng-head",
      name: "Herry Kane",
      position: "VP Engineering",
      department: "Engineering",
      location: "Boston HQ",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      children: [
        {
          id: "eng-1",
          name: "Sarah Johnson",
          position: "Senior Developer",
          department: "Engineering",
          location: "Boston HQ",
          avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
        },
        {
          id: "eng-2",
          name: "David Martinez",
          position: "Backend Developer",
          department: "Engineering",
          location: "London Office",
          avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face",
        },
      ],
    },
    {
      id: "commercial-head",
      name: "Herry Brooks",
      position: "VP Commercial",
      department: "Commercial",
      location: "Boston HQ",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
      children: [
        {
          id: "marketing-head",
          name: "Azam Khan",
          position: "Marketing Director",
          department: "Marketing",
          location: "London Office",
          avatar: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=150&h=150&fit=crop&crop=face",
          children: [
            {
              id: "marketing-1",
              name: "James Wilson",
              position: "Marketing Specialist",
              department: "Marketing",
              location: "London Office",
              avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
            },
          ],
        },
        {
          id: "hr-head",
          name: "Tim David",
          position: "HR Director",
          department: "HR Management",
          location: "Boston HQ",
          avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
          children: [
            {
              id: "hr-1",
              name: "Jennifer Taylor",
              position: "HR Manager",
              department: "Human Resources",
              location: "Boston HQ",
              avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
            },
          ],
        },
      ],
    },
    {
      id: "finance-head",
      name: "David Warner",
      position: "VP Finance",
      department: "Finance",
      location: "Boston HQ",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      children: [
        {
          id: "finance-1",
          name: "Joe Root",
          position: "Account Executive",
          department: "Finance",
          location: "London Office",
          avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
          children: [
            {
              id: "finance-2",
              name: "Robert Brown",
              position: "Financial Analyst",
              department: "Finance",
              location: "Boston HQ",
              avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
            },
          ],
        },
      ],
    },
  ],
};

interface OrgChartProps {
  onView?: (employee: OrgEmployee) => void;
  onEdit?: (employee: OrgEmployee) => void;
}

export function OrgChart({ onView, onEdit }: OrgChartProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [zoom, setZoom] = useState(1);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.1, 1.5));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.1, 0.5));
  const handleReset = () => setZoom(1);

  const handleEditOrgChart = () => {
    toast({
      title: "Edit ORG Chart",
      description: "ORG Chart editing mode coming soon.",
    });
  };

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
