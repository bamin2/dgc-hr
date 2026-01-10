import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  CalendarEvent,
  getOrganizerFromEvent,
  getParticipantsFromEvent,
  useDeleteCalendarEvent,
} from "@/hooks/useCalendarEvents";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Video,
  MessageSquare,
  Monitor,
  Edit,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface EventDetailSheetProps {
  event: CalendarEvent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const platformIcons: Record<string, React.ReactNode> = {
  zoom: <Video className="h-4 w-4" />,
  meet: <Video className="h-4 w-4" />,
  slack: <MessageSquare className="h-4 w-4" />,
  teams: <Monitor className="h-4 w-4" />,
  "in-person": <MapPin className="h-4 w-4" />,
};

const platformLabels: Record<string, string> = {
  zoom: "Zoom Meeting",
  meet: "Google Meet",
  slack: "Slack Huddle",
  teams: "Microsoft Teams",
  "in-person": "In Person",
};

const colorStyles: Record<string, string> = {
  green: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200",
  orange: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200",
  coral: "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-200",
  mint: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-200",
  gold: "bg-[#C6A45E]/20 text-[#8B7035] dark:bg-[#C6A45E]/10 dark:text-[#C6A45E]",
  sage: "bg-[#6B8E7B]/20 text-[#4A6B5D] dark:bg-[#6B8E7B]/10 dark:text-[#6B8E7B]",
  // Legacy mappings
  blue: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-200",
  purple: "bg-[#C6A45E]/20 text-[#8B7035] dark:bg-[#C6A45E]/10 dark:text-[#C6A45E]",
};

export function EventDetailSheet({
  event,
  open,
  onOpenChange,
}: EventDetailSheetProps) {
  const deleteEvent = useDeleteCalendarEvent();

  if (!event) return null;

  const organizer = getOrganizerFromEvent(event);
  const participants = getParticipantsFromEvent(event);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

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

  const handleJoin = () => {
    toast.info("Joining meeting...", { description: "This will be available with Outlook integration" });
  };

  const handleEdit = () => {
    toast.info("Edit mode", { description: "Event editing coming soon" });
  };

  const handleDelete = async () => {
    try {
      await deleteEvent.mutateAsync(event.id);
      toast.success("Event deleted");
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to delete event");
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[440px]">
        <SheetHeader>
          <div className="flex items-start justify-between">
            <Badge className={cn("capitalize", colorStyles[event.color])}>
              {event.type}
            </Badge>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleEdit}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-destructive" 
                onClick={handleDelete}
                disabled={deleteEvent.isPending}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <SheetTitle className="text-xl">{event.title}</SheetTitle>
          <SheetDescription>{event.description}</SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Date and Time */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{formatDate(event.start_time)}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>
                {formatTime(event.start_time)} - {formatTime(event.end_time)}
              </span>
            </div>
            {event.platform && (
              <div className="flex items-center gap-3 text-sm">
                {platformIcons[event.platform]}
                <span>{platformLabels[event.platform]}</span>
              </div>
            )}
            {event.location && (
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{event.location}</span>
              </div>
            )}
          </div>

          <Separator />

          {/* Organizer */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">Organizer</h4>
            {organizer && (
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={organizer.avatar || undefined} />
                  <AvatarFallback>{getInitials(organizer.name)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{organizer.name}</p>
                  <p className="text-xs text-muted-foreground">{organizer.position}</p>
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Participants */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <h4 className="text-sm font-medium text-muted-foreground">
                Participants ({participants.length})
              </h4>
            </div>
            <div className="space-y-2 max-h-48 overflow-auto">
              {participants.map((participant) => (
                <div key={participant.id} className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={participant.avatar || undefined} />
                    <AvatarFallback className="text-xs">
                      {getInitials(participant.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm">{participant.name}</p>
                    <p className="text-xs text-muted-foreground">{participant.department}</p>
                  </div>
                </div>
              ))}
              {participants.length === 0 && (
                <p className="text-sm text-muted-foreground">No participants added</p>
              )}
            </div>
          </div>

          <Separator />

          {/* Actions */}
          <div className="flex gap-2">
            <Button className="flex-1 gap-2" onClick={handleJoin}>
              <ExternalLink className="h-4 w-4" />
              Join Meeting
            </Button>
            <Button variant="outline" className="flex-1">
              Add to Calendar
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
