import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const attendanceData = [
  {
    name: "Alex Thompson",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50",
    checkIn: "08:45 AM",
    status: "On Time",
  },
  {
    name: "Maria Garcia",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=50",
    checkIn: "09:02 AM",
    status: "On Time",
  },
  {
    name: "James Wilson",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50",
    checkIn: "09:18 AM",
    status: "Late",
  },
  {
    name: "Emma Brown",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50",
    checkIn: "--:--",
    status: "Absent",
  },
  {
    name: "David Lee",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=50",
    checkIn: "08:30 AM",
    status: "On Time",
  },
];

const statusStyles = {
  "On Time": "bg-success/10 text-success border-success/20",
  Late: "bg-warning/10 text-warning border-warning/20",
  Absent: "bg-destructive/10 text-destructive border-destructive/20",
};

export function AttendanceOverview() {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            Attendance Overview
          </h3>
          <p className="text-sm text-muted-foreground">Today's check-ins</p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-success" />
            <span className="text-muted-foreground">236 Present</span>
          </span>
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-destructive" />
            <span className="text-muted-foreground">12 Absent</span>
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {attendanceData.map((employee) => (
          <div
            key={employee.name}
            className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-secondary/30 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Avatar className="w-9 h-9">
                <AvatarImage src={employee.avatar} />
                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                  {employee.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {employee.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  Check-in: {employee.checkIn}
                </p>
              </div>
            </div>
            <Badge
              variant="outline"
              className={cn(
                "text-xs font-medium",
                statusStyles[employee.status as keyof typeof statusStyles]
              )}
            >
              {employee.status}
            </Badge>
          </div>
        ))}
      </div>
    </Card>
  );
}