import { forwardRef } from "react";
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

export const OffboardingDialog = forwardRef<HTMLDivElement, OffboardingDialogProps>(
  function OffboardingDialog({ open, onOpenChange, member, onComplete }, ref) {
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
        <DialogContent ref={ref} className="max-w-4xl max-h-[90vh] overflow-visible p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="text-xl">
              Start Employee Offboarding
            </DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-6 pt-4">
            <OffboardingWizard
              employee={employeeInfo}
              onComplete={handleComplete}
            />
          </div>
        </DialogContent>
      </Dialog>
    );
  }
);
