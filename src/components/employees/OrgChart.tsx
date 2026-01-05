import { useState, useMemo, useRef } from "react";
import { Search, Pencil } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { OrgChartTree } from "./OrgChartTree";
import { OrgChartControls } from "./OrgChartControls";
import { OrgChartExportButton } from "./OrgChartExportButton";
import { OrgEmployee } from "./OrgChartNode";
import { Employee } from "@/hooks/useEmployees";
import { buildOrgTree, getAllDescendantIds, wouldCreateCircularReference } from "@/utils/orgHierarchy";
import { toast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface OrgChartProps {
  employees: Employee[];
  onView?: (employee: OrgEmployee) => void;
  onEdit?: (employee: OrgEmployee) => void;
  onReassign?: (employeeId: string, newManagerId: string) => void;
}

export function OrgChart({ employees, onView, onEdit, onReassign }: OrgChartProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [zoom, setZoom] = useState(1);
  const chartRef = useRef<HTMLDivElement>(null);

  // Drag and drop state
  const [draggedEmployeeId, setDraggedEmployeeId] = useState<string | null>(null);
  const [descendantIds, setDescendantIds] = useState<string[]>([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingReassignment, setPendingReassignment] = useState<{
    employeeId: string;
    employeeName: string;
    newManagerId: string;
    newManagerName: string;
  } | null>(null);

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

  const handleDragStart = (employee: OrgEmployee) => {
    setDraggedEmployeeId(employee.id);
    // Calculate all descendants of the dragged employee to prevent invalid drops
    const descendants = getAllDescendantIds(employees, employee.id);
    setDescendantIds(descendants);
  };

  const handleDragEnd = () => {
    setDraggedEmployeeId(null);
    setDescendantIds([]);
  };

  const handleDrop = (draggedEmployee: OrgEmployee, targetEmployee: OrgEmployee) => {
    const draggedId = draggedEmployee.id;
    const targetId = targetEmployee.id;

    // Validate the drop
    if (wouldCreateCircularReference(employees, draggedId, targetId)) {
      toast({
        title: "Invalid move",
        description: "Cannot move an employee to report to their subordinate.",
        variant: "destructive",
      });
      handleDragEnd();
      return;
    }

    // Find employee names for the confirmation dialog
    const draggedEmp = employees.find((e) => e.id === draggedId);
    const targetEmp = employees.find((e) => e.id === targetId);

    if (!draggedEmp || !targetEmp) {
      handleDragEnd();
      return;
    }

    // Show confirmation dialog
    setPendingReassignment({
      employeeId: draggedId,
      employeeName: `${draggedEmp.firstName} ${draggedEmp.lastName}`,
      newManagerId: targetId,
      newManagerName: `${targetEmp.firstName} ${targetEmp.lastName}`,
    });
    setShowConfirmDialog(true);
    handleDragEnd();
  };

  const handleConfirmReassignment = () => {
    if (pendingReassignment && onReassign) {
      onReassign(pendingReassignment.employeeId, pendingReassignment.newManagerId);
    }
    setShowConfirmDialog(false);
    setPendingReassignment(null);
  };

  const handleCancelReassignment = () => {
    setShowConfirmDialog(false);
    setPendingReassignment(null);
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
        <OrgChartExportButton employees={employees} />
        <Button variant="outline" onClick={handleEditOrgChart} className="gap-2">
          <Pencil className="h-4 w-4" />
          Edit ORG Chart
        </Button>
      </div>

      {/* Drag hint */}
      <p className="text-xs text-muted-foreground mb-2">
        Drag and drop employee cards to reassign their manager.
      </p>

      {/* Canvas */}
      <div
        className="relative flex-1 border rounded-lg overflow-auto min-h-[500px]"
        style={{
          backgroundImage: `radial-gradient(circle, hsl(var(--muted-foreground) / 0.2) 1px, transparent 1px)`,
          backgroundSize: "20px 20px",
        }}
      >
        <div
          ref={chartRef}
          className="p-8 min-w-max flex justify-center bg-background"
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: "top center",
          }}
        >
          <OrgChartTree
            employee={orgData}
            onView={onView}
            onEdit={onEdit}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDrop={handleDrop}
            draggedEmployeeId={draggedEmployeeId}
            descendantIds={descendantIds}
            isRoot={true}
          />
        </div>

        {/* Zoom Controls */}
        <OrgChartControls
          zoom={zoom}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onReset={handleReset}
        />
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Manager Reassignment</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingReassignment && (
                <>
                  Move <strong>{pendingReassignment.employeeName}</strong> to report to{" "}
                  <strong>{pendingReassignment.newManagerName}</strong>?
                  <br />
                  <br />
                  This will also move all their direct reports.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelReassignment}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmReassignment}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
