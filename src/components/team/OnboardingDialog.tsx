import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { OnboardingWizard } from "@/components/employees/wizard/OnboardingWizard";
import { TeamMember } from "@/hooks/useTeamMembers";
import { EmployeeDetails } from "@/components/employees/wizard/EmployeeDetailsStep";

interface OnboardingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: TeamMember | null;
  onComplete: () => void;
}

export function OnboardingDialog({
  open,
  onOpenChange,
  member,
  onComplete,
}: OnboardingDialogProps) {
  if (!member) return null;

  // Map TeamMember to EmployeeDetails
  const initialEmployeeDetails: Partial<EmployeeDetails> = {
    firstName: member.firstName,
    lastName: member.lastName,
    email: member.email,
    department: member.department,
    position: member.jobTitle,
    startDate: new Date(member.startDate),
    location: member.workLocation || "",
    phone: "",
  };

  const handleComplete = () => {
    onComplete();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Start Employee Onboarding</DialogTitle>
        </DialogHeader>
        <OnboardingWizard
          initialEmployeeDetails={initialEmployeeDetails}
          employeeId={member.id}
          onComplete={handleComplete}
        />
      </DialogContent>
    </Dialog>
  );
}
