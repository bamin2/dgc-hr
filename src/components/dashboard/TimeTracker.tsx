import { useState, useEffect } from "react";
import { Play, Pause, Coffee } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function TimeTracker() {
  const [isRunning, setIsRunning] = useState(false);
  const [seconds, setSeconds] = useState(14523); // Start at 04:02:03

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning) {
      interval = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning]);

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
            <p className="text-sm opacity-70">Today's work session</p>
          </div>
          <div
            className={cn(
              "w-3 h-3 rounded-full",
              isRunning ? "bg-green-400 animate-pulse" : "bg-white/50"
            )}
          />
        </div>

        {/* Timer Display */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="text-center">
            <div className="text-5xl font-bold font-mono tracking-tight">
              {time.hours}
            </div>
            <div className="text-xs opacity-60 mt-1">HOURS</div>
          </div>
          <div className="text-5xl font-bold opacity-60">:</div>
          <div className="text-center">
            <div className="text-5xl font-bold font-mono tracking-tight">
              {time.minutes}
            </div>
            <div className="text-xs opacity-60 mt-1">MINUTES</div>
          </div>
          <div className="text-5xl font-bold opacity-60">:</div>
          <div className="text-center">
            <div className="text-5xl font-bold font-mono tracking-tight">
              {time.seconds}
            </div>
            <div className="text-xs opacity-60 mt-1">SECONDS</div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-3">
          <Button
            onClick={() => setIsRunning(!isRunning)}
            className={cn(
              "w-14 h-14 rounded-full shadow-lg transition-transform hover:scale-105",
              isRunning
                ? "bg-white/20 hover:bg-white/30"
                : "bg-white text-primary hover:bg-white/90"
            )}
          >
            {isRunning ? (
              <Pause className="w-6 h-6" />
            ) : (
              <Play className="w-6 h-6 ml-1" />
            )}
          </Button>
          <Button
            variant="ghost"
            className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white"
          >
            <Coffee className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </Card>
  );
}