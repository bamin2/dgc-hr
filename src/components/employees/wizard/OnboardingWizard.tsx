import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { WizardProgress } from "./WizardProgress";
import { EmployeeDetailsStep, EmployeeDetails } from "./EmployeeDetailsStep";
import { WorkflowSelectStep } from "./WorkflowSelectStep";
import { TaskCustomizeStep } from "./TaskCustomizeStep";
import { TeamAssignStep, TeamAssignments } from "./TeamAssignStep";
import { ReviewStep } from "./ReviewStep";
import { WorkflowTemplate, OnboardingTask, workflowTemplates } from "@/data/onboarding";
import { toast } from "@/hooks/use-toast";

const steps = [
  { label: "Employee", description: "Basic info" },
  { label: "Workflow", description: "Select template" },
  { label: "Tasks", description: "Customize" },
  { label: "Team", description: "Assign people" },
  { label: "Review", description: "Launch" },
];

interface OnboardingWizardProps {
  initialEmployeeDetails?: Partial<EmployeeDetails>;
  onComplete?: () => void;
}

export function OnboardingWizard({ initialEmployeeDetails, onComplete }: OnboardingWizardProps) {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);

  const [employeeDetails, setEmployeeDetails] = useState<EmployeeDetails>({
    firstName: initialEmployeeDetails?.firstName || "",
    lastName: initialEmployeeDetails?.lastName || "",
    email: initialEmployeeDetails?.email || "",
    phone: initialEmployeeDetails?.phone || "",
    department: initialEmployeeDetails?.department || "",
    position: initialEmployeeDetails?.position || "",
    startDate: initialEmployeeDetails?.startDate || null,
    location: initialEmployeeDetails?.location || "",
  });

  const [selectedTemplate, setSelectedTemplate] = useState<WorkflowTemplate | null>(null);
  const [customizedTasks, setCustomizedTasks] = useState<OnboardingTask[]>([]);

  const [teamAssignments, setTeamAssignments] = useState<TeamAssignments>({
    managerId: "",
    buddyId: "",
    itContactId: "",
    hrContactId: "",
    welcomeMessage: "",
  });

  const handleTemplateSelect = (template: WorkflowTemplate) => {
    setSelectedTemplate(template);
    // Initialize tasks from template
    const tasks: OnboardingTask[] = template.tasks.map((task) => ({
      ...task,
      status: "pending" as const,
      completedAt: null,
      completedBy: null,
    }));
    setCustomizedTasks(tasks);
  };

  const validateStep = (): boolean => {
    switch (currentStep) {
      case 1:
        if (!employeeDetails.firstName || !employeeDetails.lastName) {
          toast({
            title: "Missing information",
            description: "Please enter the employee's first and last name.",
            variant: "destructive",
          });
          return false;
        }
        if (!employeeDetails.email) {
          toast({
            title: "Missing information",
            description: "Please enter the employee's email address.",
            variant: "destructive",
          });
          return false;
        }
        if (!employeeDetails.department || !employeeDetails.position) {
          toast({
            title: "Missing information",
            description: "Please select a department and enter a position.",
            variant: "destructive",
          });
          return false;
        }
        if (!employeeDetails.startDate) {
          toast({
            title: "Missing information",
            description: "Please select a start date.",
            variant: "destructive",
          });
          return false;
        }
        if (!employeeDetails.location) {
          toast({
            title: "Missing information",
            description: "Please select a work location.",
            variant: "destructive",
          });
          return false;
        }
        return true;
      case 2:
        if (!selectedTemplate) {
          toast({
            title: "No template selected",
            description: "Please select a workflow template to continue.",
            variant: "destructive",
          });
          return false;
        }
        return true;
      case 3:
        return true;
      case 4:
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep()) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length));
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleLaunch = () => {
    // In a real app, this would save to the database
    toast({
      title: "Onboarding launched!",
      description: `${employeeDetails.firstName} ${employeeDetails.lastName}'s onboarding has been started successfully.`,
    });
    if (onComplete) {
      onComplete();
    } else {
      navigate("/employees");
    }
  };

  return (
    <div className="space-y-6">
      <WizardProgress currentStep={currentStep} steps={steps} />

      <Card>
        <CardContent className="p-6">
          {currentStep === 1 && (
            <EmployeeDetailsStep
              data={employeeDetails}
              onChange={setEmployeeDetails}
            />
          )}
          {currentStep === 2 && (
            <WorkflowSelectStep
              templates={workflowTemplates}
              selectedTemplateId={selectedTemplate?.id || null}
              onSelect={handleTemplateSelect}
            />
          )}
          {currentStep === 3 && (
            <TaskCustomizeStep
              tasks={customizedTasks}
              onChange={setCustomizedTasks}
            />
          )}
          {currentStep === 4 && (
            <TeamAssignStep
              data={teamAssignments}
              onChange={setTeamAssignments}
            />
          )}
          {currentStep === 5 && (
            <ReviewStep
              employeeDetails={employeeDetails}
              selectedTemplate={selectedTemplate}
              customizedTasks={customizedTasks}
              teamAssignments={teamAssignments}
            />
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 1}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Previous
        </Button>

        {currentStep < steps.length ? (
          <Button onClick={handleNext} className="gap-2 bg-primary hover:bg-primary/90">
            Next
            <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={handleLaunch}
            className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Rocket className="h-4 w-4" />
            Launch Onboarding
          </Button>
        )}
      </div>
    </div>
  );
}
