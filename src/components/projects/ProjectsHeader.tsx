import { UserPlus } from "lucide-react";
import { mockEmployees } from "@/data/employees";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function ProjectsHeader() {
  const displayedMembers = mockEmployees.slice(0, 4);

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  const handleInvite = () => {
    toast.success("Invitation sent successfully");
  };

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Projects</h1>
        <p className="text-sm text-muted-foreground">Manage your all employee</p>
      </div>
      
      <div className="flex items-center gap-4">
        {/* Team avatars */}
        <div className="flex -space-x-2">
          {displayedMembers.map((member) => (
            <Avatar key={member.id} className="h-8 w-8 border-2 border-background">
              <AvatarImage src={member.avatar} alt={`${member.firstName} ${member.lastName}`} />
              <AvatarFallback className="text-xs">
                {getInitials(member.firstName, member.lastName)}
              </AvatarFallback>
            </Avatar>
          ))}
        </div>

        <Button onClick={handleInvite} className="gap-2">
          <UserPlus className="h-4 w-4" />
          Invite
        </Button>
      </div>
    </div>
  );
}
