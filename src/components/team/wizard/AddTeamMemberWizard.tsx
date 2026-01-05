import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { VerticalWizardProgress } from "./VerticalWizardProgress";
import { TeamBasicStep, TeamBasicData } from "./TeamBasicStep";
import { TeamRoleStep, TeamRoleData } from "./TeamRoleStep";
import { TeamCompensationStep, TeamCompensationData } from "./TeamCompensationStep";
import { TeamOfferStep, TeamOfferData } from "./TeamOfferStep";
import { TeamFinalizeStep } from "./TeamFinalizeStep";

const steps = [
  { id: 1, label: "Team Basic" },
  { id: 2, label: "Team Role" },
  { id: 3, label: "Team Compensation" },
  { id: 4, label: "Team Offer" },
  { id: 5, label: "Team Finalize" },
];

export function AddTeamMemberWizard() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);

  // Step data
  const [basicData, setBasicData] = useState<TeamBasicData>({
    firstName: "",
    lastName: "",
    preferredName: "",
    workerType: "employee",
    country: "US",
    email: "",
    sendOfferLetter: true,
  });

  const [roleData, setRoleData] = useState<TeamRoleData>({
    workLocation: "",
    jobTitle: "",
    department: "",
    managerId: "",
    startDate: undefined,
  });

  const [compensationData, setCompensationData] = useState<TeamCompensationData>({
    employeeType: "",
    salary: "",
    payFrequency: "year",
    employmentStatus: "",
    taxExemptionStatus: "",
  });

  const [offerData, setOfferData] = useState<TeamOfferData>({
    templateId: "",
    templateTitle: "",
    expirationDate: undefined,
    managerId: "",
    jobTitle: "",
    signatureTitle: "",
    signatureName: "",
    offerContent: "",
  });

  const [note, setNote] = useState("");

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!basicData.firstName || !basicData.lastName || !basicData.email) {
          toast({
            title: "Required fields missing",
            description: "Please fill in first name, last name, and email.",
            variant: "destructive",
          });
          return false;
        }
        return true;
      case 2:
        if (!roleData.jobTitle || !roleData.department) {
          toast({
            title: "Required fields missing",
            description: "Please fill in job title and department.",
            variant: "destructive",
          });
          return false;
        }
        return true;
      case 3:
        if (!compensationData.salary) {
          toast({
            title: "Required fields missing",
            description: "Please enter the salary amount.",
            variant: "destructive",
          });
          return false;
        }
        return true;
      case 4:
        // Offer step is optional
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < steps.length) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    toast({
      title: "Team member added",
      description: `${basicData.firstName} ${basicData.lastName} has been added successfully.`,
    });
    navigate("/team");
  };

  const handleClose = () => {
    navigate("/team");
  };

  const handleEditStep = (step: number) => {
    setCurrentStep(step);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <TeamBasicStep data={basicData} onChange={setBasicData} />;
      case 2:
        return <TeamRoleStep data={roleData} onChange={setRoleData} />;
      case 3:
        return (
          <TeamCompensationStep
            data={compensationData}
            onChange={setCompensationData}
            workerType={basicData.workerType}
          />
        );
      case 4:
        return (
          <TeamOfferStep
            data={offerData}
            onChange={setOfferData}
            defaultJobTitle={roleData.jobTitle}
            defaultManagerId={roleData.managerId}
          />
        );
      case 5:
        return (
          <TeamFinalizeStep
            basicData={basicData}
            roleData={roleData}
            compensationData={compensationData}
            offerData={offerData}
            note={note}
            onNoteChange={setNote}
            onEditStep={handleEditStep}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b bg-card">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={handleClose}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Add a team member</h1>
        </div>
        <Button variant="ghost" size="icon" onClick={handleClose}>
          <X className="h-5 w-5" />
        </Button>
      </header>

      {/* Content */}
      <div className="flex-1 flex">
        {/* Left sidebar - Progress */}
        <aside className="w-64 border-r bg-card p-6 hidden md:block">
          <VerticalWizardProgress steps={steps} currentStep={currentStep} />
        </aside>

        {/* Main content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-2xl mx-auto">{renderStepContent()}</div>
        </main>
      </div>

      {/* Footer */}
      <footer className="flex items-center justify-end gap-3 px-6 py-4 border-t bg-card">
        {currentStep > 1 && (
          <Button variant="outline" onClick={handleBack}>
            Back
          </Button>
        )}
        {currentStep < steps.length ? (
          <Button onClick={handleNext} className="bg-primary hover:bg-primary/90">
            Continue
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            Send Offer
          </Button>
        )}
      </footer>
    </div>
  );
}
