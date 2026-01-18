import { useState, useMemo, useRef } from "react";
import { Download, Image, FileText, FileCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { toast } from "@/hooks/use-toast";
import { Employee } from "@/hooks/useEmployees";
import {
  buildOrgTreeFromEmployee,
  buildOrgTrees,
  getEmployeesWithReports,
} from "@/utils/orgHierarchy";
import { exportToPng, exportToPdf, exportToSvg } from "@/utils/orgChartExport";

const FULL_COMPANY_VALUE = "__full_company__";
import { OrgChartExportPreview } from "./OrgChartExportPreview";
import { CardVisibilitySettings } from "./ExportableOrgChartNode";

interface OrgChartExportDialogProps {
  employees: Employee[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type ExportFormat = "png" | "pdf" | "svg";

const formatOptions: { value: ExportFormat; label: string; icon: React.ReactNode }[] = [
  { value: "png", label: "PNG", icon: <Image className="h-4 w-4" /> },
  { value: "pdf", label: "PDF", icon: <FileText className="h-4 w-4" /> },
  { value: "svg", label: "SVG", icon: <FileCode className="h-4 w-4" /> },
];

export function OrgChartExportDialog({
  employees,
  open,
  onOpenChange,
}: OrgChartExportDialogProps) {
  const previewRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>("png");

  // Get employees who can be starting points (have reports or are root)
  const startingEmployeeOptions = useMemo(
    () => getEmployeesWithReports(employees),
    [employees]
  );

  // Default to full company structure
  const [startingEmployeeId, setStartingEmployeeId] = useState<string>(
    FULL_COMPANY_VALUE
  );

  const [visibility, setVisibility] = useState<CardVisibilitySettings>({
    showAvatar: true,
    showPosition: true,
    showDepartment: true,
    showLocation: true,
  });

  // Build the org tree based on selected starting employee
  const orgData = useMemo(() => {
    if (startingEmployeeId === FULL_COMPANY_VALUE) {
      return buildOrgTrees(employees);
    }
    if (!startingEmployeeId) return null;
    const tree = buildOrgTreeFromEmployee(employees, startingEmployeeId);
    return tree ? [tree] : null;
  }, [employees, startingEmployeeId]);

  const handleVisibilityChange = (
    key: keyof CardVisibilitySettings,
    checked: boolean
  ) => {
    setVisibility((prev) => ({ ...prev, [key]: checked }));
  };

  const handleExport = async () => {
    if (!previewRef.current) {
      toast({
        title: "Export failed",
        description: "Unable to find the preview element.",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);

    try {
      switch (selectedFormat) {
        case "png":
          await exportToPng(previewRef.current);
          break;
        case "pdf":
          await exportToPdf(previewRef.current);
          break;
        case "svg":
          await exportToSvg(previewRef.current);
          break;
      }

      toast({
        title: "Export successful",
        description: `Org chart exported as ${selectedFormat.toUpperCase()}.`,
      });

      onOpenChange(false);
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export failed",
        description: "An error occurred while exporting the org chart.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const selectedEmployee = employees.find((e) => e.id === startingEmployeeId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="4xl" className="max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Export Org Chart</DialogTitle>
          <DialogDescription>
            Customize the org chart export by selecting a starting employee and choosing which details to show.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 grid grid-cols-[280px_1fr] gap-6 min-h-0">
          {/* Settings Panel */}
          <div className="space-y-6">
            {/* Starting Employee */}
            <div className="space-y-2">
              <Label>Starting From</Label>
              <Select
                value={startingEmployeeId}
                onValueChange={setStartingEmployeeId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={FULL_COMPANY_VALUE}>
                    Full Company Structure
                  </SelectItem>
                  <div className="h-px bg-border my-1" />
                  {startingEmployeeOptions.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName} ({emp.position})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {startingEmployeeId === FULL_COMPANY_VALUE
                  ? "Export will include all employees and organizational relationships."
                  : selectedEmployee
                  ? `Export will include ${selectedEmployee.firstName}'s team and all subordinates.`
                  : "Select an option to preview."}
              </p>
            </div>

            {/* Card Details */}
            <div className="space-y-3">
              <Label>Card Details</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="showAvatar"
                    checked={visibility.showAvatar}
                    onCheckedChange={(checked) =>
                      handleVisibilityChange("showAvatar", checked as boolean)
                    }
                  />
                  <Label htmlFor="showAvatar" className="font-normal cursor-pointer">
                    Show Avatar
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="showPosition"
                    checked={visibility.showPosition}
                    onCheckedChange={(checked) =>
                      handleVisibilityChange("showPosition", checked as boolean)
                    }
                  />
                  <Label htmlFor="showPosition" className="font-normal cursor-pointer">
                    Show Position
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="showDepartment"
                    checked={visibility.showDepartment}
                    onCheckedChange={(checked) =>
                      handleVisibilityChange("showDepartment", checked as boolean)
                    }
                  />
                  <Label htmlFor="showDepartment" className="font-normal cursor-pointer">
                    Show Department
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="showLocation"
                    checked={visibility.showLocation}
                    onCheckedChange={(checked) =>
                      handleVisibilityChange("showLocation", checked as boolean)
                    }
                  />
                  <Label htmlFor="showLocation" className="font-normal cursor-pointer">
                    Show Location
                  </Label>
                </div>
              </div>
            </div>

            {/* Export Format */}
            <div className="space-y-2">
              <Label>Export Format</Label>
              <div className="flex gap-2">
                {formatOptions.map((format) => (
                  <Button
                    key={format.value}
                    variant={selectedFormat === format.value ? "default" : "outline"}
                    size="sm"
                    className="flex-1 gap-1.5"
                    onClick={() => setSelectedFormat(format.value)}
                  >
                    {format.icon}
                    {format.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Preview Panel */}
          <div className="border rounded-lg overflow-hidden min-h-0">
            <div className="bg-muted/30 px-3 py-2 border-b">
              <span className="text-xs font-medium text-muted-foreground">Preview</span>
            </div>
            <ScrollArea className="h-[350px]">
              {orgData ? (
                <OrgChartExportPreview
                  ref={previewRef}
                  orgData={orgData}
                  visibility={visibility}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Select a starting employee to preview.
                </div>
              )}
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleExport}
            disabled={isExporting || !orgData}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            {isExporting ? "Exporting..." : "Export"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
