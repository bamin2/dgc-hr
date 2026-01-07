import { useState, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Info, Search } from "lucide-react";
import { BulkSalaryWizardData, AllowanceEntryExtended, DeductionEntryExtended } from "../types";
import { TeamMemberWithGosi } from "@/hooks/useBulkSalaryWizard";
import { EmployeeCompensationCard } from "../components/EmployeeCompensationCard";

interface SalaryComponentsStepProps {
  data: BulkSalaryWizardData;
  onUpdateData: <K extends keyof BulkSalaryWizardData>(field: K, value: BulkSalaryWizardData[K]) => void;
  allowanceTemplates: { id: string; name: string; amount: number; amount_type: string }[];
  deductionTemplates: { id: string; name: string; amount: number; amount_type: string }[];
  selectedEmployees: TeamMemberWithGosi[];
  currency?: string;
}

export function SalaryComponentsStep({
  data,
  onUpdateData,
  allowanceTemplates,
  deductionTemplates,
  selectedEmployees,
}: SalaryComponentsStepProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredEmployees = selectedEmployees.filter(employee => {
    const fullName = `${employee.firstName} ${employee.lastName}`.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase());
  });

  const handleUpdateAllowances = (employeeId: string, allowances: AllowanceEntryExtended[]) => {
    onUpdateData('perEmployeeAllowances', {
      ...data.perEmployeeAllowances,
      [employeeId]: allowances,
    });
  };

  const handleUpdateDeductions = (employeeId: string, deductions: DeductionEntryExtended[]) => {
    onUpdateData('perEmployeeDeductions', {
      ...data.perEmployeeDeductions,
      [employeeId]: deductions,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Salary Components</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Manage allowances and deductions for each employee
        </p>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          The GOSI - Bahraini deduction is managed separately in Settings and cannot be modified here.
          It will be automatically applied based on GOSI registered salary.
        </AlertDescription>
      </Alert>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search employees..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Employee Cards */}
      <div className="space-y-2">
        {filteredEmployees.length > 0 ? (
          filteredEmployees.map(employee => (
            <EmployeeCompensationCard
              key={employee.id}
              employee={employee}
              allowances={data.perEmployeeAllowances[employee.id] || []}
              deductions={data.perEmployeeDeductions[employee.id] || []}
              onUpdateAllowances={(allowances) => handleUpdateAllowances(employee.id, allowances)}
              onUpdateDeductions={(deductions) => handleUpdateDeductions(employee.id, deductions)}
              allowanceTemplates={allowanceTemplates}
              deductionTemplates={deductionTemplates}
            />
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            {searchQuery ? "No employees match your search" : "No employees selected"}
          </div>
        )}
      </div>
    </div>
  );
}