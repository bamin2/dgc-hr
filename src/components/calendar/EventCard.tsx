import { CalendarEvent, getOrganizerFromEvent, getParticipantsFromEvent } from "@/hooks/useCalendarEvents";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Video, MessageSquare, Users, Monitor } from "lucide-react";

interface EventCardProps {
  event: CalendarEvent;
  onClick?: () => void;
}

const colorStyles: Record<string, { bg: string; border: string; text: string }> = {
  green: {
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    border: "border-l-emerald-500",
    text: "text-emerald-900 dark:text-emerald-100",
  },
  orange: {
    bg: "bg-orange-50 dark:bg-orange-950/30",
    border: "border-l-orange-500",
    text: "text-orange-900 dark:text-orange-100",
  },
  coral: {
    bg: "bg-rose-50 dark:bg-rose-950/30",
    border: "border-l-rose-400",
    text: "text-rose-900 dark:text-rose-100",
  },
  mint: {
    bg: "bg-teal-50 dark:bg-teal-950/30",
    border: "border-l-teal-500",
    text: "text-teal-900 dark:text-teal-100",
  },
  blue: {
    bg: "bg-blue-50 dark:bg-blue-950/30",
    border: "border-l-blue-500",
    text: "text-blue-900 dark:text-blue-100",
  },
  purple: {
    bg: "bg-purple-50 dark:bg-purple-950/30",
    border: "border-l-purple-500",
    text: "text-purple-900 dark:text-purple-100",
  },
};

const platformIcons: Record<string, React.ReactNode> = {
  zoom: <Video className="h-3 w-3" />,
  meet: <Video className="h-3 w-3" />,
  slack: <MessageSquare className="h-3 w-3" />,
  teams: <Monitor className="h-3 w-3" />,
  "in-person": <Users className="h-3 w-3" />,
};

const platformLabels: Record<string, string> = {
  zoom: "Zoom",
  meet: "Google Meet",
  slack: "Slack",
  teams: "Teams",
  "in-person": "In Person",
};

export function EventCard({ event, onClick }: EventCardProps) {
  const organizer = getOrganizerFromEvent(event);
  const participants = getParticipantsFromEvent(event);
  const styles = colorStyles[event.color] || colorStyles.green;
  const visibleParticipants = participants.slice(0, 3);
  const remainingCount = participants.length - 3;

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-lg border-l-4 p-2.5 cursor-pointer transition-all hover:shadow-md h-full overflow-hidden",
        styles.bg,
        styles.border
      )}
    >
      {/* Organizer */}
      <div className="flex items-center gap-1.5 mb-1">
        <Avatar className="h-4 w-4">
          <AvatarImage src={organizer?.avatar || undefined} />
          <AvatarFallback className="text-[8px] bg-muted">
            {organizer ? getInitials(organizer.name) : "?"}
          </AvatarFallback>
        </Avatar>
        <span className={cn("text-[10px] font-medium truncate", styles.text)}>
          {organizer?.name}
        </span>
      </div>

      {/* Title */}
      <h4 className={cn("text-xs font-semibold truncate mb-0.5", styles.text)}>
        {event.title}
      </h4>

      {/* Time */}
      <p className="text-[10px] text-muted-foreground mb-1.5">
        {formatTime(event.start_time)} - {formatTime(event.end_time)}
      </p>

      {/* Participants and Platform */}
      <div className="flex items-center justify-between">
        <div className="flex items-center -space-x-1">
          {visibleParticipants.map((participant) => (
            <Avatar key={participant.id} className="h-5 w-5 border border-background">
              <AvatarImage src={participant.avatar || undefined} />
              <AvatarFallback className="text-[8px] bg-muted">
                {getInitials(participant.name)}
              </AvatarFallback>
            </Avatar>
          ))}
          {remainingCount > 0 && (
            <div className="h-5 w-5 rounded-full bg-muted border border-background flex items-center justify-center">
              <span className="text-[8px] font-medium text-muted-foreground">
                +{remainingCount}
              </span>
            </div>
          )}
        </div>

        {event.platform && (
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            {platformIcons[event.platform]}
            <span>{platformLabels[event.platform]}</span>
          </div>
        )}
      </div>
    </div>
  );
}
