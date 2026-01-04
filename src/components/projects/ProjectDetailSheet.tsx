import { Calendar, MessageSquare, Paperclip, Clock, User } from "lucide-react";
import { format } from "date-fns";
import { Project, ProjectActivity, projectStatuses, getProjectAssignees } from "@/data/projects";
import { PriorityBadge } from "./PriorityBadge";
import { ActivityLog } from "./ActivityLog";
import { AddCommentForm } from "./AddCommentForm";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { toast } from "sonner";

interface ProjectDetailSheetProps {
  project: Project | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddComment?: (projectId: string, comment: string, mentionedUserIds: string[]) => void;
}

export function ProjectDetailSheet({ project, open, onOpenChange, onAddComment }: ProjectDetailSheetProps) {
  if (!project) return null;

  const assignees = getProjectAssignees(project);
  const statusConfig = projectStatuses[project.status];

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  const handleEdit = () => {
    toast.info("Edit functionality coming soon");
  };

  const handleDelete = () => {
    toast.success("Project deleted");
    onOpenChange(false);
  };

  const handleAddComment = (comment: string, mentionedUserIds: string[]) => {
    if (onAddComment) {
      onAddComment(project.id, comment, mentionedUserIds);
      toast.success("Comment added");
    } else {
      toast.info("Comment functionality not connected");
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[480px] overflow-y-auto">
        <SheetHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <SheetTitle className="text-xl mb-2">{project.title}</SheetTitle>
              <SheetDescription>{project.description}</SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <Separator className="my-4" />

        {/* Status and Priority */}
        <div className="flex items-center gap-4 mb-6">
          <Badge variant="outline" className="capitalize">
            {statusConfig.label}
          </Badge>
          <PriorityBadge priority={project.priority} />
        </div>

        {/* Dates */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Due Date</p>
              <p className="text-sm font-medium">{format(project.dueDate, "MMMM dd, yyyy")}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
              <Clock className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Timeline</p>
              <p className="text-sm font-medium">
                {format(project.startDate, "MMM dd")} - {format(project.endDate, "MMM dd, yyyy")}
              </p>
            </div>
          </div>
        </div>

        <Separator className="my-4" />

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <MessageSquare className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-lg font-semibold">{project.commentsCount}</p>
              <p className="text-xs text-muted-foreground">Comments</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <Paperclip className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-lg font-semibold">{project.attachmentsCount}</p>
              <p className="text-xs text-muted-foreground">Attachments</p>
            </div>
          </div>
        </div>

        <Separator className="my-4" />

        {/* Assignees */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Assignees ({assignees.length})</span>
          </div>
          <div className="space-y-2">
            {assignees.map((assignee) => (
              <div key={assignee.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={assignee.avatar} alt={`${assignee.firstName} ${assignee.lastName}`} />
                  <AvatarFallback className="text-xs">
                    {getInitials(assignee.firstName, assignee.lastName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{assignee.firstName} {assignee.lastName}</p>
                  <p className="text-xs text-muted-foreground">{assignee.position}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Separator className="my-4" />

        {/* Activity Log */}
        <div className="mb-6">
          <ActivityLog activities={project.activities} />
        </div>

        <Separator className="my-4" />

        {/* Add Comment */}
        <div className="mb-6">
          <AddCommentForm onSubmit={handleAddComment} />
        </div>

        <Separator className="my-4" />

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={handleEdit}>
            Edit Project
          </Button>
          <Button variant="destructive" className="flex-1" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
