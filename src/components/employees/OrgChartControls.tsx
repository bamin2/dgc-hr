import { ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OrgChartControlsProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
}

export function OrgChartControls({
  zoom,
  onZoomIn,
  onZoomOut,
  onReset,
}: OrgChartControlsProps) {
  return (
    <div className="absolute bottom-4 left-4 flex flex-col gap-1 bg-card border rounded-lg shadow-sm p-1">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={onZoomIn}
        disabled={zoom >= 1.5}
      >
        <ZoomIn className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={onZoomOut}
        disabled={zoom <= 0.5}
      >
        <ZoomOut className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={onReset}
      >
        <Maximize2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
