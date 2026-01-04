import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Sidebar, Header } from "@/components/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { mockOnboardingRecords, OnboardingTask } from "@/data/onboarding";
import {
  OnboardingStatusBadge,
  OnboardingTaskList,
} from "@/components/employees";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Calendar,
  Send,
  RotateCcw,
  FileText,
  GraduationCap,
  Settings,
  Users,
  Shield,
} from "lucide-react";

export default function OnboardingDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const record = mockOnboardingRecords.find((r) => r.id === id);
  
  const [tasks, setTasks] = useState<OnboardingTask[]>(record?.tasks || []);

  const progress = useMemo(() => {
    if (tasks.length === 0) return 0;
    const completed = tasks.filter((t) => t.status === "completed").length;
    return Math.round((completed / tasks.length) * 100);
  }, [tasks]);

  const categoryStats = useMemo(() => {
    const stats = {
      documentation: { total: 0, completed: 0 },
      training: { total: 0, completed: 0 },
      setup: { total: 0, completed: 0 },
      introduction: { total: 0, completed: 0 },
      compliance: { total: 0, completed: 0 },
    };

    tasks.forEach((task) => {
      stats[task.category].total++;
      if (task.status === "completed") {
        stats[task.category].completed++;
      }
    });

    return stats;
  }, [tasks]);

  if (!record) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 p-6">
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
          </main>
        </div>
      </div>
    );
  }

  const handleTaskToggle = (taskId: string, completed: boolean) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? {
              ...task,
              status: completed ? "completed" : "pending",
              completedAt: completed ? new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }) : null,
              completedBy: completed ? "HR Admin" : null,
            }
          : task
      )
    );
    toast({
      title: completed ? "Task completed" : "Task reopened",
      description: `Task has been marked as ${completed ? "completed" : "pending"}.`,
    });
  };

  const handleMarkAllComplete = () => {
    setTasks((prev) =>
      prev.map((task) => ({
        ...task,
        status: "completed",
        completedAt: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
        completedBy: "HR Admin",
      }))
    );
    toast({
      title: "All tasks completed",
      description: "All onboarding tasks have been marked as complete.",
    });
  };

  const handleSendReminder = () => {
    toast({
      title: "Reminder sent",
      description: `A reminder has been sent to ${record.employeeName}.`,
    });
  };

  const handleResetProgress = () => {
    setTasks((prev) =>
      prev.map((task) => ({
        ...task,
        status: "pending",
        completedAt: null,
        completedBy: null,
      }))
    );
    toast({
      title: "Progress reset",
      description: "All tasks have been reset to pending status.",
    });
  };

  const completedTasks = tasks.filter((t) => t.status === "completed").length;
  const totalTasks = tasks.length;

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 overflow-auto">
          {/* Header */}
          <div className="mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/employees")}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Employees
            </Button>

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={record.employeeAvatar} />
                  <AvatarFallback className="text-lg">
                    {record.employeeName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-2xl font-bold">{record.employeeName}</h1>
                  <p className="text-muted-foreground">
                    {record.employeePosition} • {record.employeeDepartment}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <OnboardingStatusBadge status={record.status} />
                    <span className="text-sm text-muted-foreground">
                      • {record.workflow} Workflow
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-3xl font-bold text-primary">{progress}%</p>
                  <p className="text-sm text-muted-foreground">Complete</p>
                </div>
                <div className="w-32">
                  <Progress value={progress} className="h-3" />
                  <p className="text-xs text-muted-foreground mt-1 text-center">
                    {completedTasks} of {totalTasks} tasks
                  </p>
                </div>
              </div>
            </div>
          </div>

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
                      const categoryProgress = stats.total > 0 
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
                  <OnboardingTaskList tasks={tasks} onTaskToggle={handleTaskToggle} />
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
                    onClick={handleMarkAllComplete}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Mark All Complete
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={handleSendReminder}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Send Reminder
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-destructive hover:text-destructive"
                    onClick={handleResetProgress}
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset Progress
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
                          {record.startDate}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5" />
                      <div>
                        <p className="text-sm font-medium">Scheduled Completion</p>
                        <p className="text-sm text-muted-foreground">
                          {record.scheduledOn}
                        </p>
                      </div>
                    </div>
                    {record.completedOn && (
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
                        <div>
                          <p className="text-sm font-medium">Completed On</p>
                          <p className="text-sm text-muted-foreground">
                            {record.completedOn}
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
                      <span className="font-medium">{record.workflow}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Department</span>
                      <span className="font-medium">{record.employeeDepartment}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Position</span>
                      <span className="font-medium">{record.employeePosition}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Required Tasks</span>
                      <span className="font-medium">
                        {tasks.filter((t) => t.required).length}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
