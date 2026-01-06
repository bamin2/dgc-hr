import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Calendar,
  MapPin,
  Building2,
  Briefcase,
  Mail,
  Phone,
  FileText,
  GraduationCap,
  Settings,
  Users,
  Shield,
  CheckCircle2,
} from "lucide-react";
import { EmployeeDetails } from "./EmployeeDetailsStep";
import { TeamAssignments } from "./TeamAssignStep";
import { TaskCategory, TaskAssignee } from "@/hooks/useOnboarding";
import { useEmployees } from "@/hooks/useEmployees";
import { cn } from "@/lib/utils";

// Local interfaces for ReviewStep compatibility
interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  estimatedDays: number;
  categories: TaskCategory[];
  tasks: { id: string; title: string; description: string; category: TaskCategory; dueDate: string; assignedTo: string; required: boolean; order: number }[];
}

interface LocalTask {
  id: string;
  title: string;
  description: string;
  category: TaskCategory;
  dueDate: string;
  assignedTo: TaskAssignee;
  status: "pending" | "in_progress" | "completed" | "skipped";
  completedAt: string | null;
  completedBy: string | null;
  required: boolean;
  order: number;
}

interface ReviewStepProps {
  employeeDetails: EmployeeDetails;
  selectedTemplate: WorkflowTemplate | null;
  customizedTasks: LocalTask[];
  teamAssignments: TeamAssignments;
}

const categoryIcons: Record<TaskCategory, React.ComponentType<{ className?: string }>> = {
  documentation: FileText,
  training: GraduationCap,
  setup: Settings,
  introduction: Users,
  compliance: Shield,
};

export function ReviewStep({
  employeeDetails,
  selectedTemplate,
  customizedTasks,
  teamAssignments,
}: ReviewStepProps) {
  const { data: employees = [] } = useEmployees();

  const getEmployeeName = (id: string) => {
    const emp = employees.find((e) => e.id === id);
    return emp ? `${emp.firstName} ${emp.lastName}` : "Not assigned";
  };

  const enabledTasks = customizedTasks.filter((t) => t.status !== "skipped");
  
  const tasksByCategory = enabledTasks.reduce((acc, task) => {
    if (!acc[task.category]) {
      acc[task.category] = 0;
    }
    acc[task.category]++;
    return acc;
  }, {} as Record<TaskCategory, number>);

  const initials = `${employeeDetails.firstName.charAt(0)}${employeeDetails.lastName.charAt(0)}`.toUpperCase();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-1">Review & Launch</h2>
        <p className="text-muted-foreground">
          Review all details before launching the onboarding workflow.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Employee Details Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              New Employee
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-semibold">
                  {employeeDetails.firstName} {employeeDetails.lastName}
                </h3>
                <p className="text-muted-foreground">{employeeDetails.position}</p>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="truncate">{employeeDetails.email || "Not provided"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{employeeDetails.phone || "Not provided"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span>{employeeDetails.department || "Not assigned"}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{employeeDetails.location || "Not assigned"}</span>
              </div>
              <div className="flex items-center gap-2 col-span-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>
                  Starts{" "}
                  {employeeDetails.startDate
                    ? format(employeeDetails.startDate, "MMMM d, yyyy")
                    : "Not set"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Workflow Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Workflow
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{selectedTemplate?.name || "None"} Template</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedTemplate?.estimatedDays || 0} days estimated
                </p>
              </div>
              <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                {enabledTasks.length} tasks
              </Badge>
            </div>

            <Separator />

            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Tasks by Category</p>
              <div className="grid grid-cols-2 gap-2">
                {(Object.entries(tasksByCategory) as [TaskCategory, number][]).map(
                  ([category, count]) => {
                    const Icon = categoryIcons[category];
                    return (
                      <div
                        key={category}
                        className="flex items-center gap-2 text-sm capitalize"
                      >
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <span>{category}</span>
                        <Badge variant="secondary" className="ml-auto text-xs">
                          {count}
                        </Badge>
                      </div>
                    );
                  }
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Team Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Assigned Team
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Manager</p>
                <p className="text-sm font-medium">
                  {teamAssignments.managerId
                    ? getEmployeeName(teamAssignments.managerId)
                    : "Not assigned"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Buddy</p>
                <p className="text-sm font-medium">
                  {teamAssignments.buddyId
                    ? getEmployeeName(teamAssignments.buddyId)
                    : "Not assigned"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">IT Contact</p>
                <p className="text-sm font-medium">
                  {teamAssignments.itContactId
                    ? getEmployeeName(teamAssignments.itContactId)
                    : "Not assigned"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">HR Contact</p>
                <p className="text-sm font-medium">
                  {teamAssignments.hrContactId
                    ? getEmployeeName(teamAssignments.hrContactId)
                    : "Not assigned"}
                </p>
              </div>
            </div>

            {teamAssignments.welcomeMessage && (
              <>
                <Separator className="my-4" />
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">
                    Welcome Message
                  </p>
                  <p className="text-sm text-muted-foreground italic">
                    "{teamAssignments.welcomeMessage}"
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-emerald-200 bg-emerald-50/50 dark:border-emerald-800 dark:bg-emerald-950/20">
        <CardContent className="flex items-center gap-4 p-4">
          <CheckCircle2 className="h-8 w-8 text-emerald-600" />
          <div>
            <p className="font-medium text-emerald-900 dark:text-emerald-100">
              Ready to Launch
            </p>
            <p className="text-sm text-emerald-700 dark:text-emerald-300">
              Click "Launch Onboarding" to start the workflow. The employee will receive
              notifications about their tasks.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
