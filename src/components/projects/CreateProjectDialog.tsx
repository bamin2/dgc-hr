import { useState, useMemo } from "react";
import { CalendarIcon, Users } from "lucide-react";
import { format } from "date-fns";
import { ProjectStatus, ProjectPriority, projectStatuses, priorityConfig, getTeamMembers } from "@/data/projects";
import { mockEmployees } from "@/data/employees";
import { useRole } from "@/contexts/RoleContext";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultStatus?: ProjectStatus;
}

export function CreateProjectDialog({ open, onOpenChange, defaultStatus = 'todo' }: CreateProjectDialogProps) {
  const { currentUser } = useRole();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<ProjectStatus>(defaultStatus);
  const [priority, setPriority] = useState<ProjectPriority>("medium");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [assigneeIds, setAssigneeIds] = useState<string[]>([]);

  const teamMembers = useMemo(() => {
    return getTeamMembers(currentUser.id);
  }, [currentUser.id]);

  const handleSubmit = () => {
    if (!title.trim()) {
      toast.error("Please enter a project title");
      return;
    }
    if (!startDate || !endDate) {
      toast.error("Please select start and end dates");
      return;
    }

    toast.success("Project created successfully");
    onOpenChange(false);
    resetForm();
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setStatus(defaultStatus);
    setPriority("medium");
    setStartDate(undefined);
    setEndDate(undefined);
    setAssigneeIds([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Add a new project to track tasks and progress.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Title */}
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Project title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Description */}
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe the project..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          {/* Status and Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as ProjectStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(projectStatuses) as ProjectStatus[]).map((s) => (
                    <SelectItem key={s} value={s}>
                      {projectStatuses[s].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as ProjectPriority)}>
                <SelectTrigger>
                  <SelectValue>{priorityConfig[priority].label}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(priorityConfig) as ProjectPriority[]).map((p) => (
                    <SelectItem key={p} value={p}>
                      {priorityConfig[p].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Assignees */}
          <div className="grid gap-2">
            <Label>Assign To</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="justify-start text-left font-normal"
                >
                  <Users className="mr-2 h-4 w-4" />
                  {assigneeIds.length === 0 
                    ? "Select team members..."
                    : `${assigneeIds.length} team member${assigneeIds.length > 1 ? 's' : ''} selected`
                  }
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-2" align="start">
                <div className="space-y-1">
                  {teamMembers.map((employee) => (
                    <label 
                      key={employee.id}
                      className="flex items-center gap-3 p-2 hover:bg-muted rounded-md cursor-pointer"
                    >
                      <Checkbox
                        checked={assigneeIds.includes(employee.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setAssigneeIds(prev => [...prev, employee.id]);
                          } else {
                            setAssigneeIds(prev => prev.filter(id => id !== employee.id));
                          }
                        }}
                      />
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={employee.avatar} />
                        <AvatarFallback>{employee.firstName[0]}{employee.lastName[0]}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm">
                        {employee.firstName} {employee.lastName}
                      </span>
                    </label>
                  ))}
                  {teamMembers.length === 0 && (
                    <p className="text-sm text-muted-foreground p-2">
                      No team members found
                    </p>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "MMM dd, yyyy") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid gap-2">
              <Label>End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "MMM dd, yyyy") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Create Project</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
