import { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Employee } from "@/data/employees";
import { OrgChartExportDialog } from "./OrgChartExportDialog";

interface OrgChartExportButtonProps {
  employees: Employee[];
}

export function OrgChartExportButton({ employees }: OrgChartExportButtonProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        className="gap-2"
        onClick={() => setDialogOpen(true)}
      >
        <Download className="h-4 w-4" />
        Export Org Chart
      </Button>
      <OrgChartExportDialog
        employees={employees}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  );
}
