import { useState } from "react";
import { MoreHorizontal, Trash2, Edit, UserPlus, UserMinus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format, isValid, parseISO } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { TeamMember } from "@/hooks/useTeamMembers";
import { TeamMemberStatusBadge } from "./TeamMemberStatusBadge";
import { TeamEmployeeTypeBadge } from "./TeamEmployeeTypeBadge";

interface TeamMemberTableProps {
  members: TeamMember[];
  selectedMembers: string[];
  onSelectionChange: (ids: string[]) => void;
  onEdit: (member: TeamMember) => void;
  onDelete: (member: TeamMember) => void;
  onStartOnboarding: (member: TeamMember) => void;
  onStartOffboarding: (member: TeamMember) => void;
}

export function TeamMemberTable({
  members,
  selectedMembers,
  onSelectionChange,
  onEdit,
  onDelete,
  onStartOnboarding,
  onStartOffboarding,
}: TeamMemberTableProps) {
  const navigate = useNavigate();
  const [memberToDelete, setMemberToDelete] = useState<TeamMember | null>(null);
  const [memberToOnboard, setMemberToOnboard] = useState<TeamMember | null>(null);
  const [memberToOffboard, setMemberToOffboard] = useState<TeamMember | null>(null);

  const toggleAll = () => {
    if (selectedMembers.length === members.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(members.map((m) => m.id));
    }
  };

  const toggleOne = (id: string) => {
    if (selectedMembers.includes(id)) {
      onSelectionChange(selectedMembers.filter((i) => i !== id));
    } else {
      onSelectionChange([...selectedMembers, id]);
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    const first = firstName?.[0] || '';
    const last = lastName?.[0] || '';
    return `${first}${last}`.toUpperCase() || '??';
  };

  const formatDate = (dateString: string | undefined | null): string => {
    if (!dateString) return "Not set";
    try {
      const date = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString);
      if (!isValid(date)) return "Not set";
      return format(date, "MMM dd, yyyy");
    } catch {
      return "Not set";
    }
  };

  return (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-12">
              <Checkbox
                checked={selectedMembers.length === members.length && members.length > 0}
                onCheckedChange={toggleAll}
              />
            </TableHead>
            <TableHead>Member Name</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Job Title</TableHead>
            <TableHead>Employee Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-12">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member) => (
            <TableRow key={member.id} className="group">
              <TableCell>
                <Checkbox
                  checked={selectedMembers.includes(member.id)}
                  onCheckedChange={() => toggleOne(member.id)}
                />
              </TableCell>
              <TableCell>
                <div
                  className="flex items-center gap-3 cursor-pointer hover:opacity-80"
                  onClick={() => navigate(`/employees/${member.id}`)}
                >
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={member.avatar} />
                    <AvatarFallback className="text-xs bg-primary/10 text-primary">
                      {getInitials(member.firstName, member.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-foreground">
                      {member.firstName} {member.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">{member.email}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatDate(member.startDate)}
              </TableCell>
              <TableCell className="text-muted-foreground">{member.department}</TableCell>
              <TableCell className="text-muted-foreground">{member.jobTitle}</TableCell>
              <TableCell>
                <TeamEmployeeTypeBadge type={member.employmentType} />
              </TableCell>
              <TableCell>
                <TeamMemberStatusBadge status={member.status} />
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setMemberToOnboard(member)}>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Start onboarding
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setMemberToOffboard(member)}>
                      <UserMinus className="h-4 w-4 mr-2" />
                      Start offboarding
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit(member)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setMemberToDelete(member)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <AlertDialog 
        open={!!memberToDelete} 
        onOpenChange={(open) => !open && setMemberToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Team Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {memberToDelete?.firstName} {memberToDelete?.lastName}? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (memberToDelete) {
                  onDelete(memberToDelete);
                }
                setMemberToDelete(null);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog 
        open={!!memberToOnboard} 
        onOpenChange={(open) => !open && setMemberToOnboard(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Start Onboarding</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to start the onboarding process for {memberToOnboard?.firstName} {memberToOnboard?.lastName}. 
              This will initiate the onboarding workflow and send notifications to relevant team members.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (memberToOnboard) {
                  onStartOnboarding(memberToOnboard);
                }
                setMemberToOnboard(null);
              }}
            >
              Start Onboarding
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog 
        open={!!memberToOffboard} 
        onOpenChange={(open) => !open && setMemberToOffboard(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Start Offboarding</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to start the offboarding process for {memberToOffboard?.firstName} {memberToOffboard?.lastName}. 
              This will initiate the offboarding workflow including exit interviews, asset returns, and access revocation.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (memberToOffboard) {
                  onStartOffboarding(memberToOffboard);
                }
                setMemberToOffboard(null);
              }}
              className="bg-orange-600 text-white hover:bg-orange-700"
            >
              Start Offboarding
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
