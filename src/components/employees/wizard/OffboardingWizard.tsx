import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, ArrowRight, Rocket } from "lucide-react";
import { WizardProgress } from "./WizardProgress";
import { OffboardingEmployeeStep } from "./OffboardingEmployeeStep";
import { ExitInterviewStep } from "./ExitInterviewStep";
import { AssetReturnStep } from "./AssetReturnStep";
import { AccessRevocationStep } from "./AccessRevocationStep";
import { OffboardingReviewStep } from "./OffboardingReviewStep";
import {
  useCreateOffboarding,
  defaultOffboardingAssets,
  defaultOffboardingAccessSystems,
  type DepartureReason,
  type NoticePeriodStatus,
  type InterviewFormat,
  type AssetType,
  type AssetCondition,
  type AccessSystemType,
  type AccessStatus,
} from "@/hooks/useOffboarding";

const steps = [
  { label: "Employee", description: "Departure details" },
  { label: "Exit Interview", description: "Schedule interview" },
  { label: "Asset Return", description: "Track company assets" },
  { label: "Access", description: "Revoke system access" },
  { label: "Review", description: "Confirm and launch" },
];

// Re-export types from hook for use by step components
export type { DepartureReason, NoticePeriodStatus, InterviewFormat, AssetType, AssetCondition, AccessSystemType, AccessStatus } from "@/hooks/useOffboarding";

// Local state types for the wizard
export interface EmployeeDepartureData {
  lastWorkingDay: string;
  departureReason: DepartureReason;
  resignationLetterReceived: boolean;
  noticePeriodStatus: NoticePeriodStatus;
  managerConfirmed: boolean;
}

export interface ExitInterviewData {
  scheduledDate: string;
  scheduledTime: string;
  interviewer: string;
  format: InterviewFormat;
  skipInterview: boolean;
}

export interface AssetItem {
  id: string;
  name: string;
  type: AssetType;
  serialNumber: string;
  condition: AssetCondition;
  notes: string;
}

export interface AccessSystem {
  id: string;
  name: string;
  type: AccessSystemType;
  accessLevel: string;
  revocationDate: string;
  status: AccessStatus;
}

interface EmployeeInfo {
  id: string;
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
  const createOffboarding = useCreateOffboarding();

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

  // Step 3: Assets - convert from default database format to local format
  const [assets, setAssets] = useState<AssetItem[]>(() =>
    defaultOffboardingAssets.map((a, index) => ({
      id: `default-${index}`,
      name: a.name,
      type: a.type as AssetType,
      serialNumber: a.serial_number || "",
      condition: a.condition as AssetCondition,
      notes: a.notes || "",
    }))
  );

  // Step 4: Access systems - convert from default database format to local format
  const [systems, setSystems] = useState<AccessSystem[]>(() =>
    defaultOffboardingAccessSystems.map((s, index) => ({
      id: `default-${index}`,
      name: s.name,
      type: s.type as AccessSystemType,
      accessLevel: s.access_level || "Standard",
      revocationDate: departureData.lastWorkingDay,
      status: s.status as AccessStatus,
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

  const handleLaunch = async () => {
    try {
      await createOffboarding.mutateAsync({
        record: {
          employee_id: employee.id,
          last_working_day: departureData.lastWorkingDay,
          departure_reason: departureData.departureReason,
          resignation_letter_received: departureData.resignationLetterReceived,
          notice_period_status: departureData.noticePeriodStatus,
          manager_confirmed: departureData.managerConfirmed,
          it_contact_id: itContact || null,
          data_backup_required: dataBackupRequired,
          email_forwarding: emailForwarding,
          notes: notes || null,
          status: "in_progress",
        },
        interview: {
          scheduled_date: interviewData.scheduledDate || null,
          scheduled_time: interviewData.scheduledTime || null,
          interviewer_id: interviewData.interviewer || null,
          format: interviewData.format,
          skip_interview: interviewData.skipInterview,
        },
        assets: assets.map((a) => ({
          name: a.name,
          type: a.type,
          serial_number: a.serialNumber || null,
          condition: a.condition,
          notes: a.notes || null,
        })),
        accessSystems: systems.map((s) => ({
          name: s.name,
          type: s.type,
          access_level: s.accessLevel || null,
          revocation_date: s.revocationDate || null,
          status: s.status,
        })),
      });

      toast({
        title: "Offboarding launched!",
        description: `Offboarding process has been initiated for ${employee.firstName} ${employee.lastName}.`,
      });
      onComplete?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create offboarding record. Please try again.",
        variant: "destructive",
      });
    }
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
    <div className="space-y-6">
      <WizardProgress currentStep={currentStep + 1} steps={steps} />

      <Card>
        <CardContent className="p-6">
          {renderStepContent()}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 0}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Previous
        </Button>

        {currentStep < steps.length - 1 ? (
          <Button onClick={handleNext} className="gap-2 bg-primary hover:bg-primary/90">
            Next
            <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={handleLaunch}
            disabled={createOffboarding.isPending}
            className="gap-2 bg-red-600 hover:bg-red-700 text-white"
          >
            <Rocket className="h-4 w-4" />
            {createOffboarding.isPending ? "Launching..." : "Launch Offboarding"}
          </Button>
        )}
      </div>
    </div>
  );
}
