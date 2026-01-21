import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { HierarchicalCalendar } from "@/components/ui/hierarchical-calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useEmployees } from "@/hooks/useEmployees";
import { 
  EventColor, 
  EventPlatform, 
  EventType,
  useCreateCalendarEvent,
} from "@/hooks/useCalendarEvents";
import { toast } from "sonner";

interface CreateEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const eventColors: { value: EventColor; label: string; class: string }[] = [
  { value: "green", label: "Green", class: "bg-emerald-500" },
  { value: "orange", label: "Orange", class: "bg-orange-500" },
  { value: "coral", label: "Coral", class: "bg-rose-400" },
  { value: "mint", label: "Mint", class: "bg-teal-400" },
  { value: "blue", label: "Teal", class: "bg-teal-600" },
  { value: "purple", label: "Gold", class: "bg-[#C6A45E]" },
];

export function CreateEventDialog({ open, onOpenChange }: CreateEventDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState<Date>();
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [eventType, setEventType] = useState<EventType>("meeting");
  const [platform, setPlatform] = useState<EventPlatform>("zoom");
  const [color, setColor] = useState<EventColor>("green");
  const [organizer, setOrganizer] = useState("");

  const { data: employees = [] } = useEmployees();
  const createEvent = useCreateCalendarEvent();

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setDate(undefined);
    setStartTime("09:00");
    setEndTime("10:00");
    setEventType("meeting");
    setPlatform("zoom");
    setColor("green");
    setOrganizer("");
  };

  const handleSubmit = async () => {
    if (!title || !date || !organizer) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Construct start and end times
    const [startHour, startMin] = startTime.split(":").map(Number);
    const [endHour, endMin] = endTime.split(":").map(Number);

    const startDateTime = new Date(date);
    startDateTime.setHours(startHour, startMin, 0, 0);

    const endDateTime = new Date(date);
    endDateTime.setHours(endHour, endMin, 0, 0);

    try {
      await createEvent.mutateAsync({
        title,
        description: description || undefined,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        type: eventType,
        platform,
        color,
        organizer_id: organizer,
      });
      
      toast.success("Event created successfully!");
      onOpenChange(false);
      resetForm();
    } catch (error) {
      toast.error("Failed to create event");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="xl">
        <DialogHeader>
          <DialogTitle>Create New Event</DialogTitle>
          <DialogDescription>
            Add a new event or meeting to your calendar.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Event Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter event title"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter event description"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <HierarchicalCalendar
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid gap-2">
              <Label>Event Type</Label>
              <Select value={eventType} onValueChange={(v) => setEventType(v as EventType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="event">Event</SelectItem>
                  <SelectItem value="reminder">Reminder</SelectItem>
                  <SelectItem value="task">Task</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Platform</Label>
              <Select value={platform} onValueChange={(v) => setPlatform(v as EventPlatform)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="zoom">Zoom</SelectItem>
                  <SelectItem value="meet">Google Meet</SelectItem>
                  <SelectItem value="teams">Microsoft Teams</SelectItem>
                  <SelectItem value="slack">Slack</SelectItem>
                  <SelectItem value="in-person">In Person</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Color</Label>
              <Select value={color} onValueChange={(v) => setColor(v as EventColor)}>
                <SelectTrigger>
                  <SelectValue>
                    <div className="flex items-center gap-2">
                      <div className={cn("h-3 w-3 rounded-full", eventColors.find(c => c.value === color)?.class)} />
                      {eventColors.find(c => c.value === color)?.label}
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {eventColors.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      <div className="flex items-center gap-2">
                        <div className={cn("h-3 w-3 rounded-full", c.class)} />
                        {c.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Organizer *</Label>
            <Select value={organizer} onValueChange={setOrganizer}>
              <SelectTrigger>
                <SelectValue placeholder="Select organizer" />
              </SelectTrigger>
              <SelectContent>
                {employees.map((emp) => (
                  <SelectItem key={emp.id} value={emp.id}>
                    {emp.firstName} {emp.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={createEvent.isPending}>
            {createEvent.isPending ? "Creating..." : "Create Event"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
