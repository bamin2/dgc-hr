import { History, Upload, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { EmployeeExportButton } from "@/components/employees";
import { Employee } from "@/hooks/useEmployees";

interface EmployeesPageHeaderProps {
  canEdit: boolean;
  employees: Employee[];
  onOpenHistory: () => void;
  onOpenImport: () => void;
}

export function EmployeesPageHeader({
  canEdit,
  employees,
  onOpenHistory,
  onOpenImport,
}: EmployeesPageHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <h1 className="text-xl sm:text-2xl font-semibold text-foreground">
        Employee Management
      </h1>

      {canEdit && (
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={onOpenHistory} className="gap-2">
            <History className="h-4 w-4" />
            <span className="hidden sm:inline">Import History</span>
          </Button>
          <Button variant="outline" onClick={onOpenImport} className="gap-2">
            <Upload className="h-4 w-4" />
            <span className="hidden sm:inline">Import</span>
          </Button>
          <EmployeeExportButton employees={employees} />
          <Button onClick={() => navigate("/team/add")} className="gap-2">
            <UserPlus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Team Member</span>
          </Button>
        </div>
      )}
    </div>
  );
}
