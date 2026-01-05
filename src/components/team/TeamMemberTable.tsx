import { MoreHorizontal, Trash2, Edit } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TeamMember } from "@/data/team";
import { TeamMemberStatusBadge } from "./TeamMemberStatusBadge";
import { TeamEmployeeTypeBadge } from "./TeamEmployeeTypeBadge";

interface TeamMemberTableProps {
  members: TeamMember[];
  selectedMembers: string[];
  onSelectionChange: (ids: string[]) => void;
  onEdit: (member: TeamMember) => void;
  onDelete: (member: TeamMember) => void;
}

export function TeamMemberTable({
  members,
  selectedMembers,
  onSelectionChange,
  onEdit,
  onDelete,
}: TeamMemberTableProps) {
  const navigate = useNavigate();

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
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
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
                {format(new Date(member.startDate), "MMM dd, yyyy")}
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
                    <DropdownMenuItem onClick={() => onEdit(member)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDelete(member)}
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
    </div>
  );
}
