import { Megaphone } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnnouncementsCardProps {
  collapsed: boolean;
}

export function AnnouncementsCard({ collapsed }: AnnouncementsCardProps) {
  if (collapsed) return null;

  return (
    <div className="mx-3 mb-4 p-4 rounded-xl bg-sidebar-accent/50 border border-sidebar-border">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-sidebar-primary/20 flex items-center justify-center shrink-0">
          <Megaphone className="w-5 h-5 text-sidebar-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-sidebar-foreground">
            Stay updated!
          </p>
          <p className="text-xs text-sidebar-muted mt-0.5">
            Get the latest company news and updates.
          </p>
          <a 
            href="#" 
            className="text-xs font-medium text-sidebar-primary hover:underline mt-2 inline-block"
          >
            View Announcements →
          </a>
        </div>
      </div>
    </div>
  );
}
