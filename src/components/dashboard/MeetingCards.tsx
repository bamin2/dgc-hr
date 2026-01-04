import { Video, MapPin, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const meetings = [
  {
    id: 1,
    title: "Product Roadmap Review",
    time: "10:00 AM - 11:00 AM",
    type: "video",
    participants: [
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=50",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50",
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50",
    ],
    isNext: true,
  },
  {
    id: 2,
    title: "Candidate Interview",
    time: "2:00 PM - 3:00 PM",
    type: "in-person",
    location: "Meeting Room B",
    participants: [
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50",
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=50",
    ],
    isNext: false,
  },
];

export function MeetingCards() {
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
        {meetings.map((meeting) => (
          <div
            key={meeting.id}
            className={cn(
              "p-4 rounded-xl transition-all",
              meeting.isNext
                ? "bg-primary/5 border-2 border-primary/20"
                : "bg-secondary/30"
            )}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {meeting.isNext && (
                    <span className="px-2 py-0.5 text-xs font-medium bg-primary text-primary-foreground rounded">
                      Next
                    </span>
                  )}
                  <h4 className="font-medium text-foreground">{meeting.title}</h4>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {meeting.time}
                  </span>
                  {meeting.type === "video" ? (
                    <span className="flex items-center gap-1">
                      <Video className="w-3 h-3" />
                      Video Call
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {meeting.location}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex -space-x-2">
                {meeting.participants.map((avatar, i) => (
                  <Avatar key={i} className="w-7 h-7 border-2 border-card">
                    <AvatarImage src={avatar} />
                    <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                      P{i + 1}
                    </AvatarFallback>
                  </Avatar>
                ))}
              </div>
              {meeting.isNext && (
                <Button size="sm" className="text-xs">
                  Join Now
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}