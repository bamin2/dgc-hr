import { Employee } from "@/data/employees";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface MentionSuggestionsProps {
  suggestions: Employee[];
  selectedIndex: number;
  onSelect: (employee: Employee) => void;
}

export function MentionSuggestions({ suggestions, selectedIndex, onSelect }: MentionSuggestionsProps) {
  if (suggestions.length === 0) return null;

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  return (
    <div className="absolute bottom-full left-0 right-0 mb-1 bg-popover border rounded-lg shadow-lg overflow-hidden z-50">
      <div className="max-h-[200px] overflow-y-auto">
        {suggestions.map((employee, index) => (
          <button
            key={employee.id}
            type="button"
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-accent transition-colors",
              index === selectedIndex && "bg-accent"
            )}
            onClick={() => onSelect(employee)}
          >
            <Avatar className="h-7 w-7">
              <AvatarImage src={employee.avatar} alt={`${employee.firstName} ${employee.lastName}`} />
              <AvatarFallback className="text-xs">
                {getInitials(employee.firstName, employee.lastName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {employee.firstName} {employee.lastName}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {employee.position}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
