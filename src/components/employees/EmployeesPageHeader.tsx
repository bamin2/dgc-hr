import { History, Upload, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
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

  const actions = canEdit ? (
    <>
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
    </>
  ) : undefined;

  return (
    <PageHeader
      title="Employee Management"
      actions={actions}
    />
  );
}
