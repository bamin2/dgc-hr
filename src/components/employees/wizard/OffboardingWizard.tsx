import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { ChevronLeft, ChevronRight, Rocket } from "lucide-react";
import { WizardProgress } from "./WizardProgress";
import { OffboardingEmployeeStep } from "./OffboardingEmployeeStep";
import { ExitInterviewStep } from "./ExitInterviewStep";
import { AssetReturnStep } from "./AssetReturnStep";
import { AccessRevocationStep } from "./AccessRevocationStep";
import { OffboardingReviewStep } from "./OffboardingReviewStep";
import {
  type EmployeeDepartureData,
  type ExitInterviewData,
  type AssetItem,
  type AccessSystem,
  defaultAssets,
  defaultAccessSystems,
} from "@/data/offboarding";

const steps = [
  { label: "Employee", description: "Departure details" },
  { label: "Exit Interview", description: "Schedule interview" },
  { label: "Asset Return", description: "Track company assets" },
  { label: "Access", description: "Revoke system access" },
  { label: "Review", description: "Confirm and launch" },
];

interface EmployeeInfo {
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  jobTitle: string;
}

interface OffboardingWizardProps {
  employee: EmployeeInfo;
  onComplete?: () => void;
}

export function OffboardingWizard({ employee, onComplete }: OffboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);

  // Step 1: Departure data
  const [departureData, setDepartureData] = useState<EmployeeDepartureData>({
    lastWorkingDay: "",
    departureReason: "resignation",
    resignationLetterReceived: false,
    noticePeriodStatus: "serving",
    managerConfirmed: false,
  });

  // Step 2: Exit interview
  const [interviewData, setInterviewData] = useState<ExitInterviewData>({
    scheduledDate: "",
    scheduledTime: "",
    interviewer: "",
    format: "in_person",
    skipInterview: false,
  });

  // Step 3: Assets
  const [assets, setAssets] = useState<AssetItem[]>(defaultAssets);

  // Step 4: Access systems
  const [systems, setSystems] = useState<AccessSystem[]>(() =>
    defaultAccessSystems.map((s) => ({
      ...s,
      revocationDate: departureData.lastWorkingDay,
    }))
  );
  const [itContact, setItContact] = useState("");
  const [dataBackupRequired, setDataBackupRequired] = useState(true);
  const [emailForwarding, setEmailForwarding] = useState(false);

  // Step 5: Notes
  const [notes, setNotes] = useState("");

  // Update revocation dates when last working day changes
  const handleDepartureDataChange = (data: EmployeeDepartureData) => {
    setDepartureData(data);
    if (data.lastWorkingDay !== departureData.lastWorkingDay) {
      setSystems((prev) =>
        prev.map((s) => ({
          ...s,
          revocationDate: s.revocationDate || data.lastWorkingDay,
        }))
      );
    }
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 0:
        if (!departureData.lastWorkingDay) {
          toast({
            title: "Last working day required",
            description: "Please select the employee's last working day.",
            variant: "destructive",
          });
          return false;
        }
        return true;
      case 1:
        if (!interviewData.skipInterview) {
          if (!interviewData.scheduledDate || !interviewData.scheduledTime) {
            toast({
              title: "Interview schedule required",
              description: "Please schedule the exit interview or skip it.",
              variant: "destructive",
            });
            return false;
          }
          if (!interviewData.interviewer) {
            toast({
              title: "Interviewer required",
              description: "Please select an interviewer for the exit interview.",
              variant: "destructive",
            });
            return false;
          }
        }
        return true;
      case 2:
        return true; // Assets are optional
      case 3:
        if (!itContact) {
          toast({
            title: "IT contact required",
            description: "Please select an IT contact for access revocation.",
            variant: "destructive",
          });
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleLaunch = () => {
    toast({
      title: "Offboarding launched!",
      description: `Offboarding process has been initiated for ${employee.firstName} ${employee.lastName}.`,
    });
    onComplete?.();
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <OffboardingEmployeeStep
            employee={employee}
            departureData={departureData}
            onDepartureDataChange={handleDepartureDataChange}
          />
        );
      case 1:
        return (
          <ExitInterviewStep
            interviewData={interviewData}
            onInterviewDataChange={setInterviewData}
          />
        );
      case 2:
        return <AssetReturnStep assets={assets} onAssetsChange={setAssets} />;
      case 3:
        return (
          <AccessRevocationStep
            systems={systems}
            onSystemsChange={setSystems}
            itContact={itContact}
            onItContactChange={setItContact}
            dataBackupRequired={dataBackupRequired}
            onDataBackupRequiredChange={setDataBackupRequired}
            emailForwarding={emailForwarding}
            onEmailForwardingChange={setEmailForwarding}
            lastWorkingDay={departureData.lastWorkingDay}
          />
        );
      case 4:
        return (
          <OffboardingReviewStep
            employee={employee}
            departureData={departureData}
            interviewData={interviewData}
            assets={assets}
            systems={systems}
            notes={notes}
            onNotesChange={setNotes}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Progress */}
      <div className="mb-6">
        <WizardProgress currentStep={currentStep} steps={steps} />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pr-2">{renderStepContent()}</div>

      {/* Navigation */}
      <div className="flex justify-between pt-6 mt-6 border-t">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 0}
          className="gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>

        {currentStep === steps.length - 1 ? (
          <Button
            onClick={handleLaunch}
            className="gap-2 bg-red-600 hover:bg-red-700 text-white"
          >
            <Rocket className="h-4 w-4" />
            Launch Offboarding
          </Button>
        ) : (
          <Button onClick={handleNext} className="gap-2">
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
