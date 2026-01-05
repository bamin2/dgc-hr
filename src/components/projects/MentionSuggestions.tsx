import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export interface TeamMember {
  id: string;
  first_name: string;
  last_name: string;
  avatar_url: string | null;
  position?: { title: string } | null;
}

interface MentionSuggestionsProps {
  suggestions: TeamMember[];
  selectedIndex: number;
  onSelect: (member: TeamMember) => void;
}

export function MentionSuggestions({ suggestions, selectedIndex, onSelect }: MentionSuggestionsProps) {
  if (suggestions.length === 0) return null;

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  return (
    <div className="absolute bottom-full left-0 right-0 mb-1 bg-popover border rounded-lg shadow-lg overflow-hidden z-50">
      <div className="max-h-[200px] overflow-y-auto">
        {suggestions.map((member, index) => (
          <button
            key={member.id}
            type="button"
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-accent transition-colors",
              index === selectedIndex && "bg-accent"
            )}
            onClick={() => onSelect(member)}
          >
            <Avatar className="h-7 w-7">
              <AvatarImage src={member.avatar_url || ''} alt={`${member.first_name} ${member.last_name}`} />
              <AvatarFallback className="text-xs">
                {getInitials(member.first_name, member.last_name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {member.first_name} {member.last_name}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {member.position?.title || 'Team Member'}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
