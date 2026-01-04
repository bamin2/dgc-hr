import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Filter } from "lucide-react";

interface CalendarFiltersProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: {
    types: string[];
    platforms: string[];
    colors: string[];
  };
  onFiltersChange: (filters: { types: string[]; platforms: string[]; colors: string[] }) => void;
}

const eventTypes = [
  { value: "meeting", label: "Meetings" },
  { value: "event", label: "Events" },
  { value: "reminder", label: "Reminders" },
  { value: "task", label: "Tasks" },
];

const platforms = [
  { value: "zoom", label: "Zoom" },
  { value: "meet", label: "Google Meet" },
  { value: "teams", label: "Microsoft Teams" },
  { value: "slack", label: "Slack" },
  { value: "in-person", label: "In Person" },
];

const colors = [
  { value: "green", label: "Green", class: "bg-emerald-500" },
  { value: "orange", label: "Orange", class: "bg-orange-500" },
  { value: "coral", label: "Coral", class: "bg-rose-400" },
  { value: "mint", label: "Mint", class: "bg-teal-500" },
  { value: "blue", label: "Blue", class: "bg-blue-500" },
  { value: "purple", label: "Purple", class: "bg-purple-500" },
];

export function CalendarFilters({
  open,
  onOpenChange,
  filters,
  onFiltersChange,
}: CalendarFiltersProps) {
  const toggleFilter = (
    category: "types" | "platforms" | "colors",
    value: string
  ) => {
    const currentValues = filters[category];
    const newValues = currentValues.includes(value)
      ? currentValues.filter((v) => v !== value)
      : [...currentValues, value];
    onFiltersChange({ ...filters, [category]: newValues });
  };

  const clearFilters = () => {
    onFiltersChange({ types: [], platforms: [], colors: [] });
  };

  const activeFilterCount =
    filters.types.length + filters.platforms.length + filters.colors.length;

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Filter className="h-3.5 w-3.5" />
          Filter
          {activeFilterCount > 0 && (
            <span className="ml-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm">Filters</h4>
            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 text-xs text-muted-foreground"
                onClick={clearFilters}
              >
                Clear all
              </Button>
            )}
          </div>

          <div className="space-y-3">
            <h5 className="text-xs font-medium text-muted-foreground uppercase">
              Event Type
            </h5>
            {eventTypes.map((type) => (
              <div key={type.value} className="flex items-center gap-2">
                <Checkbox
                  id={`type-${type.value}`}
                  checked={filters.types.includes(type.value)}
                  onCheckedChange={() => toggleFilter("types", type.value)}
                />
                <Label
                  htmlFor={`type-${type.value}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {type.label}
                </Label>
              </div>
            ))}
          </div>

          <Separator />

          <div className="space-y-3">
            <h5 className="text-xs font-medium text-muted-foreground uppercase">
              Platform
            </h5>
            {platforms.map((platform) => (
              <div key={platform.value} className="flex items-center gap-2">
                <Checkbox
                  id={`platform-${platform.value}`}
                  checked={filters.platforms.includes(platform.value)}
                  onCheckedChange={() => toggleFilter("platforms", platform.value)}
                />
                <Label
                  htmlFor={`platform-${platform.value}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {platform.label}
                </Label>
              </div>
            ))}
          </div>

          <Separator />

          <div className="space-y-3">
            <h5 className="text-xs font-medium text-muted-foreground uppercase">
              Color
            </h5>
            <div className="flex flex-wrap gap-2">
              {colors.map((color) => (
                <button
                  key={color.value}
                  onClick={() => toggleFilter("colors", color.value)}
                  className={`h-6 w-6 rounded-full ${color.class} ${
                    filters.colors.includes(color.value)
                      ? "ring-2 ring-offset-2 ring-primary"
                      : ""
                  }`}
                  title={color.label}
                />
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
