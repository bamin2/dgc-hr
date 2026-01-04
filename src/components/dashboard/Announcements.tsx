import { Megaphone, Gift, Calendar, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const announcements = [
  {
    id: 1,
    title: "Year-End Party",
    description: "Join us for the annual celebration on Dec 22nd!",
    icon: Gift,
    color: "primary",
    time: "2 hours ago",
  },
  {
    id: 2,
    title: "Holiday Schedule",
    description: "Office closed Dec 25-26 and Jan 1st",
    icon: Calendar,
    color: "info",
    time: "1 day ago",
  },
  {
    id: 3,
    title: "Benefits Enrollment Deadline",
    description: "Complete your enrollment by Dec 15th",
    icon: AlertCircle,
    color: "warning",
    time: "2 days ago",
  },
];

const iconColors = {
  primary: "bg-primary/10 text-primary",
  info: "bg-info/10 text-info",
  warning: "bg-warning/10 text-warning",
  success: "bg-success/10 text-success",
};

export function Announcements() {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Megaphone className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">
            Announcements
          </h3>
        </div>
        <span className="text-xs text-muted-foreground">3 new</span>
      </div>

      <div className="space-y-4">
        {announcements.map((announcement) => (
          <div
            key={announcement.id}
            className="flex items-start gap-3 p-3 rounded-xl hover:bg-secondary/30 transition-colors cursor-pointer"
          >
            <div
              className={cn(
                "p-2.5 rounded-lg shrink-0",
                iconColors[announcement.color as keyof typeof iconColors]
              )}
            >
              <announcement.icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-foreground mb-0.5">
                {announcement.title}
              </h4>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {announcement.description}
              </p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                {announcement.time}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}