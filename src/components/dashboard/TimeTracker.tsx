import { useState, useEffect } from "react";
import { Play, Square } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useClockInOut } from "@/hooks/useClockInOut";
import { format } from "date-fns";

// Safely parse a time string (HH:mm:ss or HH:mm:ss.SSS) into a Date
const parseTimeToDate = (timeStr: string | null | undefined): Date | null => {
  if (!timeStr) return null;
  try {
    const today = format(new Date(), "yyyy-MM-dd");
    const cleanTime = timeStr.split('.')[0]; // Remove milliseconds if present
    const date = new Date(`${today}T${cleanTime}`);
    return isNaN(date.getTime()) ? null : date;
  } catch {
    return null;
  }
};

export function TimeTracker() {
  const { todayRecord, isLoading, isClockedIn, isClockedOut, clockIn, clockOut, employeeId } =
    useClockInOut();
  const [seconds, setSeconds] = useState(0);

  // Calculate and update elapsed time
  useEffect(() => {
    if (!todayRecord?.check_in) {
      setSeconds(0);
      return;
    }

    const checkInTime = parseTimeToDate(todayRecord.check_in);
    if (!checkInTime) {
      setSeconds(0);
      return;
    }

    if (isClockedOut && todayRecord.check_out) {
      const checkOutTime = parseTimeToDate(todayRecord.check_out);
      if (checkOutTime) {
        const elapsed = Math.floor((checkOutTime.getTime() - checkInTime.getTime()) / 1000);
        setSeconds(Math.max(0, elapsed));
      }
      return;
    }

    if (isClockedIn) {
      const updateElapsed = () => {
        const now = new Date();
        const elapsed = Math.floor((now.getTime() - checkInTime.getTime()) / 1000);
        setSeconds(Math.max(0, elapsed));
      };

      updateElapsed();
      const interval = setInterval(updateElapsed, 1000);
      return () => clearInterval(interval);
    }
  }, [todayRecord, isClockedIn, isClockedOut]);

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return {
      hours: hours.toString().padStart(2, "0"),
      minutes: minutes.toString().padStart(2, "0"),
      seconds: secs.toString().padStart(2, "0"),
    };
  };

  const time = formatTime(seconds);

  const handleButtonClick = () => {
    if (!isClockedIn && !isClockedOut) {
      clockIn.mutate();
    } else if (isClockedIn) {
      clockOut.mutate();
    }
  };

  if (isLoading) {
    return (
      <Card className="p-6 bg-gradient-to-br from-primary via-primary to-primary/80">
        <Skeleton className="h-6 w-32 bg-white/20 mb-2" />
        <Skeleton className="h-4 w-24 bg-white/20 mb-6" />
        <Skeleton className="h-16 w-full bg-white/20 mb-6" />
        <Skeleton className="h-14 w-14 rounded-full bg-white/20 mx-auto" />
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-gradient-to-br from-primary via-primary to-primary/80 text-primary-foreground overflow-hidden relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold opacity-90">Time Tracker</h3>
            <p className="text-sm opacity-70">
              {isClockedOut
                ? "Completed for today"
                : isClockedIn
                ? "Currently working"
                : "Today's work session"}
            </p>
          </div>
          <div
            className={cn(
              "w-3 h-3 rounded-full",
              isClockedIn ? "bg-green-400 animate-pulse" : "bg-white/50"
            )}
          />
        </div>

        {/* Timer Display */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="text-center">
            <div className="text-5xl font-semibold font-mono tracking-tight">
              {time.hours}
            </div>
            <div className="text-xs opacity-60 mt-1">HOURS</div>
          </div>
          <div className="text-5xl font-semibold opacity-60">:</div>
          <div className="text-center">
            <div className="text-5xl font-semibold font-mono tracking-tight">
              {time.minutes}
            </div>
            <div className="text-xs opacity-60 mt-1">MINUTES</div>
          </div>
          <div className="text-5xl font-semibold opacity-60">:</div>
          <div className="text-center">
            <div className="text-5xl font-semibold font-mono tracking-tight">
              {time.seconds}
            </div>
            <div className="text-xs opacity-60 mt-1">SECONDS</div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center">
          {!employeeId ? (
            <p className="text-sm opacity-70">No employee profile linked</p>
          ) : isClockedOut ? (
            <p className="text-sm opacity-70">You've completed your work session</p>
          ) : (
            <Button
              onClick={handleButtonClick}
              disabled={clockIn.isPending || clockOut.isPending}
              className={cn(
                "w-14 h-14 rounded-full shadow-lg transition-transform hover:scale-105",
                isClockedIn
                  ? "bg-white/20 hover:bg-white/30"
                  : "bg-white text-primary hover:bg-white/90"
              )}
            >
              {isClockedIn ? (
                <Square className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6 ml-1" />
              )}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
