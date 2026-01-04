import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { OnboardingStatus } from "@/data/onboarding";

interface OnboardingFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: OnboardingStatus | 'all';
  onStatusFilterChange: (status: OnboardingStatus | 'all') => void;
}

const statusButtons: { id: OnboardingStatus | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'Pending' },
  { id: 'scheduled', label: 'Scheduled' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'completed', label: 'Completed' },
  { id: 'incomplete', label: 'Incomplete' },
];

export function OnboardingFilters({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
}: OnboardingFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="relative w-full sm:w-80">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search employee..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {statusButtons.map((button) => (
          <button
            key={button.id}
            onClick={() => onStatusFilterChange(button.id)}
            className={cn(
              "px-3 py-1.5 rounded-full text-sm font-medium border transition-colors",
              statusFilter === button.id
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-foreground border-border hover:border-primary/50"
            )}
          >
            {button.label}
          </button>
        ))}
      </div>
    </div>
  );
}
