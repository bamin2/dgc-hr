import { useState } from "react";
import { format, differenceInCalendarDays } from "date-fns";
import { DateRange } from "react-day-picker";
import { Calendar as CalendarIcon, Clock, Paperclip, Upload, X, Folder } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { timeOffTypeLabels, TimeOffType } from "@/data/timeoff";

interface RequestTimeOffDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RequestTimeOffDialog({ open, onOpenChange }: RequestTimeOffDialogProps) {
  const [timeOffType, setTimeOffType] = useState<TimeOffType>("paid_time_off");
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: undefined,
  });
  const [note, setNote] = useState("");
  const [files, setFiles] = useState<File[]>([]);

  const handleSubmit = () => {
    console.log({ timeOffType, dateRange, note, files });
    onOpenChange(false);
  };

  const clearDates = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDateRange(undefined);
  };

  const daysCount = dateRange?.from
    ? dateRange.to
      ? differenceInCalendarDays(dateRange.to, dateRange.from) + 1
      : 1
    : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Request time off</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 mt-4">
          {/* Time off type */}
          <div className="space-y-2">
            <Label>Time off type</Label>
            <Select value={timeOffType} onValueChange={(v) => setTimeOffType(v as TimeOffType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(timeOffTypeLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Select the option that best describes your time off request.
            </p>
          </div>

          {/* Dates */}
          <div className="space-y-2">
            <Label>Dates</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-between text-left font-normal",
                    !dateRange?.from && "text-muted-foreground"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "MMM dd")} - {format(dateRange.to, "MMM dd, yyyy")}
                        </>
                      ) : (
                        format(dateRange.from, "MMM dd, yyyy")
                      )
                    ) : (
                      "Select dates"
                    )}
                  </div>
                  {dateRange?.from && (
                    <X
                      className="h-4 w-4 opacity-50 hover:opacity-100"
                      onClick={clearDates}
                    />
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={setDateRange}
                  initialFocus
                  numberOfMonths={1}
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
            <p className="text-sm text-muted-foreground">
              You can select one day or a range of days.
            </p>
          </div>

          {/* Note */}
          <div className="space-y-2">
            <Label>Note</Label>
            <Textarea
              placeholder="Automatic public holiday."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="min-h-[80px]"
            />
            <p className="text-sm text-muted-foreground">
              You can leave a message to the approver if needed.
            </p>
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <div className="border-2 border-dashed border-primary/30 rounded-lg p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-muted mx-auto mb-3 flex items-center justify-center">
                <Folder className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="font-medium">Drag or Drop your Receipts</p>
              <p className="text-sm text-muted-foreground mb-3">
                Maximum file size allowed is 20MB
              </p>
              <Button variant="outline" size="sm">
                <Upload className="w-4 h-4 mr-2" />
                Upload your files
              </Button>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Paperclip className="w-4 h-4" />
              <span>No file added</span>
            </div>
          </div>

          {/* Summary */}
          <div className="flex items-center gap-4 text-sm">
            <span>Request: <strong>{daysCount} day{daysCount !== 1 ? "s" : ""}</strong>.</span>
            <button className="flex items-center gap-1 text-primary hover:underline">
              <Clock className="w-4 h-4" />
              Edit hours
            </button>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button className="flex-1" onClick={handleSubmit}>
              Request time off
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
