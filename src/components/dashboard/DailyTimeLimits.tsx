import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const teamMembers = [
  {
    name: "John Cooper",
    role: "Senior Developer",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50",
    hours: 7.5,
    maxHours: 8,
    status: "online",
  },
  {
    name: "Sarah Miller",
    role: "UI Designer",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=50",
    hours: 6.2,
    maxHours: 8,
    status: "online",
  },
  {
    name: "Mike Johnson",
    role: "Project Manager",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50",
    hours: 8.5,
    maxHours: 8,
    status: "away",
  },
  {
    name: "Emily Davis",
    role: "HR Specialist",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50",
    hours: 5.0,
    maxHours: 8,
    status: "offline",
  },
];

export function DailyTimeLimits() {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            Daily Time Limits
          </h3>
          <p className="text-sm text-muted-foreground">Team work hours today</p>
        </div>
      </div>

      <div className="space-y-4">
        {teamMembers.map((member) => {
          const percentage = Math.min((member.hours / member.maxHours) * 100, 100);
          const isOvertime = member.hours > member.maxHours;

          return (
            <div key={member.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="w-9 h-9">
                      <AvatarImage src={member.avatar} />
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {member.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <span
                      className={cn(
                        "absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-card",
                        member.status === "online" && "bg-success",
                        member.status === "away" && "bg-warning",
                        member.status === "offline" && "bg-muted-foreground"
                      )}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {member.name}
                    </p>
                    <p className="text-xs text-muted-foreground">{member.role}</p>
                  </div>
                </div>
                <p
                  className={cn(
                    "text-sm font-semibold",
                    isOvertime ? "text-warning" : "text-foreground"
                  )}
                >
                  {member.hours}h / {member.maxHours}h
                </p>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    isOvertime ? "bg-warning" : "bg-primary"
                  )}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}