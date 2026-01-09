import {
  EmployeeForm,
  EmployeeImportDialog,
  ImportHistoryDialog,
} from "@/components/employees";
import { OnboardingDialog, OffboardingDialog } from "@/components/team";
import { Employee } from "@/hooks/useEmployees";
import { TeamMember } from "@/hooks/employee";

interface EmployeeDialogsProps {
  // Form dialog
  formOpen: boolean;
  onFormOpenChange: (open: boolean) => void;
  editingEmployee: Employee | null;
  onSave: (data: Partial<Employee>) => void;

  // Import dialog
  importOpen: boolean;
  onImportOpenChange: (open: boolean) => void;

  // History dialog
  historyOpen: boolean;
  onHistoryOpenChange: (open: boolean) => void;

  // Onboarding dialog
  onboardingOpen: boolean;
  onOnboardingOpenChange: (open: boolean) => void;
  onboardingMember: TeamMember | null;
  onOnboardingComplete: () => void;

  // Offboarding dialog
  offboardingOpen: boolean;
  onOffboardingOpenChange: (open: boolean) => void;
  offboardingMember: TeamMember | null;
  onOffboardingComplete: () => void;
}

export function EmployeeDialogs({
  formOpen,
  onFormOpenChange,
  editingEmployee,
  onSave,
  importOpen,
  onImportOpenChange,
  historyOpen,
  onHistoryOpenChange,
  onboardingOpen,
  onOnboardingOpenChange,
  onboardingMember,
  onOnboardingComplete,
  offboardingOpen,
  onOffboardingOpenChange,
  offboardingMember,
  onOffboardingComplete,
}: EmployeeDialogsProps) {
  return (
    <>
      {/* Employee Form Modal */}
      <EmployeeForm
        open={formOpen}
        onOpenChange={onFormOpenChange}
        employee={editingEmployee}
        onSave={onSave}
      />

      {/* Employee Import Dialog */}
      <EmployeeImportDialog open={importOpen} onOpenChange={onImportOpenChange} />

      {/* Import History Dialog */}
      <ImportHistoryDialog open={historyOpen} onOpenChange={onHistoryOpenChange} />

      {/* Onboarding Dialog */}
      {onboardingMember && (
        <OnboardingDialog
          open={onboardingOpen}
          onOpenChange={onOnboardingOpenChange}
          member={onboardingMember}
          onComplete={onOnboardingComplete}
        />
      )}

      {/* Offboarding Dialog */}
      {offboardingMember && (
        <OffboardingDialog
          open={offboardingOpen}
          onOpenChange={onOffboardingOpenChange}
          member={offboardingMember}
          onComplete={onOffboardingComplete}
        />
      )}
    </>
  );
}
