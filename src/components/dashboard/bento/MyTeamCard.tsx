import { useNavigate } from "react-router-dom";
import { Users, ArrowRight, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { BentoCard } from "./BentoCard";
import { useTeamDashboard } from "@/hooks/useTeamDashboard";
import { useRole } from "@/contexts/RoleContext";
import { format } from "date-fns";

export function MyTeamCard() {
  const navigate = useNavigate();
  const { effectiveTeamMemberIds } = useRole();
  const { data, isLoading } = useTeamDashboard(effectiveTeamMemberIds);

  if (isLoading) {
    return (
      <BentoCard colSpan={4}>
        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="w-5 h-5 rounded" />
          <Skeleton className="h-5 w-20" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-9 w-full rounded-full" />
        </div>
      </BentoCard>
    );
  }

  const teamSize = data?.teamMemberCount || 0;
  const upcomingTimeOff = data?.upcomingTimeOff || [];

  return (
    <BentoCard colSpan={4}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">My Team</h3>
        </div>
        <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-secondary text-muted-foreground">
          {teamSize} members
        </span>
      </div>

      {/* Who's out */}
      <div className="space-y-2 mb-4">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Upcoming Time Off
        </p>
        
        {upcomingTimeOff.length === 0 ? (
          <div className="bg-secondary/30 rounded-xl p-3 text-center">
            <p className="text-sm text-muted-foreground">No one is out soon</p>
          </div>
        ) : (
          <div className="space-y-2">
            {upcomingTimeOff.slice(0, 2).map((timeOff, index) => {
              // Parse the employee name to get initials
              const nameParts = timeOff.employeeName.split(" ");
              const initials = nameParts.length >= 2 
                ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`
                : timeOff.employeeName.slice(0, 2).toUpperCase();

              return (
                <div 
                  key={`${timeOff.employeeId}-${index}`} 
                  className="flex items-center gap-3 bg-secondary/30 rounded-xl p-2.5"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs bg-primary/10 text-primary">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {timeOff.employeeName}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      <span>
                        {format(new Date(timeOff.startDate), "MMM d")} - {format(new Date(timeOff.endDate), "MMM d")}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Button 
        variant="outline" 
        className="w-full rounded-full gap-2"
        onClick={() => navigate("/employees")}
      >
        Open Directory
        <ArrowRight className="w-4 h-4" />
      </Button>
    </BentoCard>
  );
}
