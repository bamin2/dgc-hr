import { useState } from "react";
import { Plus, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useUnifiedRequests, UnifiedStatus } from "@/hooks/useUnifiedRequests";
import { MobileRequestCard } from "./MobileRequestCard";
import { MobileNewRequestSheet } from "./MobileNewRequestSheet";
import { Skeleton } from "@/components/ui/skeleton";

type FilterOption = "all" | UnifiedStatus;

const filterOptions: { value: FilterOption; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

export function MobileRequestsHub() {
  const [statusFilter, setStatusFilter] = useState<FilterOption>("all");
  const [newRequestOpen, setNewRequestOpen] = useState(false);
  
  const { data: requests, isLoading } = useUnifiedRequests(
    statusFilter === "all" ? undefined : statusFilter
  );

  return (
    <div className="flex flex-col h-full">
      {/* New Request Button */}
      <div className="px-4 pt-4 pb-3">
        <Button 
          onClick={() => setNewRequestOpen(true)}
          className="w-full min-h-[56px] text-base font-medium"
          size="lg"
        >
          <Plus className="h-5 w-5 mr-2" />
          New Request
        </Button>
      </div>

      {/* Filter Pills */}
      <div className="px-4 pb-3">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {filterOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setStatusFilter(option.value)}
              className={cn(
                "px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap",
                "min-h-[44px] transition-colors touch-manipulation",
                statusFilter === option.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground active:bg-muted/80"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Request List */}
      <div className="flex-1 overflow-y-auto px-4 pb-24">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-[88px] rounded-2xl" />
            ))}
          </div>
        ) : requests && requests.length > 0 ? (
          <div className="space-y-3">
            {requests.map((request) => (
              <MobileRequestCard key={`${request.type}-${request.id}`} request={request} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <Inbox className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-base font-medium mb-1">No requests found</h3>
            <p className="text-sm text-muted-foreground">
              {statusFilter === "all" 
                ? "Tap the button above to create your first request"
                : `No ${statusFilter} requests`}
            </p>
          </div>
        )}
      </div>

      {/* New Request Sheet */}
      <MobileNewRequestSheet open={newRequestOpen} onOpenChange={setNewRequestOpen} />
    </div>
  );
}
