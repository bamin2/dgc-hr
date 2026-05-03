import { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  useOnboardingRecord,
  useUpdateOnboardingTask,
  calculateOnboardingProgress,
  OnboardingTask,
  TaskCategory,
} from "@/hooks/useOnboarding";
import {
  OnboardingStatusBadge,
  OnboardingTaskList,
} from "@/components/employees";
import {
  CheckCircle2,
  Clock,
  Calendar,
  Send,
  FileText,
  GraduationCap,
  Settings,
  Users,
  Shield,
  Loader2,
} from "lucide-react";
import { formatDisplayDate } from "@/lib/dateUtils";

export default function OnboardingDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: record, isLoading, error } = useOnboardingRecord(id);
  const updateTask = useUpdateOnboardingTask();

  const tasks = record?.tasks || [];
  const progress = calculateOnboardingProgress(tasks);

  const categoryStats = useMemo(() => {
    const stats: Record<TaskCategory, { total: number; completed: number }> = {
      documentation: { total: 0, completed: 0 },
      training: { total: 0, completed: 0 },
      setup: { total: 0, completed: 0 },
      introduction: { total: 0, completed: 0 },
      compliance: { total: 0, completed: 0 },
    };

    tasks.forEach((task) => {
      if (stats[task.category]) {
        stats[task.category].total++;
        if (task.status === "completed") {
          stats[task.category].completed++;
        }
      }
    });

    return stats;
  }, [tasks]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return formatDisplayDate(dateString) || dateString;
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !record) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold">Onboarding record not found</h2>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => navigate("/employees")}
          >
            Back to Employees
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const employeeName = record.employee
    ? `${record.employee.first_name} ${record.employee.last_name}`
    : "Unknown Employee";

  const employeePosition = record.employee?.position?.title || "Unknown Position";
  const employeeDepartment = record.employee?.department?.name || "Unknown Department";

  const handleTaskToggle = async (taskId: string, completed: boolean) => {
    try {
      await updateTask.mutateAsync({
        taskId,
        status: completed ? "completed" : "pending",
      });
      toast({
        title: completed ? "Task completed" : "Task reopened",
        description: `Task has been marked as ${completed ? "completed" : "pending"}.`,
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to update task status.",
        variant: "destructive",
      });
    }
  };

  const handleSendReminder = () => {
    toast({
      title: "Reminder sent",
      description: `A reminder has been sent to ${employeeName}.`,
    });
  };

  const completedTasks = tasks.filter((t) => t.status === "completed").length;
  const totalTasks = tasks.length;

  // Convert tasks to legacy format for OnboardingTaskList
  const legacyTasks = tasks.map((task) => ({
    id: task.id,
    title: task.title,
    description: task.description || "",
    category: task.category,
    dueDate: task.due_date || "",
    assignedTo: task.assigned_to,
    status: task.status,
    completedAt: task.completed_at ? formatDisplayDate(task.completed_at) : null,
    completedBy: task.completed_by || null,
    required: task.is_required ?? true,
    order: task.task_order ?? 1,
  }));

  return (
    <DashboardLayout>
      <PageHeader
        title={employeeName}
        subtitle={`${employeePosition} • ${employeeDepartment} • ${record.workflow_name} Workflow`}
        breadcrumbs={[
          { label: "Employees", href: "/employees" },
          { label: "Onboarding" },
          { label: employeeName },
        ]}
        actions={
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-2xl sm:text-3xl font-bold text-primary">{progress}%</p>
              <p className="text-xs sm:text-sm text-muted-foreground">Complete</p>
            </div>
            <div className="w-24 sm:w-32">
              <Progress value={progress} className="h-3" />
              <p className="text-xs text-muted-foreground mt-1 text-center">
                {completedTasks} of {totalTasks} tasks
              </p>
            </div>
          </div>
        }
      >
        <div className="flex items-center gap-3">
          <Avatar className="w-12 h-12 sm:w-16 sm:h-16">
            <AvatarImage src={record.employee?.avatar_url || undefined} />
            <AvatarFallback className="text-base sm:text-lg">
              {record.employee
                ? `${record.employee.first_name[0]}${record.employee.last_name[0]}`
                : "?"}
            </AvatarFallback>
          </Avatar>
          <OnboardingStatusBadge status={record.status} />
        </div>
      </PageHeader>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Tasks */}
        <div className="lg:col-span-2 space-y-6">
          {/* Progress Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                Progress Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {Object.entries(categoryStats).map(([category, stats]) => {
                  const icons: Record<string, React.ElementType> = {
                    documentation: FileText,
                    training: GraduationCap,
                    setup: Settings,
                    introduction: Users,
                    compliance: Shield,
                  };
                  const Icon = icons[category];
                  const categoryProgress =
                    stats.total > 0
                      ? Math.round((stats.completed / stats.total) * 100)
                      : 0;

                  return (
                    <div key={category} className="text-center">
                      <div className="flex justify-center mb-2">
                        <div className="p-2 rounded-lg bg-muted">
                          <Icon className="w-4 h-4 text-muted-foreground" />
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground capitalize mb-1">
                        {category}
                      </p>
                      <p className="text-sm font-medium">
                        {stats.completed}/{stats.total}
                      </p>
                      <Progress value={categoryProgress} className="h-1 mt-1" />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Task Checklist */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Onboarding Checklist</CardTitle>
            </CardHeader>
            <CardContent>
              <OnboardingTaskList tasks={legacyTasks} onTaskToggle={handleTaskToggle} />
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleSendReminder}
              >
                <Send className="w-4 h-4 mr-2" />
                Send Reminder
              </Button>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5" />
                  <div>
                    <p className="text-sm font-medium">Start Date</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(record.start_date)}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-teal-500 mt-1.5" />
                  <div>
                    <p className="text-sm font-medium">Scheduled Completion</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(record.scheduled_completion)}
                    </p>
                  </div>
                </div>
                {record.completed_on && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
                    <div>
                      <p className="text-sm font-medium">Completed On</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(record.completed_on)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Workflow</span>
                  <span className="font-medium">{record.workflow_name}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Department</span>
                  <span className="font-medium">{employeeDepartment}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Position</span>
                  <span className="font-medium">{employeePosition}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Required Tasks</span>
                  <span className="font-medium">
                    {tasks.filter((t) => t.is_required).length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
