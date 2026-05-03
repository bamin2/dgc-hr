import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Rocket, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { WizardProgress } from "./WizardProgress";
import { EmployeeDetailsStep, EmployeeDetails } from "./EmployeeDetailsStep";
import { WorkflowSelectStep } from "./WorkflowSelectStep";
import { TaskCustomizeStep } from "./TaskCustomizeStep";
import { TeamAssignStep, TeamAssignments } from "./TeamAssignStep";
import { ReviewStep } from "./ReviewStep";
import { toast } from "@/hooks/use-toast";
import {
  useOnboardingWorkflows,
  useCreateOnboarding,
  OnboardingWorkflow,
  TaskCategory,
  TaskAssignee,
} from "@/hooks/useOnboarding";
import { useEmployees } from "@/hooks/useEmployees";

const steps = [
  { label: "Employee", description: "Basic info" },
  { label: "Workflow", description: "Select template" },
  { label: "Tasks", description: "Customize" },
  { label: "Team", description: "Assign people" },
  { label: "Review", description: "Launch" },
];

// Local task type for wizard customization
export interface WizardTask {
  id: string;
  title: string;
  description: string;
  category: TaskCategory;
  assignedTo: TaskAssignee;
  isRequired: boolean;
  taskOrder: number;
  dueDaysOffset: number;
  status: "pending" | "in_progress" | "completed" | "skipped";
  completedAt: string | null;
  completedBy: string | null;
}

interface OnboardingWizardProps {
  initialEmployeeDetails?: Partial<EmployeeDetails>;
  employeeId?: string;
  onComplete?: () => void;
}

export function OnboardingWizard({ initialEmployeeDetails, employeeId, onComplete }: OnboardingWizardProps) {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);

  const { data: workflows = [], isLoading: workflowsLoading } = useOnboardingWorkflows();
  const { data: employees = [] } = useEmployees();
  const createOnboarding = useCreateOnboarding();

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

  const [selectedWorkflow, setSelectedWorkflow] = useState<OnboardingWorkflow | null>(null);
  const [customizedTasks, setCustomizedTasks] = useState<WizardTask[]>([]);

  const [teamAssignments, setTeamAssignments] = useState<TeamAssignments>({
    managerId: "",
    buddyId: "",
    itContactId: "",
    hrContactId: "",
    welcomeMessage: "",
  });

  const handleWorkflowSelect = (workflow: OnboardingWorkflow) => {
    setSelectedWorkflow(workflow);
    // Initialize tasks from workflow template
    const tasks: WizardTask[] = (workflow.tasks || []).map((task) => ({
      id: task.id,
      title: task.title,
      description: task.description || "",
      category: task.category,
      assignedTo: task.assigned_to,
      isRequired: task.is_required ?? true,
      taskOrder: task.task_order ?? 1,
      dueDaysOffset: task.due_days_offset ?? 0,
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
        if (!selectedWorkflow) {
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

  const handleLaunch = async () => {
    if (!selectedWorkflow || !employeeDetails.startDate) return;

    // Find or require an employee ID
    let targetEmployeeId = employeeId;
    
    if (!targetEmployeeId) {
      // Find employee by email
      const employee = employees.find(
        (e) => e.email.toLowerCase() === employeeDetails.email.toLowerCase()
      );
      if (employee) {
        targetEmployeeId = employee.id;
      } else {
        toast({
          title: "Employee not found",
          description: "Please ensure the employee exists in the system before starting onboarding.",
          variant: "destructive",
        });
        return;
      }
    }

    try {
      await createOnboarding.mutateAsync({
        employeeId: targetEmployeeId,
        workflowId: selectedWorkflow.id,
        workflowName: selectedWorkflow.name,
        startDate: employeeDetails.startDate,
        estimatedDays: selectedWorkflow.estimated_days || 14,
        managerId: teamAssignments.managerId || undefined,
        buddyId: teamAssignments.buddyId || undefined,
        itContactId: teamAssignments.itContactId || undefined,
        hrContactId: teamAssignments.hrContactId || undefined,
        welcomeMessage: teamAssignments.welcomeMessage || undefined,
        tasks: customizedTasks.map((task) => ({
          title: task.title,
          description: task.description,
          category: task.category,
          assignedTo: task.assignedTo,
          isRequired: task.isRequired,
          taskOrder: task.taskOrder,
          dueDaysOffset: task.dueDaysOffset,
        })),
      });

      toast({
        title: "Onboarding launched!",
        description: `${employeeDetails.firstName} ${employeeDetails.lastName}'s onboarding has been started successfully.`,
      });

      if (onComplete) {
        onComplete();
      } else {
        navigate("/employees");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create onboarding. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Convert workflows to the format expected by WorkflowSelectStep
  const workflowTemplates = workflows.map((w) => ({
    id: w.id,
    name: w.name,
    description: w.description || "",
    icon: w.icon || "Briefcase",
    estimatedDays: w.estimated_days || 14,
    categories: (w.categories || []) as TaskCategory[],
    tasks: (w.tasks || []).map((t) => ({
      id: t.id,
      title: t.title,
      description: t.description || "",
      category: t.category,
      dueDate: "",
      assignedTo: t.assigned_to,
      required: t.is_required ?? true,
      order: t.task_order ?? 1,
    })),
  }));

  // Convert selectedWorkflow to template format for ReviewStep
  const selectedTemplate = selectedWorkflow
    ? {
        id: selectedWorkflow.id,
        name: selectedWorkflow.name,
        description: selectedWorkflow.description || "",
        icon: selectedWorkflow.icon || "Briefcase",
        estimatedDays: selectedWorkflow.estimated_days || 14,
        categories: (selectedWorkflow.categories || []) as TaskCategory[],
        tasks: (selectedWorkflow.tasks || []).map((t) => ({
          id: t.id,
          title: t.title,
          description: t.description || "",
          category: t.category,
          dueDate: "",
          assignedTo: t.assigned_to,
          required: t.is_required ?? true,
          order: t.task_order ?? 1,
        })),
      }
    : null;

  // Convert customized tasks for TaskCustomizeStep and ReviewStep
  const legacyTasks = customizedTasks.map((t) => ({
    id: t.id,
    title: t.title,
    description: t.description,
    category: t.category,
    dueDate: "",
    assignedTo: t.assignedTo,
    status: t.status,
    completedAt: t.completedAt,
    completedBy: t.completedBy,
    required: t.isRequired,
    order: t.taskOrder,
  }));

  const handleTasksChange = (tasks: typeof legacyTasks) => {
    setCustomizedTasks(
      tasks.map((t) => ({
        id: t.id,
        title: t.title,
        description: t.description,
        category: t.category as TaskCategory,
        assignedTo: t.assignedTo as TaskAssignee,
        isRequired: t.required,
        taskOrder: t.order,
        dueDaysOffset: 0,
        status: t.status as WizardTask["status"],
        completedAt: t.completedAt,
        completedBy: t.completedBy,
      }))
    );
  };

  if (workflowsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

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
              selectedTemplateId={selectedWorkflow?.id || null}
              onSelect={(template) => {
                const workflow = workflows.find((w) => w.id === template.id);
                if (workflow) handleWorkflowSelect(workflow);
              }}
            />
          )}
          {currentStep === 3 && (
            <TaskCustomizeStep
              tasks={legacyTasks}
              onChange={handleTasksChange}
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
              customizedTasks={legacyTasks}
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
            disabled={createOnboarding.isPending}
            className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {createOnboarding.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Rocket className="h-4 w-4" />
            )}
            Launch Onboarding
          </Button>
        )}
      </div>
    </div>
  );
}
