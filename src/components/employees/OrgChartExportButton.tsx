import { useState } from "react";
import { Download, Image, FileText, FileCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";
import { exportToPng, exportToPdf, exportToSvg } from "@/utils/orgChartExport";

interface OrgChartExportButtonProps {
  chartRef: React.RefObject<HTMLDivElement>;
}

export function OrgChartExportButton({ chartRef }: OrgChartExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (format: "png" | "pdf" | "svg") => {
    if (!chartRef.current) {
      toast({
        title: "Export failed",
        description: "Unable to find the org chart element.",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);

    try {
      switch (format) {
        case "png":
          await exportToPng(chartRef.current);
          break;
        case "pdf":
          await exportToPdf(chartRef.current);
          break;
        case "svg":
          await exportToSvg(chartRef.current);
          break;
      }

      toast({
        title: "Export successful",
        description: `Org chart exported as ${format.toUpperCase()}.`,
      });
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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2" disabled={isExporting}>
          <Download className="h-4 w-4" />
          {isExporting ? "Exporting..." : "Export Org Chart"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleExport("png")} className="gap-2">
          <Image className="h-4 w-4" />
          Export as PNG
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("pdf")} className="gap-2">
          <FileText className="h-4 w-4" />
          Export as PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("svg")} className="gap-2">
          <FileCode className="h-4 w-4" />
          Export as SVG
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
