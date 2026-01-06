import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { OffboardingWizard } from "@/components/employees/wizard/OffboardingWizard";
import { type TeamMember } from "@/hooks/useTeamMembers";

interface OffboardingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: TeamMember | null;
  onComplete: () => void;
}

export function OffboardingDialog({
  open,
  onOpenChange,
  member,
  onComplete,
}: OffboardingDialogProps) {
  if (!member) return null;

  const employeeInfo = {
    id: member.id,
    firstName: member.firstName,
    lastName: member.lastName,
    email: member.email,
    department: member.department,
    jobTitle: member.jobTitle,
  };

  const handleComplete = () => {
    onComplete();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            Start Employee Offboarding
          </DialogTitle>
        </DialogHeader>
        <OffboardingWizard
          employee={employeeInfo}
          onComplete={handleComplete}
        />
      </DialogContent>
    </Dialog>
  );
}
