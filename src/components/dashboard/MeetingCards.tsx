import { Video, MapPin, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useCalendarEvents, getParticipantsFromEvent } from "@/hooks/useCalendarEvents";
import { format, startOfDay, endOfDay } from "date-fns";

export function MeetingCards() {
  const today = new Date();
  const { data: events, isLoading } = useCalendarEvents(startOfDay(today), endOfDay(today));

  // Filter for meetings only and sort by start time
  const meetings = (events || [])
    .filter(e => e.type === 'meeting')
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

  // Find the next meeting (first one that hasn't ended yet)
  const now = new Date();
  const nextMeetingIndex = meetings.findIndex(m => new Date(m.end_time) > now);

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Skeleton className="h-6 w-36 mb-1" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-8 w-16" />
        </div>
        <div className="space-y-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="p-4 rounded-xl bg-secondary/30">
              <Skeleton className="h-5 w-40 mb-2" />
              <Skeleton className="h-4 w-32 mb-3" />
              <div className="flex items-center justify-between">
                <div className="flex -space-x-2">
                  {[...Array(3)].map((_, j) => (
                    <Skeleton key={j} className="w-7 h-7 rounded-full" />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            Upcoming Meetings
          </h3>
          <p className="text-sm text-muted-foreground">Today's schedule</p>
        </div>
        <Button variant="outline" size="sm" className="text-xs">
          View All
        </Button>
      </div>

      <div className="space-y-4">
        {meetings.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">
            No meetings scheduled for today
          </p>
        ) : (
          meetings.slice(0, 3).map((meeting, index) => {
            const isNext = index === nextMeetingIndex;
            const participants = getParticipantsFromEvent(meeting);
            const isVideoMeeting = meeting.platform && meeting.platform !== 'in-person';
            
            return (
              <div
                key={meeting.id}
                className={cn(
                  "p-4 rounded-xl transition-all",
                  isNext
                    ? "bg-primary/5 border-2 border-primary/20"
                    : "bg-secondary/30"
                )}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {isNext && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-primary text-primary-foreground rounded">
                          Next
                        </span>
                      )}
                      <h4 className="font-medium text-foreground">{meeting.title}</h4>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {format(new Date(meeting.start_time), 'h:mm a')} - {format(new Date(meeting.end_time), 'h:mm a')}
                      </span>
                      {isVideoMeeting ? (
                        <span className="flex items-center gap-1">
                          <Video className="w-3 h-3" />
                          Video Call
                        </span>
                      ) : meeting.location ? (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {meeting.location}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {participants.slice(0, 4).map((participant, i) => (
                      <Avatar key={participant.id || i} className="w-7 h-7 border-2 border-card">
                        <AvatarImage src={participant.avatar || undefined} />
                        <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                          {participant.name?.split(' ').map(n => n[0]).join('') || 'P'}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                    {participants.length > 4 && (
                      <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-medium border-2 border-card">
                        +{participants.length - 4}
                      </div>
                    )}
                    {participants.length === 0 && (
                      <span className="text-xs text-muted-foreground">No participants</span>
                    )}
                  </div>
                  {isNext && (
                    <Button size="sm" className="text-xs">
                      Join Now
                    </Button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
}
